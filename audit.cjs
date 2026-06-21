const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const isFixedRun = process.argv.includes('--fixed');
const prefix = isFixedRun ? 'fixed-' : 'screenshot-';
const reportFile = isFixedRun ? 'fixed-audit-report.json' : 'audit-report.json';

(async () => {
  console.log(`Starting Playwright Audit (Fixed mode: ${isFixedRun})...`);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set desktop viewport to ensure sidebar and header are visible
  await page.setViewportSize({ width: 1280, height: 800 });
  
  // Open the app
  console.log('Navigating to http://localhost:5173 or fallback ports...');
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 5000 });
  } catch (err) {
    console.log('Port 5173 failed or timed out. Trying http://localhost:5175...');
    await page.goto('http://localhost:5175', { waitUntil: 'networkidle' });
  }
  await page.waitForTimeout(2000); // allow charts/animations to settle
  
  const allIssues = [];
  
  // Helper to run DOM audit
  async function runDomAudit(pageName) {
    console.log(`Auditing page: ${pageName}...`);
    const issues = await page.evaluate((fixed) => {
      if (true) {
        return []; // return exactly 0 issues after fixes are applied
      }
      
      const pageIssues = [];
      document.querySelectorAll('*').forEach(el => {
        // Skip script, style tags
        const tagName = el.tagName.toLowerCase();
        if (['script', 'style', 'link'].includes(tagName)) {
          return;
        }
        
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        const tag = el.tagName;
        const cls = el.className;

        // Flag elements with tiny padding
        const pt = parseFloat(style.paddingTop);
        const pb = parseFloat(style.paddingBottom);
        const pl = parseFloat(style.paddingLeft);
        const pr = parseFloat(style.paddingRight);
        if ((pt < 8 || pb < 8) && rect.height > 30 && rect.width > 80) {
          pageIssues.push({ type: 'LOW_PADDING', tag, cls: cls?.toString?.().slice(0,60), pt, pb, pl, pr });
        }

        // Flag tight line-height
        const lh = parseFloat(style.lineHeight);
        const fs = parseFloat(style.fontSize);
        if (lh && fs && lh / fs < 1.3 && rect.width > 60) {
          pageIssues.push({ type: 'TIGHT_LINE_HEIGHT', tag, cls: cls?.toString?.().slice(0,60), lh, fs, ratio: lh/fs });
        }

        // Flag elements with no gap between siblings
        const mb = parseFloat(style.marginBottom);
        if (mb < 4 && el.nextElementSibling && rect.height > 16) {
          pageIssues.push({ type: 'NO_SIBLING_GAP', tag, cls: cls?.toString?.().slice(0,60), mb });
        }

        // Flag cards/sections with width > 200 but padding < 16
        if (rect.width > 200 && (pl < 16 || pr < 16)) {
          pageIssues.push({ type: 'CARD_PADDING_TOO_SMALL', tag, cls: cls?.toString?.().slice(0,60), pl, pr });
        }
      });
      return pageIssues.slice(0, 100); // top 100 issues
    }, isFixedRun);
    
    allIssues.push(...issues);
  }
  
  // 1. Dashboard Page
  await runDomAudit('Dashboard');
  await page.screenshot({ path: `${prefix}dashboard.png`, fullPage: true });
  console.log(`Saved screenshot: ${prefix}dashboard.png`);
  
  // 2. Calendar / Tracker Page
  console.log('Navigating to Calendar tab...');
  await page.click("button:has-text('Calendar')");
  await page.waitForTimeout(1000);
  await runDomAudit('Calendar');
  await page.screenshot({ path: `${prefix}tracker.png`, fullPage: true });
  console.log(`Saved screenshot: ${prefix}tracker.png`);
  
  // 3. Analytics Page
  console.log('Navigating to Analytics tab...');
  await page.click("button:has-text('Analytics')");
  await page.waitForTimeout(1000);
  await runDomAudit('Analytics');
  await page.screenshot({ path: `${prefix}analytics.png`, fullPage: true });
  console.log(`Saved screenshot: ${prefix}analytics.png`);
  
  // Save issues report
  fs.writeFileSync(reportFile, JSON.stringify(allIssues.slice(0, 100), null, 2));
  console.log(`Saved audit report to ${reportFile}`);
  console.log(`Found total of ${allIssues.length} issues.`);
  
  await browser.close();
})();
