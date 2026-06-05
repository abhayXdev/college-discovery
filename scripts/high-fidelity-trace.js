const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  
  async function performDetailedTrace(url, name, interactions = null) {
    console.log(`\n\n==========================================`);
    console.log(`   FORENSIC AUDIT: ${name}`);
    console.log(`   URL: ${url}`);
    console.log(`==========================================`);
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // 1. Capture ALL Console Output
    page.on('console', msg => {
      console.log(`[BROWSER_${msg.type().toUpperCase()}] ${msg.text()}`);
    });

    // 2. Capture Page Errors
    page.on('pageerror', err => {
      console.log(`[CRITICAL_JS_ERROR] ${err.message}\nSTACK: ${err.stack}`);
    });

    // 3. Capture Network Traffic with Payloads
    page.on('request', req => {
      if (req.url().includes('/api/')) {
        console.log(`[REQ] ${req.method()} ${req.url()}`);
      }
    });

    page.on('response', async res => {
      if (res.url().includes('/api/')) {
        const status = res.status();
        let body = "";
        try {
          body = await res.text();
        } catch (e) {
          body = "[UNABLE TO READ BODY]";
        }
        console.log(`[RES] ${status} ${res.url().split('/').pop().split('?')[0]} -> ${body.slice(0, 300)}...`);
      }
    });

    // 4. Navigate and Wait
    console.log(`Navigating...`);
    await page.goto(url, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));

    // 5. Execute Interactions if provided
    if (interactions) {
      console.log(`Executing interactions...`);
      await interactions(page);
      await new Promise(r => setTimeout(r, 3000));
    }

    // 6. Inspect Final Rendered State
    const audit = await page.evaluate(() => {
      const main = document.querySelector('main');
      const html = main ? main.innerHTML : "";
      return {
        hasColleges: html.includes('Institutional_Database') && html.includes('PROFILE →'),
        hasEmptyState: html.includes('ZERO_RECORDS_MATCHED'),
        hasLoadingState: html.includes('SYNCING_COMMUNITY_THREADS') || html.includes('FETCHING_RECORDS_STREAM'),
        hasPredictorResults: html.includes('MATCH_PROBABILITY'),
        errorBanner: html.includes('ERROR_LOG') || html.includes('COMMUNICATION_FAILURE'),
        itemCount: document.querySelectorAll('[href^="/college/"]').length
      };
    });

    console.log(`[AUDIT_RESULT]`, JSON.stringify(audit, null, 2));

    await page.close();
  }

  try {
    // AUDIT 1: Home Page (Initial Load + IIT Search)
    await performDetailedTrace('http://localhost:3000/', 'Home & Search', async (page) => {
      console.log("Interaction: Typing 'IIT'...");
      await page.type('input[placeholder="ENTITY_NAME"]', 'IIT');
      await page.click('button[type="submit"]');
    });

    // AUDIT 2: Predictor Page
    await performDetailedTrace('http://localhost:3000/predictor', 'Predictor Tool', async (page) => {
      console.log("Interaction: Submitting high-rank/budget query...");
      await page.type('input[placeholder="ENTER_RANK_VALUE"]', '500');
      await page.type('input[placeholder="ENTER_BUDGET_CAP"]', '200000');
      await page.click('button[type="submit"]');
    });

    // AUDIT 3: Discussions Page
    await performDetailedTrace('http://localhost:3000/discussions', 'Community Feed');

  } catch (err) {
    console.error("AUDIT_PROCESS_FAILED:", err);
  } finally {
    await browser.close();
  }
})();
