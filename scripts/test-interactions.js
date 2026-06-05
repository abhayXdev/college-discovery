const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  
  try {
    const page = await browser.newPage();
    
    // Capture console errors
    page.on('console', msg => {
      console.log(`[BROWSER ${msg.type().toUpperCase()}] ${msg.text()}`);
    });
    page.on('pageerror', error => {
      console.log(`[PAGE ERROR] ${error.message}`);
    });
    page.on('requestfailed', request => {
      console.log(`[NETWORK FAIL] ${request.url()} - ${request.failure().errorText}`);
    });

    console.log("\n\n=== TESTING HOME SEARCH ===");
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    
    console.log("Typing 'IIT' in search...");
    await page.type('input[placeholder="ENTITY_NAME"]', 'IIT');
    await new Promise(r => setTimeout(r, 1000));
    
    console.log("Clicking Search button...");
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 2000));
    
    let mainHTML = await page.evaluate(() => document.querySelector('main')?.innerHTML || '');
    console.log(`[HOME HTML LENGTH] ${mainHTML.length}`);
    if (mainHTML.includes("ZERO_RECORDS_MATCHED")) {
      console.log("[HOME RESULT] ZERO_RECORDS_MATCHED is visible.");
    } else {
      console.log("[HOME RESULT] Results are visible.");
    }

    console.log("\n\n=== TESTING PREDICTOR ===");
    await page.goto('http://localhost:3000/predictor', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    
    console.log("Filling form...");
    await page.type('input[placeholder="ENTER_RANK_VALUE"]', '500');
    await page.type('input[placeholder="ENTER_BUDGET_CAP"]', '200000');
    
    console.log("Clicking Predict button...");
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 2000));
    
    mainHTML = await page.evaluate(() => document.querySelector('main')?.innerHTML || '');
    if (mainHTML.includes("ERROR_LOG")) {
      console.log("[PREDICTOR RESULT] Error log is visible.");
    } else if (mainHTML.includes("MATCH_PROBABILITY")) {
      console.log("[PREDICTOR RESULT] Matches found.");
    } else {
      console.log("[PREDICTOR RESULT] No matches or errors. Form cleared?");
    }

    console.log("\n\n=== TESTING DISCUSSIONS ===");
    await page.goto('http://localhost:3000/discussions', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    
    mainHTML = await page.evaluate(() => document.querySelector('main')?.innerHTML || '');
    if (mainHTML.includes("SYNCING_COMMUNITY_THREADS")) {
      console.log("[DISCUSSIONS RESULT] Still syncing...");
    } else {
      console.log("[DISCUSSIONS RESULT] Threads rendered.");
    }

  } catch (err) {
    console.error("TEST SCRIPT ERROR:", err);
  } finally {
    await browser.close();
  }
})();
