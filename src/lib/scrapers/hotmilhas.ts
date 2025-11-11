import { load } from "cheerio";
import { ScrapeResult, Scraper } from "@/lib/scrapers/types";
import { calculateMilheiro } from "@/lib/utils/calculateMilheiro";

// Heurística: Procurar valores com padrão R$ X,XX e blocos com 'milhas' próximos, como fallback usar um seletor popular
export const scrapeHotMilhas: Scraper = async ({ sourceId }) => {
  try {
    const res = await fetch("https://www.hotmilhas.com.br/", {
      // evitar cache e enviar um user agent plausível
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

    // 1) Tentar JSON-LD (schema.org) com ofertas
    $("script[type='application/ld+json']").each((_, el) => {
      if (price && miles) return; // já achamos
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
            // tentar extrair milhas do nome/descrição
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
        // ignore JSON parse errors
      }
    });

    // 2) Seletores comuns (classes genéricas de preço e milhas)
    if (!price || !miles) {
      // encontrar elementos com preço
      const priceEl =
        $("[data-testid*='price'], [class*='price'], [class*='valor'], [class*='amount']")
          .filter((_, el) => /R\$/i.test($(el).text()))
          .first();
      if (priceEl.length) {
        const txt = priceEl.text();
        const m = txt.match(/R\$\s*([0-9\.]+,[0-9]{2})/);
        if (m) {
          price = parseFloat(m[1].replace(/\./g, "").replace(",", "."));
        }
      }

      // encontrar elementos com milhas
      const milesEl =
        $("[data-testid*='mile'], [class*='milha'], [class*='milhas'], [class*='miles']")
          .filter((_, el) => /milha/i.test($(el).text()))
          .first();
      if (milesEl.length) {
        const txt = milesEl.text();
        const m = txt.match(/([0-9\.]{3,})\s*milhas/i);
        if (m) {
          miles = parseInt(m[1].replace(/\./g, ""), 10);
        }
      }
    }

    // 3) Fallback: proximidade no texto completo
    if (!price || !miles) {
      const bodyHtml = $("body").html() || html;
      const priceRegex = /R\$\s*([0-9\.]+,[0-9]{2})/g;
      const milesRegex = /([0-9\.]{3,})\s*(milhas|milha)/gi;

      const priceMatches = Array.from(bodyHtml.matchAll(priceRegex));
      const milesMatches = Array.from(bodyHtml.matchAll(milesRegex));

      if (priceMatches.length && milesMatches.length) {
        // Heurística: pares mais próximos no string index
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

    return null;
  } catch {
    return null;
  }
};
