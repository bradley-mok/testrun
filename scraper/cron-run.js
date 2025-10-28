// scraper/cron-run.js
const cron = require("node-cron");
const { scrapeAndSave } = require("./scraper");

console.log("Starting real-time scraper...");

// Run every 10 seconds
cron.schedule("*/10 * * * * *", async () => {
  console.log("Scraping...", new Date().toISOString());
  await scrapeAndSave();
});