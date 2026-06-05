const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  
  async function testPage(url, pageName) {
    console.log(`\n\n=== TESTING ${pageName} (${url}) ===`);
    const page = await browser.newPage();
    
    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
      }
    });

    // Capture page errors (unhandled exceptions)
    page.on('pageerror', error => {
      console.log(`[PAGE ERROR] ${error.message}`);
    });

    // Capture failed network requests
    page.on('requestfailed', request => {
      console.log(`[NETWORK FAIL] ${request.url()} - ${request.failure().errorText}`);
    });

    await page.goto(url, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000)); // wait for renders/fetches
    
    // Check what is rendered
    const mainHTML = await page.evaluate(() => {
      const main = document.querySelector('main');
      return main ? main.innerHTML : document.body.innerHTML;
    });
    console.log(`[MAIN PREVIEW END] ${mainHTML.replace(/\n/g, ' ').slice(-1000)}...`);
    
    // Specifically for Predictor: test form submission
    if (pageName === 'Predictor') {
      console.log("\n[TESTING PREDICTOR SUBMISSION]");
      await page.evaluate(() => {
        const btn = document.querySelector('button[type="submit"]');
        if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 2000));
    }

    await page.close();
  }

  try {
    await testPage('http://localhost:3000/', 'Home');
    await testPage('http://localhost:3000/predictor', 'Predictor');
    await testPage('http://localhost:3000/discussions', 'Discussions');
  } catch (err) {
    console.error("TEST SCRIPT ERROR:", err);
  } finally {
    await browser.close();
  }
})();
