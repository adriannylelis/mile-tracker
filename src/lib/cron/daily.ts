import cron from "node-cron";
import { runAllScrapers } from "@/lib/scrapers";
import logger from "@/lib/utils/logger";

// Call setupDailyCron() from a server-only entrypoint if you want to enable local cron
export function setupDailyCron() {
  const job = cron.schedule(
    "0 3 * * *",
    async () => {
      logger.info("Cron job started: daily scraping");
      try {
        const inserted = await runAllScrapers();
        logger.info("Cron job finished", { inserted: inserted.length });
      } catch (e) {
        logger.error("Cron job failed", e);
      }
    },
    { timezone: "America/Sao_Paulo" }
  );

  return job;
}
