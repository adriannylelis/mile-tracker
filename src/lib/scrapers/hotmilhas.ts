import { ScrapeResult } from "@/lib/scrapers/types";

export async function scrapeHotMilhas(): Promise<ScrapeResult | null> {
  // Placeholder: In a real scraper, we'd fetch the page and parse with Cheerio
  // For now, return null to indicate not implemented
  try {
    // Example:
    // const html = await fetch("https://www.hotmilhas.com.br/").then(r => r.text());
    // const $ = load(html);
    // const price = ...;
    // const miles = ...;
    // return { sourceId, price, milheiro: calculateMilheiro(price, miles) };
    return null;
  } catch {
    return null;
  }
}
