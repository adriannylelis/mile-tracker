export type ScrapeResult = {
  sourceId: string;
  price: number; // BRL total price paid
  milheiro: number; // price per 1,000 miles
};

export type Scraper = (args: { sourceId: string }) => Promise<ScrapeResult | null>;
