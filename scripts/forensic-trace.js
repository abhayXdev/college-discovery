const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  
  async function tracePage(url, name, interactions = null) {
    console.log(`\n--- TRACING ${name} (${url}) ---`);
    const page = await browser.newPage();
    
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (!text.includes('React DevTools')) {
        console.log(`[CONSOLE ${msg.type().toUpperCase()}] ${text}`);
      }
    });
    page.on('pageerror', err => console.log(`[PAGE_ERROR] ${err.message}`));
    
    const network = [];
    page.on('request', req => {
      if (req.url().includes('/api/')) {
        network.push({ url: req.url(), method: req.method() });
      }
    });
    
    page.on('response', async res => {
      if (res.url().includes('/api/')) {
        let body = "";
        try { body = await res.text(); } catch(e) {}
        console.log(`[NETWORK RES] ${res.status()} ${res.url()} - ${body.slice(0, 100)}...`);
      }
    });

    await page.goto(url, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    if (interactions) await interactions(page);
    
    await new Promise(r => setTimeout(r, 2000));
    
    const mainHTML = await page.evaluate(() => document.querySelector('main')?.innerHTML || 'EMPTY_MAIN');
    console.log(`[FINAL_UI_STATE] Includes 'ZERO_RECORDS_MATCHED': ${mainHTML.includes('ZERO_RECORDS_MATCHED')}`);
    console.log(`[FINAL_UI_STATE] Includes 'SYNCING_COMMUNITY_THREADS': ${mainHTML.includes('SYNCING_COMMUNITY_THREADS')}`);
    console.log(`[FINAL_UI_STATE] Includes 'MATCH_PROBABILITY': ${mainHTML.includes('MATCH_PROBABILITY')}`);
    
    await page.close();
  }

  try {
    // 1. Home Search Trace
    await tracePage('http://localhost:3000/', 'Home Search', async (page) => {
      console.log("Action: Searching for 'IIT'...");
      await page.type('input[placeholder="ENTITY_NAME"]', 'IIT');
      await page.click('button[type="submit"]');
    });

    // 2. Predictor Trace
    await tracePage('http://localhost:3000/predictor', 'Predictor', async (page) => {
      console.log("Action: Submitting Predictor...");
      await page.type('input[placeholder="ENTER_RANK_VALUE"]', '500');
      await page.type('input[placeholder="ENTER_BUDGET_CAP"]', '200000');
      await page.click('button[type="submit"]');
    });

    // 3. Discussions Trace
    await tracePage('http://localhost:3000/discussions', 'Discussions');

  } catch (err) {
    console.error("TRACE_SCRIPT_ERROR:", err);
  } finally {
    await browser.close();
  }
})();
