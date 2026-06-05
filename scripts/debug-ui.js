const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  
  async function traceFlow(url, name, interactions = null) {
    console.log(`\n=== FORENSIC TRACE: ${name} ===`);
    const page = await browser.newPage();
    
    // Capture EVERYTHING
    page.on('console', msg => console.log(`[BROWSER ${msg.type().toUpperCase()}] ${msg.text()}`));
    page.on('pageerror', err => console.log(`[FATAL ERROR] ${err.message}`));
    
    page.on('request', req => {
      if (req.url().includes('/api/')) console.log(`[FETCH REQ] ${req.method()} ${req.url()}`);
    });
    
    page.on('response', async res => {
      if (res.url().includes('/api/')) {
        const text = await res.text().catch(() => "BLOB");
        console.log(`[FETCH RES] ${res.status()} ${res.url().split('/').pop()} -> ${text.slice(0, 100)}`);
      }
    });

    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    const initialMain = await page.evaluate(() => document.querySelector('main')?.innerHTML || 'EMPTY');
    console.log(`[INITIAL UI] Items Rendered: ${initialMain.includes('border-black')}`);
    
    if (interactions) {
        console.log("Executing interactions...");
        await interactions(page);
        await new Promise(r => setTimeout(r, 2000));
        const finalMain = await page.evaluate(() => document.querySelector('main')?.innerHTML || 'EMPTY');
        console.log(`[FINAL UI] Results Found: ${finalMain.includes('MATCH_PROBABILITY') || finalMain.includes('ADD_QUEUE')}`);
    }

    await page.close();
  }

  try {
    // Test 1: Search Flow
    await traceFlow('http://localhost:3000/', 'Home Search', async (page) => {
      await page.type('input[placeholder="ENTITY_NAME"]', 'Indian');
      await page.click('button[type="submit"]');
    });

    // Test 2: Predictor Flow
    await traceFlow('http://localhost:3000/predictor', 'Predictor', async (page) => {
      await page.type('input[placeholder="ENTER_RANK_VALUE"]', '500');
      await page.type('input[placeholder="ENTER_BUDGET_CAP"]', '200000');
      await page.click('button[type="submit"]');
    });

    // Test 3: Discussions
    await traceFlow('http://localhost:3000/discussions', 'Discussions');

  } catch (err) {
    console.error("DEBUG_FAIL:", err);
  } finally {
    await browser.close();
  }
})();
