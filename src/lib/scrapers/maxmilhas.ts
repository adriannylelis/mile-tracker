import { load } from "cheerio";
import { Scraper, ScrapeResult } from "@/lib/scrapers/types";
import { calculateMilheiro } from "@/lib/utils/calculateMilheiro";

// Estratégia multi-camada parecida com HotMilhas:
// 1) Tentar JSON-LD (offers)
// 2) Seletores comuns (classes com price/valor e milhas)
// 3) Fallback: proximidade regex entre R$ e "milhas"
export const scrapeMaxMilhas: Scraper = async ({ sourceId }) => {
  try {
    // Primeiro, tentar com fetch + cheerio (rápido)
    const res = await fetch("https://www.maxmilhas.com.br/", {
      cache: "no-store",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    const html = await res.text();
    const $ = load(html);

    let price: number | null = null;
    let miles: number | null = null;

    // 1) JSON-LD
    $("script[type='application/ld+json']").each((_, el) => {
      if (price && miles) return;
      const raw = $(el).contents().text();
      try {
        const json = JSON.parse(raw);
        const items = Array.isArray(json) ? json : [json];
        for (const it of items) {
          const offer = it?.offers || it?.Offer || it?.offer;
          const name = (it?.name || it?.headline || "") as string;
          if (offer && typeof offer === "object") {
            const p = parseFloat(String(offer.price ?? offer.lowPrice ?? offer.highPrice ?? "").replace(",", "."));
            if (!Number.isFinite(p)) continue;
            const candidate = (name + " " + (it?.description || "")).toLowerCase();
            const mm = candidate.match(/([0-9\.]{3,})\s*milhas/);
            if (mm) {
              const m = parseInt(mm[1].replace(/\./g, ""), 10);
              if (m > 0) {
                price = p;
                miles = m;
                break;
              }
            }
          }
        }
      } catch {
        // ignore
      }
    });

    // 2) Seletores comuns
    if (!price || !miles) {
      const priceEl =
        $("[data-testid*='price'], [class*='price'], [class*='preco'], [class*='valor'], [class*='amount']")
          .filter((_, el) => /R\$/i.test($(el).text()))
          .first();
      if (priceEl.length) {
        const txt = priceEl.text();
        const m = txt.match(/R\$\s*([0-9\.]+,[0-9]{2})/);
        if (m) price = parseFloat(m[1].replace(/\./g, "").replace(",", "."));
      }

      const milesEl =
        $("[data-testid*='milha'], [data-testid*='mile'], [class*='milha'], [class*='milhas'], [class*='miles']")
          .filter((_, el) => /milha/i.test($(el).text()))
          .first();
      if (milesEl.length) {
        const txt = milesEl.text();
        const mm = txt.match(/([0-9\.]{3,})\s*milhas/i);
        if (mm) miles = parseInt(mm[1].replace(/\./g, ""), 10);
      }
    }

  // 3) Fallback regex por proximidade
    if (!price || !miles) {
      const bodyHtml = $("body").html() || html;
      const priceRegex = /R\$\s*([0-9\.]+,[0-9]{2})/g;
      const milesRegex = /([0-9\.]{3,})\s*(milhas|milha)/gi;
      const priceMatches = Array.from(bodyHtml.matchAll(priceRegex));
      const milesMatches = Array.from(bodyHtml.matchAll(milesRegex));
      if (priceMatches.length && milesMatches.length) {
        let bestDist = Infinity;
        let bestPair: { p: string; m: string } | null = null;
        for (const p of priceMatches) {
          for (const m of milesMatches) {
            const dist = Math.abs((p.index ?? 0) - (m.index ?? 0));
            if (dist < bestDist) {
              bestDist = dist;
              bestPair = { p: p[1], m: m[1] };
            }
          }
        }
        if (bestPair) {
          price = parseFloat(bestPair.p.replace(/\./g, "").replace(",", "."));
          miles = parseInt(bestPair.m.replace(/\./g, ""), 10);
        }
      }
    }

    if (price && miles) {
      return { sourceId, price, milheiro: calculateMilheiro(price, miles) } satisfies ScrapeResult;
    }

    // 4) Último recurso: usar Playwright para renderizar a página e extrair elementos dinâmicos
  // import dinâmico para evitar problemas de build quando playwright não estiver disponível localmente
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox" ] });
    try {
      const page = await browser.newPage();
      await page.goto("https://www.maxmilhas.com.br/", { waitUntil: "domcontentloaded", timeout: 30000 });
      // Aguardar possíveis cards de ofertas ou elementos contendo 'milhas'
      await page.waitForTimeout(2000);
      const content = await page.content();
      const $$ = load(content);

      // Reutilizar as mesmas heurísticas no HTML renderizado
      let p: number | null = null;
      let mls: number | null = null;

      const priceEl =
        $$("[data-testid*='price'], [class*='price'], [class*='preco'], [class*='valor'], [class*='amount']")
          .filter((_, el) => /R\$/i.test($$(el).text()))
          .first();
      if (priceEl.length) {
        const txt = priceEl.text();
        const mm = txt.match(/R\$\s*([0-9\.]+,[0-9]{2})/);
        if (mm) p = parseFloat(mm[1].replace(/\./g, "").replace(",", "."));
      }

      const milesEl =
        $$("[data-testid*='milha'], [data-testid*='mile'], [class*='milha'], [class*='milhas'], [class*='miles']")
          .filter((_, el) => /milha/i.test($$(el).text()))
          .first();
      if (milesEl.length) {
        const txt = milesEl.text();
        const mm = txt.match(/([0-9\.]{3,})\s*milhas/i);
        if (mm) mls = parseInt(mm[1].replace(/\./g, ""), 10);
      }

      if (!p || !mls) {
        const bodyHtml = $$("body").html() || content;
        const priceRegex = /R\$\s*([0-9\.]+,[0-9]{2})/g;
        const milesRegex = /([0-9\.]{3,})\s*(milhas|milha)/gi;
        const priceMatches = Array.from(bodyHtml.matchAll(priceRegex)) as RegExpMatchArray[];
        const milesMatches = Array.from(bodyHtml.matchAll(milesRegex)) as RegExpMatchArray[];
        if (priceMatches.length && milesMatches.length) {
          let bestDist = Infinity;
          let bestPair: { p: string; m: string } | null = null;
          for (const pp of priceMatches) {
            for (const mm2 of milesMatches) {
              const dist = Math.abs(((pp.index ?? 0) as number) - ((mm2.index ?? 0) as number));
              if (dist < bestDist) {
                bestDist = dist;
                bestPair = { p: pp[1] as string, m: mm2[1] as string };
              }
            }
          }
          if (bestPair) {
            p = parseFloat(bestPair.p.replace(/\./g, "").replace(",", "."));
            mls = parseInt(bestPair.m.replace(/\./g, ""), 10);
          }
        }
      }

      if (p && mls) {
        return { sourceId, price: p, milheiro: calculateMilheiro(p, mls) } satisfies ScrapeResult;
      }

      return null;
    } finally {
      await browser.close();
    }
  } catch {
    return null;
  }
};
