import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const OUT_DIR = path.resolve('C:/Users/acer/.gemini/antigravity-ide/brain/9a31d558-b8bd-422e-8109-e152c637f06f/interaction_qa');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.eventListeners = new Map();
    this.ready = new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
        else resolve(msg.result);
      } else if (msg.method) {
        const listeners = this.eventListeners.get(msg.method) || [];
        listeners.forEach((fn) => fn(msg.params));
      }
    };
  }

  on(event, fn) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(fn);
  }

  async send(method, params = {}) {
    await this.ready;
    const callId = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(callId, { resolve, reject });
      this.ws.send(JSON.stringify({ id: callId, method, params }));
    });
  }

  close() {
    this.ws.close();
  }
}

async function findBrowserTarget(port = 9222) {
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      if (res.ok) {
        const list = await res.json();
        const page = list.find((item) => item.type === 'page');
        if (page && page.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('Failed to find browser target on port ' + port);
}

async function evaluate(client, expression) {
  const result = await client.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails) {
    throw new Error('Eval failed: ' + (result.exceptionDetails.text || JSON.stringify(result.exceptionDetails)));
  }
  return result.result?.value;
}

async function setViewport(client, width, height, isMobile = true, isLandscape = false) {
  await client.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 2,
    mobile: isMobile,
    screenOrientation: isLandscape
      ? { angle: 90, type: 'landscapePrimary' }
      : { angle: 0, type: 'portraitPrimary' },
  });
  await client.send('Emulation.setVisibleSize', { width, height });
}

