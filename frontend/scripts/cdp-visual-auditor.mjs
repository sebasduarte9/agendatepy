import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const VIEWPORTS = [
  { name: '320x568_iphone_se1', width: 320, height: 568, mobile: true },
  { name: '360x800_android_std', width: 360, height: 800, mobile: true },
  { name: '375x812_iphone_x', width: 375, height: 812, mobile: true },
  { name: '390x844_iphone_12_13_14', width: 390, height: 844, mobile: true },
  { name: '414x896_iphone_plus', width: 414, height: 896, mobile: true },
  { name: '430x932_iphone_pro_max', width: 430, height: 932, mobile: true },
  { name: '768x1024_ipad_portrait', width: 768, height: 1024, mobile: true },
  { name: '820x1180_ipad_air', width: 820, height: 1180, mobile: true },
  { name: '1024x768_tablet_landscape', width: 1024, height: 768, mobile: false },
  { name: '1280x720_laptop_hd', width: 1280, height: 720, mobile: false },
  { name: '1440x900_macbook', width: 1440, height: 900, mobile: false },
  { name: '1920x1080_desktop_fhd', width: 1920, height: 1080, mobile: false },
  { name: '844x390_iphone_landscape', width: 844, height: 390, mobile: true, landscape: true },
  { name: '932x430_iphone_max_landscape', width: 932, height: 430, mobile: true, landscape: true },
];

const OUT_DIR = path.resolve('C:/Users/acer/.gemini/antigravity-ide/brain/9a31d558-b8bd-422e-8109-e152c637f06f/visual_audit');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
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
      }
    };
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
    } catch {
      // wait
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('Failed to find browser target on port ' + port);
}

