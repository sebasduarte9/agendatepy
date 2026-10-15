(async () => {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  // 1. Login
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.locator('button:has-text("Dueño Local")').click();
  await page.waitForURL('**/dashboard**');
  await page.waitForLoadState('networkidle');

  // 2. Go to /dashboard/calendario
  await page.goto('http://localhost:3000/dashboard/calendario');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // 3. Click tour launcher button (the floating compass button at bottom right)
  console.log('Looking for tour button...');
  // Find the button in bottom right
  const tourLauncher = page.locator('button:has-text("Tour"), button[title*="Guía"], button[title*="Tour"], button:has(svg.lucide-compass)');
  console.log('Tour launcher count:', await tourLauncher.count());

  console.log('Triggering tour for calendario...');
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('open-guided-tour', { detail: { section: 'calendario' } }));
  });

  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/Users/sebasduarte9/Desktop/agendatepy/screenshot_tour_open.png' });
  console.log('SCREENSHOT_TOUR_OPEN_TAKEN');

  // MOBILE TEST
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3000/login');
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.locator('button:has-text("Dueño Local")').click();
  await mobilePage.waitForURL('**/dashboard**');
  await mobilePage.waitForLoadState('networkidle');

  await mobilePage.goto('http://localhost:3000/dashboard/calendario');
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: '/Users/sebasduarte9/Desktop/agendatepy/screenshot_mobile_calendar.png' });

  // Trigger tour on mobile
  await mobilePage.evaluate(() => {
    window.dispatchEvent(new CustomEvent('open-guided-tour', { detail: { section: 'calendario' } }));
  });
  await mobilePage.waitForTimeout(800);

  // Step through tour on mobile
  for (let step = 1; step <= 6; step++) {
    const nextBtn = mobilePage.locator('button:has-text("Siguiente tarea"), button:has-text("¡Entendido, tarea completada!")');
    const isVis = await nextBtn.isVisible().catch(() => false);
    if (!isVis) break;
    await nextBtn.click();
    await mobilePage.waitForTimeout(600);
  }

  await mobilePage.waitForTimeout(800);
  await mobilePage.screenshot({ path: '/Users/sebasduarte9/Desktop/agendatepy/screenshot_mobile_after_tour.png' });
  console.log('MOBILE_TOUR_COMPLETED');

  // Check scroll position of all elements
  const scrolledElements = await page.evaluate(() => {
    const results = [];
    if (window.scrollY > 0) results.push({ tag: 'window', scrollY: window.scrollY });
    if (document.documentElement.scrollTop > 0) results.push({ tag: 'documentElement', scrollTop: document.documentElement.scrollTop });
    if (document.body.scrollTop > 0) results.push({ tag: 'body', scrollTop: document.body.scrollTop });

    const all = document.querySelectorAll('*');
    for (const el of all) {
      if (el.scrollTop > 0) {
        results.push({
          tag: el.tagName,
          className: el.className,
          id: el.id,
          scrollTop: el.scrollTop,
          scrollHeight: el.scrollHeight,
          clientHeight: el.clientHeight
        });
      }
    }
    return results;
  });
  console.log('Scrolled elements:', JSON.stringify(scrolledElements, null, 2));

  await browser.close();
})();
