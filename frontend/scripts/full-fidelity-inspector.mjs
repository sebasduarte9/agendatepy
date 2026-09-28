import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const VIEWPORTS = [
  { name: '320x568', width: 320, height: 568, mobile: true },
  { name: '360x800', width: 360, height: 800, mobile: true },
  { name: '390x844', width: 390, height: 844, mobile: true },
  { name: '430x932', width: 430, height: 932, mobile: true },
  { name: '768x1024', width: 768, height: 1024, mobile: true },
  { name: '820x1180', width: 820, height: 1180, mobile: true },
  { name: '1024x768', width: 1024, height: 768, mobile: false },
  { name: '1280x720', width: 1280, height: 720, mobile: false },
  { name: '1440x900', width: 1440, height: 900, mobile: false },
  { name: '1920x1080', width: 1920, height: 1080, mobile: false },
  { name: '844x390', width: 844, height: 390, mobile: true, landscape: true },
  { name: '932x430', width: 932, height: 430, mobile: true, landscape: true },
];

const SECTIONS = [
  { id: '01_header', selector: 'header' },
  { id: '02_hero', selector: '#inicio' },
  { id: '03_phone_mockup', selector: '#inicio div.relative.mx-auto' },
  { id: '04_ticker', selector: '#inicio + div' },
  { id: '05_como_funciona', selector: '#como-funciona' },
  { id: '06_whatsapp_showcase', selector: '#whatsapp' },
  { id: '07_features', selector: '#caracteristicas' },
  { id: '08_calculadora', selector: '#calculadora' },
  { id: '09_pricing', selector: '#precios' },
  { id: '10_integraciones', selector: '#integraciones' },
  { id: '11_diferenciales', selector: '#diferenciales' },
  { id: '12_faq', selector: '#faq' },
  { id: '12b_bottom_cta', selector: 'main > section:last-of-type' },
  { id: '13_footer', selector: 'footer' },
];

const OUT_DIR = path.resolve('C:/Users/acer/.gemini/antigravity-ide/brain/9a31d558-b8bd-422e-8109-e152c637f06f/fidelity_audit');
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
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('Failed to find browser target on port ' + port);
}

async function inspectFidelity() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(os.tmpdir(), 'edge_fidelity_' + Date.now());

  console.log('Launching Edge for visual fidelity audit...');
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

  try {
    const wsUrl = await findBrowserTarget(9222);
    console.log('Connected to CDP target:', wsUrl);
    const client = new CDPClient(wsUrl);

    await client.send('Page.enable');
    await client.send('DOM.enable');

    // Wait for hydration
    await new Promise((r) => setTimeout(r, 2000));

    const fidelityResults = [];

    for (const vp of VIEWPORTS) {
      console.log(`\n========================================`);
      console.log(`AUDITING VIEWPORT: ${vp.name} (${vp.width}x${vp.height})`);
      console.log(`========================================`);

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

      // Reset scroll position to (0,0)
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
      await new Promise((r) => setTimeout(r, 500));

      // Measure exact overflow using documentElement.scrollWidth vs documentElement.clientWidth
      const overflowMetrics = await client.send('Runtime.evaluate', {
        expression: `(() => {
          const docEl = document.documentElement;
          const body = document.body;
          const scrollW = docEl.scrollWidth;
          const clientW = docEl.clientWidth;
          const innerW = window.innerWidth;
          // Overflow exists if content width exceeds clientWidth (which accounts for scrollbar)
          const hasOverflow = scrollW > clientW;
          const overflowPx = Math.max(0, scrollW - clientW);
          return {
            scrollW,
            clientW,
            innerW,
            hasOverflow,
            overflowPx,
          };
        })()`,
        returnByValue: true,
      });

      const metrics = overflowMetrics.result.value;
      console.log(`Metrics: scrollWidth=${metrics.scrollW}, clientWidth=${metrics.clientW}, innerWidth=${metrics.innerW}, hasOverflow=${metrics.hasOverflow} (${metrics.overflowPx}px)`);

      const sectionCaptures = [];

      // Check key sections for visual fidelity
      for (const sec of SECTIONS) {
        // Scroll section into view
        const secInfo = await client.send('Runtime.evaluate', {
          expression: `(() => {
            const el = document.querySelector('${sec.selector}');
            if (!el) return { found: false };
            el.scrollIntoView({ behavior: 'instant', block: 'start' });
            const rect = el.getBoundingClientRect();
            return {
              found: true,
              rect: {
                top: Math.round(rect.top),
                bottom: Math.round(rect.bottom),
                left: Math.round(rect.left),
                right: Math.round(rect.right),
                width: Math.round(rect.width),
                height: Math.round(rect.height),
              },
              scrollWidth: el.scrollWidth,
              clientWidth: el.clientWidth,
              exceedsClient: el.scrollWidth > el.clientWidth,
            };
          })()`,
          returnByValue: true,
        });

        await new Promise((r) => setTimeout(r, 350));

        // Capture screenshot of this section view
        const shot = await client.send('Page.captureScreenshot', { format: 'png' });
        const filename = `${vp.name}_${sec.id}.png`;
        fs.writeFileSync(path.join(OUT_DIR, filename), Buffer.from(shot.data, 'base64'));

        sectionCaptures.push({
          section: sec.id,
          filename,
          info: secInfo.result.value,
        });
      }

      // Check fixed elements (Sticky CTA & WhatsApp Floating Button)
      const fixedInfo = await client.send('Runtime.evaluate', {
        expression: `(() => {
          // Scroll to middle of page where Sticky CTA is active
          window.scrollTo(0, 1500);
          const sticky = document.querySelector('div:has(> a[href*="whatsapp"])');
          const waFloat = document.querySelector('aside[aria-label*="WhatsApp"]');
          const stickyRect = sticky ? sticky.getBoundingClientRect() : null;
          const waRect = waFloat ? waFloat.getBoundingClientRect() : null;

          // Check if they collide
          let collides = false;
          if (stickyRect && waRect && waRect.width > 0 && stickyRect.width > 0) {
            const overlapX = !(stickyRect.right < waRect.left || stickyRect.left > waRect.right);
            const overlapY = !(stickyRect.bottom < waRect.top || stickyRect.top > waRect.bottom);
            collides = overlapX && overlapY;
          }

          return {
            stickyFound: !!sticky,
            waFloatFound: !!waFloat,
            waFloatHidden: waFloat ? window.getComputedStyle(waFloat).display === 'none' : true,
            collides,
          };
        })()`,
        returnByValue: true,
      });

      await new Promise((r) => setTimeout(r, 300));
      const fixedShot = await client.send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(OUT_DIR, `${vp.name}_fixed_scroll.png`), Buffer.from(fixedShot.data, 'base64'));

      fidelityResults.push({
        viewport: vp.name,
        width: vp.width,
        height: vp.height,
        metrics,
        fixedInfo: fixedInfo.result.value,
        sections: sectionCaptures,
      });
    }

    fs.writeFileSync(path.join(OUT_DIR, 'fidelity_report.json'), JSON.stringify(fidelityResults, null, 2));
    console.log('\nFidelity audit complete! Saved all screenshots to', OUT_DIR);
    client.close();
  } finally {
    cleanup();
  }
}

inspectFidelity().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