async function runAudit() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), 'edge_audit_' + Date.now());

  console.log('Launching Edge headless...');
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
    try {
      proc.kill();
    } catch {}
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {}
  };

  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);

  try {
    const wsUrl = await findBrowserTarget(9222);
    console.log('Connected to target:', wsUrl);
    const client = new CDPClient(wsUrl);

    await client.send('Page.enable');
    await client.send('DOM.enable');

    // Wait 2 seconds for initial animations / client hydration
    await new Promise((r) => setTimeout(r, 2000));

    const auditResults = [];

    for (const vp of VIEWPORTS) {
      console.log(`\n--- Auditing Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);

      await client.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.mobile,
        screenOrientation: {
          type: vp.landscape ? 'landscapePrimary' : 'portraitPrimary',
          angle: vp.landscape ? 90 : 0,
        },
      });

      // Scroll to top instantly by disabling smooth scroll
      await client.send('Runtime.evaluate', {
        expression: `(() => {
          const prev = document.documentElement.style.scrollBehavior;
          document.documentElement.style.scrollBehavior = 'auto';
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
          if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
          document.documentElement.style.scrollBehavior = prev;
        })()`,
      });
      await new Promise((r) => setTimeout(r, 400));

      // Inspect layout & overflow
      const evalRes = await client.send('Runtime.evaluate', {
        expression: `(() => {
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          const docScrollW = document.documentElement.scrollWidth;
          const bodyScrollW = document.body.scrollWidth;
          const hasDocOverflow = docScrollW > vw + 1;
          const hasBodyOverflow = bodyScrollW > vw + 1;

          // Helper to check if element is clipped by any ancestor
          function isClippedByAncestor(el) {
            let parent = el.parentElement;
            while (parent && parent !== document.documentElement && parent !== document.body) {
              const pStyle = window.getComputedStyle(parent);
              if (
                pStyle.overflow === 'hidden' ||
                pStyle.overflowX === 'hidden' ||
                pStyle.overflow === 'clip' ||
                pStyle.overflowX === 'clip'
              ) {
                return true;
              }
              parent = parent.parentElement;
            }
            return false;
          }

          // Find all overflow offenders
          const allEls = Array.from(document.querySelectorAll('*'));
          const offenders = [];
          const unclippedOffenders = [];

          for (const el of allEls) {
            const style = window.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
            
            const rect = el.getBoundingClientRect();
            const rightExceed = rect.right - vw;

            if (rightExceed > 1.5) {
              const clipped = isClippedByAncestor(el);
              const info = {
                tag: el.tagName.toLowerCase(),
                id: el.id || null,
                className: (typeof el.className === 'string' ? el.className : el.getAttribute('class'))?.slice(0, 120) || '',
                textSnippet: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60),
                rect: {
                  left: Math.round(rect.left),
                  right: Math.round(rect.right),
                  width: Math.round(rect.width),
                  top: Math.round(rect.top),
                  bottom: Math.round(rect.bottom),
                },
                computed: {
                  width: style.width,
                  maxWidth: style.maxWidth,
                  minWidth: style.minWidth,
                  overflow: style.overflow,
                  position: style.position,
                  display: style.display,
                },
                clippedByAncestor: clipped,
                rightExceed: Math.round(rightExceed),
              };

              offenders.push(info);
              if (!clipped) {
                unclippedOffenders.push(info);
              }
            }
          }

          // Top sections inspection
          const sections = ['header', '#hero', '#como-funciona', '#caracteristicas', '#calculadora', '#precios', '#integraciones', '#faq', 'footer'].map(sel => {
            const el = document.querySelector(sel);
            if (!el) return { sel, found: false };
            const r = el.getBoundingClientRect();
            return {
              sel,
              found: true,
              rect: { top: Math.round(r.top), bottom: Math.round(r.bottom), width: Math.round(r.width), height: Math.round(r.height) },
              scrollWidth: el.scrollWidth,
              clientWidth: el.clientWidth,
              overflows: el.scrollWidth > el.clientWidth + 1
            };
          });

          return {
            vw,
            vh,
            docScrollW,
            bodyScrollW,
            hasDocOverflow,
            hasBodyOverflow,
            offenderCount: offenders.length,
            unclippedCount: unclippedOffenders.length,
            unclippedOffenders: unclippedOffenders.slice(0, 10),
            sections
          };
        })()`,
        returnByValue: true,
      });

      const data = evalRes.result.value;

      // Capture viewport screenshot
      const shot = await client.send('Page.captureScreenshot', {
        format: 'png',
      });
      const shotPath = path.join(OUT_DIR, `${vp.name}_hero.png`);
      fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));

      // Also capture key sections for mobile and tablet
      if (vp.width <= 768 || vp.landscape) {
        // Scroll through sections and take shots
        await client.send('Runtime.evaluate', {
          expression: 'window.scrollTo(0, 750);',
        });
        await new Promise((r) => setTimeout(r, 400));
        const shot2 = await client.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(OUT_DIR, `${vp.name}_mockup.png`), Buffer.from(shot2.data, 'base64'));

        // Scroll to calculator
        await client.send('Runtime.evaluate', {
          expression: 'document.querySelector("#calculadora")?.scrollIntoView({ behavior: "instant" });',
        });
        await new Promise((r) => setTimeout(r, 400));
        const shotCalc = await client.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(OUT_DIR, `${vp.name}_calc.png`), Buffer.from(shotCalc.data, 'base64'));

        // Scroll to pricing
        await client.send('Runtime.evaluate', {
          expression: 'document.querySelector("#precios")?.scrollIntoView({ behavior: "instant" });',
        });
        await new Promise((r) => setTimeout(r, 400));
        const shotPrice = await client.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(OUT_DIR, `${vp.name}_pricing.png`), Buffer.from(shotPrice.data, 'base64'));

        // Scroll to FAQ & footer
        await client.send('Runtime.evaluate', {
          expression: 'document.querySelector("#faq")?.scrollIntoView({ behavior: "instant" });',
        });
        await new Promise((r) => setTimeout(r, 400));
        const shotFaq = await client.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(OUT_DIR, `${vp.name}_faq.png`), Buffer.from(shotFaq.data, 'base64'));
      }

      console.log(`Viewport ${vp.name}: DocScrollW=${data.docScrollW} (vw=${data.vw}), Overflow=${data.hasDocOverflow}, UnclippedOffenders=${data.unclippedCount}`);
      if (data.unclippedCount > 0) {
        console.log('Top unclipped offenders:', JSON.stringify(data.unclippedOffenders.slice(0, 5), null, 2));
      }

      auditResults.push({
        viewport: vp,
        data,
      });
    }

    fs.writeFileSync(path.join(OUT_DIR, 'audit_report.json'), JSON.stringify(auditResults, null, 2));
    console.log('\nAudit complete! Saved screenshots and report to', OUT_DIR);
    client.close();
  } finally {
    cleanup();
  }
}

runAudit().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
