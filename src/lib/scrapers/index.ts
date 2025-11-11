import prisma from "@/lib/db";
import { SOURCES } from "@/lib/constants/sources";
import { scrapeHotMilhas } from "@/lib/scrapers/hotmilhas";
import { scrapeMaxMilhas } from "@/lib/scrapers/maxmilhas";
import { scrape123Milhas } from "@/lib/scrapers/123milhas";
import { scrapeComproMilhas } from "@/lib/scrapers/compromilhas";
import logger from "@/lib/utils/logger";

export async function ensureSources() {
  // Ensure sources exist in DB based on constants (using find/create since name is not unique)
  const map: Record<string, string> = {};
  for (const s of SOURCES) {
    let existing = await prisma.mileageSource.findFirst({
      where: { name: s.name, url: s.url, program: s.program },
    });
    if (!existing) {
      existing = await prisma.mileageSource.create({
        data: { name: s.name, url: s.url, program: s.program },
      });
    }
    map[s.name] = existing.id;
  }
  return map;
}

export async function runAllScrapers() {
  const map = await ensureSources();

  const tasks: Array<Promise<unknown | null>> = [
    (async () => {
      const res = await scrapeHotMilhas({ sourceId: map["HotMilhas"] });
      if (!res) return null;
      return prisma.mileagePrice.create({ data: { ...res } });
    })(),
    (async () => {
      const res = await scrapeMaxMilhas({ sourceId: map["MaxMilhas"] });
      if (!res) return null;
      return prisma.mileagePrice.create({ data: { ...res } });
    })(),
    (async () => {
      const res = await scrape123Milhas({ sourceId: map["123Milhas"] });
      if (!res) return null;
      return prisma.mileagePrice.create({ data: { ...res } });
    })(),
    (async () => {
      const res = await scrapeComproMilhas({ sourceId: map["ComproMilhas"] });
      if (!res) return null;
      return prisma.mileagePrice.create({ data: { ...res } });
    })(),
  ];

  const outputs = await Promise.all(tasks);
  const created = outputs.filter(Boolean);
  logger.info("Scraping finished", { created: created.length });
  return created;
}

export type { };