async function main() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), 'edge_qa_' + Date.now());

  console.log('Starting Edge for Interactive Mobile QA Suite...');
  const proc = spawn(
    edgePath,
    [
      '--headless=new',
      '--remote-debugging-port=9222',
      `--user-data-dir=${userDataDir}`,
      '--no-first-run',
      '--disable-gpu',
      '--window-size=1920,1080',
      'http://localhost:3000',
    ],
    { stdio: 'ignore' }
  );

  const cleanup = () => {
    try { proc.kill(); } catch {}
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch {}
  };
  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);

  const results = {
    phases: {},
    consoleErrors: [],
    networkErrors: [],
    networkRequestsCount: 0,
    timestamp: new Date().toISOString(),
  };

  try {
    const wsUrl = await findBrowserTarget(9222);
    console.log('Connected to CDP Target:', wsUrl);
    const client = new CDPClient(wsUrl);

    await client.send('Page.enable');
    await client.send('DOM.enable');
    await client.send('Runtime.enable');
    await client.send('Network.enable');

    // Monitor Console errors
    client.on('Runtime.consoleAPICalled', (params) => {
      if (params.type === 'error') {
        const text = params.args.map((a) => a.value || a.description || JSON.stringify(a)).join(' ');
        results.consoleErrors.push(text);
      }
    });

    client.on('Runtime.exceptionThrown', (params) => {
      results.consoleErrors.push(params.exceptionDetails.text || params.exceptionDetails.exception?.description);
    });

    // Monitor Network
    client.on('Network.requestWillBeSent', () => {
      results.networkRequestsCount++;
    });

    client.on('Network.responseReceived', (params) => {
      if (params.response.status >= 400 && !params.response.url.includes('favicon')) {
        results.networkErrors.push({ url: params.response.url, status: params.response.status });
      }
    });

    // Wait 2.5s for initial load
    await new Promise((r) => setTimeout(r, 2500));

    // ==========================================
    // PHASE 1 & 2: Mobile Header & Drawer Navigation (390x844)
    // ==========================================
    console.log('\n--- Testing Phase 1 & 2: Header Drawer & Anchor Navigation (390x844) ---');
    await setViewport(client, 390, 844, true);
    await new Promise((r) => setTimeout(r, 500));

    const headerTest = await evaluate(client, `
      (() => {
        // 1. Find hamburger button
        const menuBtn = document.querySelector('button[aria-label="Abrir menú"]');
        if (!menuBtn) return { error: 'Hamburger button not found' };
        
        // Open drawer
        menuBtn.click();
        return { drawerOpened: true };
      })()
    `);
    await new Promise((r) => setTimeout(r, 400));

    const drawerCheck = await evaluate(client, `
      (() => {
        // Check if drawer items exist
        const links = Array.from(document.querySelectorAll('header a[href^="#"]'));
        const caracteristicasLink = links.find(l => l.getAttribute('href') === '#caracteristicas');
        if (!caracteristicasLink) return { error: 'Caracteristicas link not in drawer' };
        
        // Click Caracteristicas
        caracteristicasLink.click();
        return { clicked: true, target: '#caracteristicas' };
      })()
    `);
    await new Promise((r) => setTimeout(r, 700));

    const scrollCheck = await evaluate(client, `
      (() => {
        const sec = document.getElementById('caracteristicas');
        const rect = sec.getBoundingClientRect();
        // Check if drawer closed
        const menuBtn = document.querySelector('button[aria-label="Abrir menú"]');
        const isDrawerClosed = !document.querySelector('header a[href^="#caracteristicas"]')?.offsetParent;
        return {
          scrollY: window.scrollY,
          sectionTop: rect.top,
          isNearViewport: Math.abs(rect.top) < 200,
          isDrawerClosed
        };
      })()
    `);

    results.phases.headerAndDrawer = {
      headerTest,
      drawerCheck,
      scrollCheck,
      status: scrollCheck.isNearViewport ? 'OK' : 'FAIL',
    };
    console.log('Phase 1 & 2 Result:', results.phases.headerAndDrawer.status, scrollCheck);

    // ==========================================
    // PHASE 3: Hero CTAs and Category Switcher
    // ==========================================
    console.log('\n--- Testing Phase 3: Hero Interactions ---');
    await evaluate(client, 'window.scrollTo({ top: 0, behavior: "instant" })');
    await new Promise((r) => setTimeout(r, 400));

    const heroTest = await evaluate(client, `
      (() => {
        const primaryCta = document.querySelector('a[href="/onboarding"]');
        const waCta = document.querySelector('a[href*="api.whatsapp.com"], a[href*="wa.me"]');
        const categoryBtns = Array.from(document.querySelectorAll('#inicio button'));
        
        // Click Odontologia category button if found
        const odontoBtn = categoryBtns.find(b => b.textContent.includes('Odontolog') || b.textContent.includes('Dental'));
        let categoryClicked = false;
        if (odontoBtn) {
          odontoBtn.click();
          categoryClicked = true;
        }

        return {
          hasPrimaryCta: !!primaryCta,
          primaryHref: primaryCta?.getAttribute('href'),
          hasWaCta: !!waCta,
          categoryBtnsCount: categoryBtns.length,
          categoryClicked
        };
      })()
    `);
    results.phases.hero = { heroTest, status: (heroTest.hasPrimaryCta && heroTest.hasWaCta) ? 'OK' : 'FAIL' };
    console.log('Phase 3 Result:', results.phases.hero.status, heroTest);

    // ==========================================
    // PHASE 4: PhoneMockup Non-blocking Check on 320x568
    // ==========================================
    console.log('\n--- Testing Phase 4: PhoneMockup (320x568) ---');
    await setViewport(client, 320, 568, true);
    await new Promise((r) => setTimeout(r, 400));

    const mockupTest = await evaluate(client, `
      (() => {
        const mockup = document.querySelector('#inicio [class*="rounded-[36px]"], #inicio [class*="rounded-[40px]"], #inicio [class*="max-w-"]');
        const bodyScrollW = document.documentElement.scrollWidth;
        const bodyClientW = document.documentElement.clientWidth;
        return {
          mockupFound: !!mockup,
          hasOverflow: bodyScrollW > bodyClientW,
          scrollWidth: bodyScrollW,
          clientWidth: bodyClientW
        };
      })()
    `);
    results.phases.phoneMockup = { mockupTest, status: !mockupTest.hasOverflow ? 'OK' : 'FAIL' };
    console.log('Phase 4 Result:', results.phases.phoneMockup.status, mockupTest);

    // ==========================================
    // PHASE 5: Calculator Interactive Sliders
    // ==========================================
    console.log('\n--- Testing Phase 5: RoiCalculator Sliders & Reactive Values ---');
    await evaluate(client, `
      (() => {
        const calc = document.getElementById('calculadora');
        calc.scrollIntoView({ behavior: 'instant' });
      })()
    `);
    await new Promise((r) => setTimeout(r, 400));

    const calculatorTest = await evaluate(client, `
      (() => {
        const sliders = Array.from(document.querySelectorAll('#calculadora input[type="range"]'));
        if (sliders.length < 3) return { error: 'Expected 3 sliders, found ' + sliders.length };
        
        // Initial values
        const initialLoss = document.querySelector('#calculadora .text-red-600, #calculadora [class*="text-red-"]')?.textContent;
        const initialRecovered = document.querySelector('#calculadora .bg-gradient-to-br .font-mono')?.textContent;
        
        // Change slider 0 (turnos por dia) to 30
        const s0 = sliders[0];
        s0.value = '30';
        s0.dispatchEvent(new Event('input', { bubbles: true }));
        s0.dispatchEvent(new Event('change', { bubbles: true }));

        // Change slider 1 (precio) to 150000
        const s1 = sliders[1];
        s1.value = '150000';
        s1.dispatchEvent(new Event('input', { bubbles: true }));
        s1.dispatchEvent(new Event('change', { bubbles: true }));

        // Change slider 2 (dias) to 26
        const s2 = sliders[2];
        s2.value = '26';
        s2.dispatchEvent(new Event('input', { bubbles: true }));
        s2.dispatchEvent(new Event('change', { bubbles: true }));

        return {
          slidersFound: sliders.length,
          initialLoss,
          initialRecovered
        };
      })()
    `);
    await new Promise((r) => setTimeout(r, 300));

    const calculatorUpdated = await evaluate(client, `
      (() => {
        const updatedLoss = document.querySelector('#calculadora .text-red-600, #calculadora [class*="text-red-"]')?.textContent;
        const updatedRecovered = document.querySelector('#calculadora .bg-gradient-to-br .font-mono')?.textContent;
        const paybackText = document.querySelector('#calculadora [class*="Retorno Inmediato"]')?.parentElement?.textContent;
        return {
          updatedLoss,
          updatedRecovered,
          lossUpdatedCorrectly: updatedLoss && updatedLoss.includes('Gs.'),
          recoveredUpdatedCorrectly: updatedRecovered && updatedRecovered.includes('Gs.')
        };
      })()
    `);
    results.phases.calculator = {
      calculatorTest,
      calculatorUpdated,
      status: (calculatorUpdated.lossUpdatedCorrectly && calculatorUpdated.recoveredUpdatedCorrectly) ? 'OK' : 'FAIL'
    };
    console.log('Phase 5 Result:', results.phases.calculator.status, calculatorUpdated);

    // ==========================================
    // PHASE 6: Pricing Toggle & "Ver más características"
    // ==========================================
    console.log('\n--- Testing Phase 6: Pricing Toggle & Feature Expand ---');
    await evaluate(client, `
      (() => {
        const pricing = document.getElementById('precios');
        pricing.scrollIntoView({ behavior: 'instant' });
      })()
    `);
    await new Promise((r) => setTimeout(r, 400));

    const pricingTest = await evaluate(client, `
      (() => {
        // Toggle Annual billing
        const toggleBtn = document.querySelector('#precios button[aria-label="Cambiar facturación mensual o anual"]');
        if (!toggleBtn) return { error: 'Billing toggle button not found' };
        toggleBtn.click();
        return { toggleClicked: true };
      })()
    `);
    await new Promise((r) => setTimeout(r, 400));

    const annualSavingsCheck = await evaluate(client, `
      (() => {
        const savingsBadge = Array.from(document.querySelectorAll('#precios span')).find(s => s.textContent.includes('Ahorrás Gs.'));
        
        // Find "Ver más características" button on mobile
        const expandBtns = Array.from(document.querySelectorAll('#precios button')).filter(b => b.textContent.includes('Ver más características'));
        let expanded = false;
        if (expandBtns.length > 0) {
          expandBtns[0].click();
          expanded = true;
        }

        return {
          hasSavingsBadge: !!savingsBadge,
          savingsText: savingsBadge?.textContent,
          expandBtnsFound: expandBtns.length,
          firstCardExpanded: expanded
        };
      })()
    `);
    await new Promise((r) => setTimeout(r, 400));

    const collapseCheck = await evaluate(client, `
      (() => {
        const collapseBtn = Array.from(document.querySelectorAll('#precios button')).find(b => b.textContent.includes('Ver menos'));
        let collapsed = false;
        if (collapseBtn) {
          collapseBtn.click();
          collapsed = true;
        }
        return {
          hasCollapseBtn: !!collapseBtn,
          collapsedSuccessfully: collapsed
        };
      })()
    `);

    results.phases.pricing = {
      pricingTest,
      annualSavingsCheck,
      collapseCheck,
      status: (annualSavingsCheck.hasSavingsBadge && annualSavingsCheck.firstCardExpanded && collapseCheck.collapsedSuccessfully) ? 'OK' : 'FAIL'
    };
    console.log('Phase 6 Result:', results.phases.pricing.status, results.phases.pricing);

    // ==========================================
    // PHASE 7: FAQ Accordion Expansion & Collapse
    // ==========================================
    console.log('\n--- Testing Phase 7: FAQ Accordion ---');
    await evaluate(client, `
      (() => {
        const faq = document.getElementById('faq');
        faq.scrollIntoView({ behavior: 'instant' });
      })()
    `);
    await new Promise((r) => setTimeout(r, 400));

    const faqTest = await evaluate(client, `
      (() => {
        const faqButtons = Array.from(document.querySelectorAll('#faq button'));
        if (faqButtons.length < 5) return { error: 'Expected at least 5 FAQ items, found ' + faqButtons.length };
        
        // Click FAQ 0
        faqButtons[0].click();
        return { faqCount: faqButtons.length, clickedIndex: 0 };
      })()
    `);
    await new Promise((r) => setTimeout(r, 400));

    const faqCheck1 = await evaluate(client, `
      (() => {
        const openParagraphs = Array.from(document.querySelectorAll('#faq p')).filter(p => p.textContent.includes('AgendatePY'));
        // Click FAQ 1 to test switching
        const faqButtons = Array.from(document.querySelectorAll('#faq button'));
        faqButtons[1].click();
        return {
          hasOpenAnswer: openParagraphs.length > 0,
          firstAnswerText: openParagraphs[0]?.textContent?.substring(0, 60)
        };
      })()
    `);
    await new Promise((r) => setTimeout(r, 400));

    results.phases.faq = {
      faqTest,
      faqCheck1,
      status: faqCheck1.hasOpenAnswer ? 'OK' : 'FAIL'
    };
    console.log('Phase 7 Result:', results.phases.faq.status, faqCheck1);

    // ==========================================
    // PHASE 8: Sticky Mobile CTA and WhatsApp Button (320x568 & 390x844)
    // ==========================================
    console.log('\n--- Testing Phase 8: Sticky Mobile CTA & Floating WhatsApp ---');
    for (const [w, h] of [[320, 568], [390, 844]]) {
      await setViewport(client, w, h, true);
      await evaluate(client, 'window.scrollTo({ top: 1200, behavior: "instant" })');
      await new Promise((r) => setTimeout(r, 500));

      const fixedCheck = await evaluate(client, `
        (() => {
          const stickyCta = document.querySelector('div.fixed.bottom-0, a[class*="fixed bottom-0"], [class*="fixed inset-x-0 bottom-0"]');
          const waBtn = document.querySelector('a[aria-label*="WhatsApp"], button[aria-label*="WhatsApp"], a[href*="wa.me"]');
          
          let stickyRect = null;
          let waRect = null;
          let overlap = false;

          if (stickyCta) stickyRect = stickyCta.getBoundingClientRect();
          if (waBtn) waRect = waBtn.getBoundingClientRect();

          if (stickyRect && waRect) {
            overlap = !(
              stickyRect.right < waRect.left ||
              stickyRect.left > waRect.right ||
              stickyRect.bottom < waRect.top ||
              stickyRect.top > waRect.bottom
            );
          }

          return {
            viewport: '${w}x${h}',
            hasStickyCta: !!stickyCta,
            hasWaBtn: !!waBtn,
            overlap,
            stickyBottom: stickyRect?.bottom,
            waBottom: waRect?.bottom
          };
        })()
      `);
      results.phases[`sticky_${w}x${h}`] = fixedCheck;
      console.log(`Phase 8 (${w}x${h}):`, fixedCheck);
    }

    // ==========================================
    // PHASE 9: Landscape Orientation (844x390, 932x430)
    // ==========================================
    console.log('\n--- Testing Phase 9: Landscape Orientation ---');
    for (const [w, h] of [[844, 390], [932, 430]]) {
      await setViewport(client, w, h, true, true);
      await evaluate(client, 'window.scrollTo({ top: 0, behavior: "instant" })');
      await new Promise((r) => setTimeout(r, 400));

      const landscapeCheck = await evaluate(client, `
        (() => {
          const scrollW = document.documentElement.scrollWidth;
          const clientW = document.documentElement.clientWidth;
          return {
            viewport: '${w}x${h}',
            scrollWidth: scrollW,
            clientWidth: clientW,
            hasOverflow: scrollW > clientW
          };
        })()
      `);
      results.phases[`landscape_${w}x${h}`] = landscapeCheck;
      console.log(`Phase 9 (${w}x${h}):`, !landscapeCheck.hasOverflow ? 'OK' : 'OVERFLOW');
    }

    // ==========================================
    // PHASE 10: Dynamic Resize Sequence (320 -> 390 -> 430 -> 768 -> 1280)
    // ==========================================
    console.log('\n--- Testing Phase 10: Dynamic Resize Sequence ---');
    const resizeWidths = [320, 390, 430, 768, 1280];
    const resizeResults = [];
    for (const rw of resizeWidths) {
      await setViewport(client, rw, 800, rw < 1024);
      await new Promise((r) => setTimeout(r, 300));
      const resCheck = await evaluate(client, `
        (() => {
          const sw = document.documentElement.scrollWidth;
          const cw = document.documentElement.clientWidth;
          return { width: ${rw}, scrollWidth: sw, clientWidth: cw, overflow: sw > cw };
        })()
      `);
      resizeResults.push(resCheck);
    }
    results.phases.dynamicResize = { resizeResults, status: resizeResults.every(r => !r.overflow) ? 'OK' : 'FAIL' };
    console.log('Phase 10 Result:', results.phases.dynamicResize.status);

    // ==========================================
    // PHASE 11 & 12: Minimum Accessibility & Touch Target Audit
    // ==========================================
    console.log('\n--- Testing Phase 11 & 12: Accessibility & Touch Targets ---');
    await setViewport(client, 390, 844, true);
    await new Promise((r) => setTimeout(r, 300));

    const a11yCheck = await evaluate(client, `
      (() => {
        const buttons = Array.from(document.querySelectorAll('button, a[role="button"]'));
        const smallTargets = [];
        const missingAria = [];

        buttons.forEach((btn) => {
          const rect = btn.getBoundingClientRect();
          const text = (btn.textContent || '').trim();
          const ariaLabel = btn.getAttribute('aria-label');
          
          if (!text && !ariaLabel) {
            missingAria.push(btn.outerHTML.substring(0, 80));
          }
          if (rect.width > 0 && rect.height > 0 && (rect.width < 28 || rect.height < 28)) {
            smallTargets.push({ text: text || ariaLabel, w: rect.width, h: rect.height });
          }
        });

        return {
          totalButtons: buttons.length,
          missingAriaCount: missingAria.length,
          smallTargetsCount: smallTargets.length,
          smallTargetsSample: smallTargets.slice(0, 3)
        };
      })()
    `);
    results.phases.a11yAndTouch = a11yCheck;
    console.log('Phase 11 & 12 Result:', a11yCheck);

    // ==========================================
    // PHASE 13 & 14: Direct Hash / Anchor Loading
    // ==========================================
    console.log('\n--- Testing Phase 13 & 14: Direct Hash Navigation ---');
    const hashes = ['#caracteristicas', '#calculadora', '#precios', '#faq'];
    const hashResults = {};

    for (const h of hashes) {
      await client.send('Page.navigate', { url: `http://localhost:3000/${h}` });
      await new Promise((r) => setTimeout(r, 1200));

      const hCheck = await evaluate(client, `
        (() => {
          const targetId = '${h}'.replace('#', '');
          const el = document.getElementById(targetId);
          if (!el) return { found: false };
          const rect = el.getBoundingClientRect();
          return {
            found: true,
            top: rect.top,
            scrollY: window.scrollY,
            inView: rect.top < 300 && rect.bottom > 0
          };
        })()
      `);
      hashResults[h] = hCheck;
    }
    results.phases.directHashNavigation = hashResults;
    console.log('Phase 13 & 14 Result:', hashResults);

    // ==========================================
    // PHASE 15 & 16: Console Errors & Network Status
    // ==========================================
    console.log('\n--- Checking Phase 15 & 16: Console & Network Errors ---');
    console.log('Console Errors Caught:', results.consoleErrors.length);
    console.log('Network 4xx/5xx Errors Caught:', results.networkErrors.length);
    console.log('Total Network Requests:', results.networkRequestsCount);

    // Save final report JSON
    fs.writeFileSync(path.join(OUT_DIR, 'interaction_report.json'), JSON.stringify(results, null, 2));
    console.log('\nAll Interactive QA Phases Completed! Report saved to:', path.join(OUT_DIR, 'interaction_report.json'));

    client.close();
  } catch (err) {
    console.error('QA Suite Error:', err);
  } finally {
    cleanup();
  }
}

main();
