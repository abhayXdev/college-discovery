const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  
  try {
    const page = await browser.newPage();
    
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        console.log(`[BROWSER ${msg.type().toUpperCase()}] ${msg.text()}`);
      }
    });

    page.on('request', request => {
      if (request.url().includes('/api/')) {
        console.log(`[API REQ] ${request.url()}`);
      }
    });

    page.on('response', async response => {
      if (response.url().includes('/api/')) {
        let text = "";
        try { text = await response.text(); } catch(e) {}
        console.log(`[API RES] ${response.status()} - ${text.slice(0, 100)}...`);
      }
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
    
    const mainHTML = await page.evaluate(() => document.querySelector('main')?.innerHTML || '');
    if (mainHTML.includes("ZERO_RECORDS_MATCHED")) {
      console.log("[HOME RESULT] ZERO_RECORDS_MATCHED is visible.");
    } else {
      console.log("[HOME RESULT] Results are visible.");
    }

  } catch (err) {
    console.error("TEST SCRIPT ERROR:", err);
  } finally {
    await browser.close();
  }
})();
