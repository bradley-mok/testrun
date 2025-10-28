const axios = require("axios");
const { load } = require("cheerio");
const supabase = require("./supabaseClient");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const TARGET_URL = process.env.TARGET_URL || "https://amtrends.co.za/market-pricesv2/";
const USER_AGENT = "FarmConnectScraper/1.0";

function parseNumber(str) {
  if (!str && str !== 0) return null;
  
  // Handle South African number format: "R 3 755,00" -> 3755.00
  const cleaned = String(str)
    .replace(/[R\s]/g, "")  // Remove R and spaces
    .replace(/,/g, ".");    // Replace comma with dot for decimal
  
  const numberMatch = cleaned.match(/\d+\.?\d*/);
  return numberMatch ? parseFloat(numberMatch[0]) : null;
}

function parsePercentage(str) {
  if (!str) return 0;
  const cleaned = String(str).replace(/%/g, "").trim();
  const numberMatch = cleaned.match(/-?\d+\.?\d*/);
  return numberMatch ? parseFloat(numberMatch[0]) : 0;
}

async function fetchHtml(url) {
  const resp = await axios.get(url, {
    headers: { "User-Agent": USER_AGENT },
    timeout: 20000,
  });
  return resp.data;
}

async function scrapeAndSave() {
  console.log("Scrape start", new Date().toISOString());
  try {
    const html = await fetchHtml(TARGET_URL);
    const $ = load(html);

    const allRows = [];

    // Process only the three tabs we need
    const sections = [
      "#tab-content-Grains", 
      "#tab-content-Fruits", 
      "#tab-content-Vegetables"
    ];

    sections.forEach((selector) => {
      const $section = $(selector);
      if (!$section.length) {
        console.log(`Section not found: ${selector}`);
        return;
      }

      console.log(`Processing section: ${selector}`);

      $section.find("table").each((i, table) => {
        const headers = [];
        
        // Get headers from thead or first row
        $(table).find("thead th").each((j, th) => {
          headers.push($(th).text().trim());
        });

        if (headers.length === 0) {
          $(table).find("tr").first().find("td, th").each((j, cell) => {
            headers.push($(cell).text().trim());
          });
        }

        console.log(`Headers found:`, headers);

        // Process each data row
        $(table).find("tbody tr").each((j, tr) => {
          const row = {};
          const cells = $(tr).find("td");
          
          if (cells.length >= 6) { // We need at least 6 columns based on your data
            // Map based on ACTUAL column order from your example:
            // Product Name, Price, Quantity Type, Date, Change, Previous Price
            row.crop_name = $(cells[0]).text().trim();
            row.current_price = $(cells[1]).text().trim(); // "Price" column
            row.unit = $(cells[2]).text().trim(); // "Quantity Type" column
            row.last_updated = $(cells[3]).text().trim(); // "Date" column
            row.price_change = $(cells[4]).text().trim(); // "Change" column
            row.previous_price = $(cells[5]).text().trim(); // "Previous Price" column
            
            // Add market/section info
            if (selector === "#tab-content-Grains") row.market = "Grains Market";
            else if (selector === "#tab-content-Fruits") row.market = "Fruits Market";
            else if (selector === "#tab-content-Vegetables") row.market = "Vegetables Market";
            
            if (row.crop_name && row.crop_name !== "Product Name") {
              console.log(`Found: ${row.crop_name} - ${row.current_price}`);
              allRows.push(row);
            }
          }
        });
      });
    });

    console.log(`Total rows found: ${allRows.length}`);

    if (allRows.length === 0) {
      console.log("No data found - checking HTML structure...");
      // Debug: log first 500 chars of each section
      sections.forEach((selector) => {
        const $section = $(selector);
        if ($section.length) {
          console.log(`Content in ${selector}:`, $section.html().substring(0, 500));
        }
      });
      return;
    }

    // Clean and process the data
    const items = allRows.map((r) => {
      const current_price = parseNumber(r.current_price) || 0;
      const previous_price = parseNumber(r.previous_price) || current_price;
      const price_change = parsePercentage(r.price_change) || 0;

      return {
        crop_name: r.crop_name.trim(),
        current_price: current_price,
        previous_price: previous_price,
        price_change: price_change,
        trend: price_change > 0 ? "up" : price_change < 0 ? "down" : "stable",
        unit: r.unit || "per kg",
        market: r.market || "Unknown Market",
        volume: "",
        last_updated: r.last_updated ? new Date(r.last_updated).toISOString() : new Date().toISOString(),
        region: "South Africa"
      };
    });

    console.log("Sample processed items:", items.slice(0, 3));

    // Save to database
    const res = await upsertToSupabase(items);
    console.log("Scrape completed successfully", res);

  } catch (err) {
    console.error("Scrape error:", err.message ?? err);
  }
}

async function upsertToSupabase(items) {
  if (!items || !items.length) {
    console.log("No items to insert.");
    return { inserted: 0 };
  }
  
  try {
    // FIX: Remove last_updated from conflict target
    const { data, error } = await supabase
      .from("market_prices")
      .upsert(items, { onConflict: "crop_name, market" }); // ← Only these two
    
    if (error) throw error;
    console.log(`Upserted ${data?.length ?? items.length} rows.`);
    return { inserted: data?.length ?? items.length };
  } catch (e) {
    console.warn("Upsert failed:", e.message);
    
    // Fallback to individual inserts with duplicate check
    let count = 0;
    for (const row of items) {
      // First try to update existing record
      const { error: updateError } = await supabase
        .from("market_prices")
        .update(row)
        .eq('crop_name', row.crop_name)
        .eq('market', row.market);
      
      // If no record exists, insert
      if (updateError) {
        const { error: insertError } = await supabase.from("market_prices").insert(row);
        if (!insertError) count++;
      } else {
        count++;
      }
    }
    return { inserted: count };
  }
}

module.exports = { scrapeAndSave };

// Run directly
if (require.main === module) {
  scrapeAndSave().catch(console.error);
}