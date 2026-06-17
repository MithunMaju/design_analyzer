// crawl.post.ts — Uses Browserless.io to replace the self-hosted crawler.
// Browserless runs the real Chromium browser; we just call their API.
// All DOM extraction logic is sent as a script that runs inside the browser.

export default defineEventHandler(async (event) => {
  const { url } = await readBody(event);
  if (!url) throw createError({ statusCode: 400, message: 'url is required' });

  let targetUrl: string;
  try {
    targetUrl = new URL(url).href;
  } catch {
    throw createError({ statusCode: 400, message: 'Invalid URL' });
  }

  const cfEnv = (event.context.cloudflare?.env || {}) as Record<string, string>;
  const apiKey = cfEnv.BROWSERLESS_API_KEY || cfEnv.NUXT_BROWSERLESS_API_KEY || useRuntimeConfig().browserlessApiKey;
  if (!apiKey) throw createError({ statusCode: 500, message: 'BROWSERLESS_API_KEY not set' });

  const BROWSERLESS_BASE = `https://production-sfo.browserless.io`;

  // ─── Helper: call Browserless /function endpoint ──────────────────────────
  // This sends a script to run inside a real Chromium browser on Browserless servers.
  async function runInBrowser(script: string, options: Record<string, unknown> = {}) {
    const res = await fetch(`${BROWSERLESS_BASE}/function?token=${apiKey}&stealth=true`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        code: script,
        context: { targetUrl, ...options },
      }),
      signal: AbortSignal.timeout(90000),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => 'unknown error');
      throw createError({ statusCode: res.status, message: `Browserless error ${res.status}: ${err.slice(0, 200)}` });
    }
    return res.json();
  }

  // ─── Helper: take a screenshot via Browserless /function endpoint ────────
  async function takeScreenshot(w: number, h: number): Promise<string> {
    const code = [
      'export default async ({ page, context }) => {',
      '  const ua = context.w < 600 ? "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36" : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";',
      '  await page.setUserAgent(ua);',
      '  await page.setViewport({ width: context.w, height: context.h, deviceScaleFactor: 1 });',
      '  await page.goto(context.url, { waitUntil: "networkidle2", timeout: 30000 }).catch(() => {});',
      '  ',
      '  // Bypass Amazon soft captcha page if present',
      '  try {',
      '    const captchaForm = await page.$("form[action*=\'/errors/validateCaptcha\'], form[action*=\'/captcha\']");',
      '    if (captchaForm) {',
      '      const submitBtn = await captchaForm.$("button, input[type=\'submit\']");',
      '      if (submitBtn) {',
      '        await Promise.all([',
      '          submitBtn.click(),',
      '          page.waitForNavigation({ waitUntil: "networkidle2", timeout: 10000 }).catch(() => {})',
      '        ]);',
      '      }',
      '    }',
      '  } catch (e) {}',
      '  ',
      '  // Dismiss standard overlays/modals using Escape key',
      '  try {',
      '    await new Promise(r => setTimeout(r, 1000));',
      '    await page.keyboard.press("Escape");',
      '    await new Promise(r => setTimeout(r, 500));',
      '  } catch (e) {}',
      '  ',
      '  // Scroll to trigger lazy loading and reveal animations',
      '  await page.evaluate(async () => {',
      '    // Dismiss/hide common login and guest modal overlays and unlock scroll lock',
      '    try {',
      '      const overlaySelectors = [',
      '        "div[class*=\'login-modal\']", "div[id*=\'login-modal\']",',
      '        "div[class*=\'signup-modal\']", "div[id*=\'signup-modal\']",',
      '        "div[role=\'dialog\']", "div[class*=\'overlay\']",',
      '        "div[class*=\'popup\']", "div[class*=\'modal-backdrop\']",',
      '        "div[class*=\'modal-wrapper\']", "div[class*=\'Modal-root\']"',
      '      ];',
      '      for (const sel of overlaySelectors) {',
      '        document.querySelectorAll(sel).forEach(el => {',
      '          if (el.tagName !== "BODY" && el.tagName !== "HTML" && el.tagName !== "MAIN") {',
      '            el.style.setProperty("display", "none", "important");',
      '          }',
      '        });',
      '      }',
      '      document.body.style.setProperty("overflow", "auto", "important");',
      '      document.body.style.setProperty("position", "static", "important");',
      '      document.documentElement.style.setProperty("overflow", "auto", "important");',
      '    } catch (e) {}',
      '    ',
      '    // Perform scrolling',
      '    const delay = ms => new Promise(r => setTimeout(r, ms));',
      '    const scrollHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);',
      '    const step = Math.floor(window.innerHeight * 0.6);',
      '    for (let pos = 0; pos < scrollHeight; pos += step) {',
      '      window.scrollTo(0, pos);',
      '      await delay(150);',
      '    }',
      '    window.scrollTo(0, 0);',
      '    await delay(300);',
      '  });',
      '  const shot = await page.screenshot({ type: "jpeg", quality: 75, fullPage: true, encoding: "base64" });',
      '  return { data: shot, type: "application/json" };',
      '};',
    ].join("\n");
    const res = await fetch(`${BROWSERLESS_BASE}/function?token=${apiKey}&stealth=true&--width=${w}&--height=${h}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code, context: { url: targetUrl, w, h } }),
      signal: AbortSignal.timeout(60000),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Screenshot failed: ${res.status} ${txt}`);
    }
    const json = await res.json();
    return typeof json === 'string' ? json : (json?.data || json?.base64 || '');
  }

  // ─── The DOM extraction script — runs inside the real browser ─────────────
  // This is the same logic that was in crawler/index.js page.evaluate()
  const domExtractionScript = `
    export default async ({ page, context }) => {
      const { targetUrl, width, height } = context;
      await page.setViewport({ width, height, deviceScaleFactor: 1 });
      const ua = width < 600
        ? 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
        : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      await page.setUserAgent(ua);

      const cssTexts = [];
      const cssUrls = [];
      const jsUrls = [];

      page.on('response', async (response) => {
        try {
          const req = response.request();
          const url = response.url();
          const type = req.resourceType();
          if (type === 'stylesheet') { cssUrls.push(url); cssTexts.push(await response.text()); }
          if (type === 'script') jsUrls.push(url);
        } catch {}
      });

      await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
      
      // Bypass Amazon soft captcha page if present
      try {
        const captchaForm = await page.$("form[action*='/errors/validateCaptcha'], form[action*='/captcha']");
        if (captchaForm) {
          const submitBtn = await captchaForm.$("button, input[type='submit']");
          if (submitBtn) {
            await Promise.all([
              submitBtn.click(),
              page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {})
            ]);
          }
        }
      } catch (e) {}

      // Dismiss standard overlays/modals using Escape key
      try {
        await new Promise(r => setTimeout(r, 1000));
        await page.keyboard.press('Escape');
        await new Promise(r => setTimeout(r, 500));
      } catch (e) {}

      // Scroll to trigger reveal animations
      await page.evaluate(async () => {
        // Dismiss/hide common login and guest modal overlays and unlock scroll lock
        try {
          const overlaySelectors = [
            "div[class*='login-modal']", "div[id*='login-modal']",
            "div[class*='signup-modal']", "div[id*='signup-modal']",
            "div[role='dialog']", "div[class*='overlay']",
            "div[class*='popup']", "div[class*='modal-backdrop']",
            "div[class*='modal-wrapper']", "div[class*='Modal-root']"
          ];
          for (const sel of overlaySelectors) {
            document.querySelectorAll(sel).forEach(el => {
              if (el.tagName !== "BODY" && el.tagName !== "HTML" && el.tagName !== "MAIN") {
                el.style.setProperty("display", "none", "important");
              }
            });
          }
          document.body.style.setProperty("overflow", "auto", "important");
          document.body.style.setProperty("position", "static", "important");
          document.documentElement.style.setProperty("overflow", "auto", "important");
        } catch (e) {}

        // Perform scrolling
        const delay = ms => new Promise(r => setTimeout(r, ms));
        const totalHeight = document.body.scrollHeight;
        const step = Math.floor(window.innerHeight * 0.8);
        for (let pos = 0; pos < totalHeight; pos += step) {
          window.scrollTo(0, pos);
          await delay(120);
        }
        window.scrollTo(0, 0);
        await delay(300);
      });

      const domData = await page.evaluate(() => {
        const norm = s => (s || '').replace(/\\s+/g, ' ').trim();
        function uniqArr(arr) { return [...new Set((arr || []).filter(Boolean))]; }

        // Custom properties from :root
        const customProperties = {};
        const rootStyle = getComputedStyle(document.documentElement);
        for (const prop of rootStyle) {
          if (prop.startsWith('--')) {
            const val = rootStyle.getPropertyValue(prop).trim();
            if (val) customProperties[prop] = val;
          }
        }

        // Gradient properties
        const gradientProperties = {};
        for (const [name, value] of Object.entries(customProperties)) {
          if (name.includes('gradient') || name.includes('mesh') ||
              value.includes('linear-gradient') || value.includes('radial-gradient') ||
              value.includes('conic-gradient')) {
            gradientProperties[name] = value;
          }
        }

        // Glow/shadow properties
        const glowProperties = {};
        for (const [name, value] of Object.entries(customProperties)) {
          if (name.includes('glow') || name.includes('shadow') ||
              value.includes('box-shadow') ||
              (value.includes('rgba') && value.includes('px') && value.split('rgba').length > 1)) {
            glowProperties[name] = value;
          }
        }

        // Computed styles
        const sampledSelectors = [
          'body','header','nav','main','h1','h2','h3','p','a','button',
          'input','select','form','footer','.btn','.navbar',
          '[class*="card"]','[class*="job"]','[class*="search"]','[class*="filter"]',
          '[class*="grid"]','[class*="services"]','[class*="features"]',
          '[class*="solutions"]','[class*="offerings"]','[class*="capabilities"]',
          '[class*="projects"]','[class*="team"]','[class*="clients"]',
          'section','main > div','main > section',
        ];
        const computedStyles = {};
        for (const selector of sampledSelectors) {
          const el = document.querySelector(selector);
          if (!el) continue;
          const cs = getComputedStyle(el);
          computedStyles[selector] = {
            fontFamily: cs.fontFamily, fontSize: cs.fontSize,
            fontWeight: cs.fontWeight, lineHeight: cs.lineHeight,
            letterSpacing: cs.letterSpacing, color: cs.color,
            backgroundColor: cs.backgroundColor, display: cs.display,
            gridTemplateColumns: cs.gridTemplateColumns, gap: cs.gap,
            padding: cs.padding, margin: cs.margin, width: cs.width,
            height: cs.height, maxWidth: cs.maxWidth, minWidth: cs.minWidth,
            borderRadius: cs.borderRadius, boxShadow: cs.boxShadow,
            transition: cs.transition, animation: cs.animation,
            transform: cs.transform, opacity: cs.opacity,
          };
        }

        // Color sampling
        const colorSet = new Set();
        document.querySelectorAll('header,nav,footer,.btn,button,a,h1,h2,h3,section,.navbar,[class*="card"]')
          .forEach(el => {
            const cs = getComputedStyle(el);
            [cs.color, cs.backgroundColor, cs.borderColor].forEach(c => {
              if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') colorSet.add(c);
            });
          });

        // Contact info
        const contactInfo = {
          emails: Array.from(document.querySelectorAll('a[href^="mailto:"]'))
            .map(a => a.href.replace('mailto:', '').split('?')[0]),
          phones: Array.from(document.querySelectorAll('a[href^="tel:"]'))
            .map(a => a.href.replace('tel:', '')),
          addresses: Array.from(document.querySelectorAll('address'))
            .map(el => norm(el.textContent).slice(0, 200)),
        };

        // DOM routes
        const htmlRoutes = uniqArr(
          Array.from(document.querySelectorAll('a[href]')).map(a => {
            try {
              const href = a.getAttribute('href');
              if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return null;
              const parsed = new URL(href, location.href);
              if (parsed.hostname !== location.hostname) return null;
              return parsed.pathname;
            } catch { return null; }
          }).filter(Boolean)
        ).slice(0, 80);

        // Micro-copy & card descriptions
        const microCopy = Array.from(document.querySelectorAll(
          '[class*="eyebrow"],[class*="label"],[class*="tag"]:not(script),[class*="badge"],small,[class*="subtitle"],[class*="caption"]'
        )).map(el => norm(el.textContent).slice(0, 160)).filter(Boolean).slice(0, 40);

        const cardDescriptions = Array.from(document.querySelectorAll(
          '[class*="service"] p,[class*="feature"] p,[class*="card"] p,[class*="solution"] p'
        )).map(el => norm(el.textContent)).filter(t => t && t.length > 10 && t.length < 250).slice(0, 20);

        // Stats
        const stats = Array.from(document.querySelectorAll('[class*="stat"],[class*="metric"],[class*="counter"]'))
          .map(el => ({
            value: norm(el.querySelector('[class*="number"],h1,h2,h3,h4')?.textContent || ''),
            label: norm(el.querySelector('[class*="label"],p,span')?.textContent || ''),
          }))
          .filter(s => s.value).slice(0, 20);

        // Library detection
        const libraryEvidence = [];
        const checks = [
          [() => !!window.React, () => 'React ' + (window.React?.version || '')],
          [() => !!window.__NEXT_DATA__, () => 'Next.js'],
          [() => !!window.__nuxt || !!window.__NUXT__, () => 'Nuxt'],
          [() => !!window.Vue, () => 'Vue ' + (window.Vue?.version || '')],
          [() => !!window.angular, () => 'AngularJS'],
          [() => !!window.ng, () => 'Angular'],
          [() => !!window.Svelte, () => 'Svelte'],
          [() => !!window.jQuery, () => 'jQuery ' + (window.jQuery?.fn?.jquery || '')],
          [() => !!window.bootstrap, () => 'Bootstrap ' + (window.bootstrap?.Tooltip?.VERSION || '')],
          [() => !!window.gsap, () => 'GSAP ' + (window.gsap?.version || '')],
          [() => !!window.AOS, () => 'AOS'],
          [() => !!window.ScrollReveal, () => 'ScrollReveal'],
          [() => !!window.Swiper, () => 'Swiper ' + (window.Swiper?.version || '')],
          [() => !!window.THREE, () => 'Three.js r' + (window.THREE?.REVISION || '')],
          [() => !!window.gtag, () => 'Google Analytics (gtag)'],
          [() => !!window.fbq, () => 'Facebook Pixel'],
          [() => !!window.Intercom, () => 'Intercom'],
        ];
        for (const [detect, label] of checks) {
          try { if (detect()) libraryEvidence.push(label().trim()); } catch {}
        }
        if (libraryEvidence.length === 0) libraryEvidence.push('Static HTML site');

        // Headings, nav, buttons, fonts
        const headings = {
          h1: Array.from(document.querySelectorAll('h1')).map(el => norm(el.textContent)).filter(Boolean).slice(0, 5),
          h2: Array.from(document.querySelectorAll('h2')).map(el => norm(el.textContent)).filter(Boolean).slice(0, 10),
          h3: Array.from(document.querySelectorAll('h3')).map(el => norm(el.textContent)).filter(Boolean).slice(0, 15),
        };
        const navLinks = uniqArr(Array.from(document.querySelectorAll('nav a')).map(el => norm(el.textContent)).filter(Boolean));
        const visibleButtons = uniqArr(Array.from(document.querySelectorAll('button,a.btn,[class*="btn"]')).map(el => norm(el.textContent)).filter(Boolean).slice(0, 30));
        const bodyStyle = getComputedStyle(document.body);
        const h1El = document.querySelector('h1');
        const bodyFont = bodyStyle.fontFamily;
        const h1Font = h1El ? getComputedStyle(h1El).fontFamily : null;
        const title = document.title;
        const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
        const elementSummary = Array.from(document.body.querySelectorAll('*'))
          .filter(el => el.children.length === 0 && el.textContent.trim().length > 0)
          .map(el => ({ tag: el.tagName.toLowerCase(), text: norm(el.textContent).slice(0, 100), className: (el.className || '').toString().slice(0, 80) }))
          .slice(0, 80);
        const images = Array.from(document.querySelectorAll('img[src]'))
          .map(img => img.src).filter(Boolean).slice(0, 30);
        const hasNavToggle = !!document.querySelector('[class*="hamburger"],[class*="menu-toggle"],[class*="nav-toggle"],[aria-label*="menu"]');
        const filterItems = uniqArr(Array.from(document.querySelectorAll('[class*="filter"] button,[class*="tab"] button')).map(el => norm(el.textContent)).filter(Boolean));

        return {
          customProperties, gradientProperties, glowProperties, computedStyles,
          colorSamples: [...colorSet].slice(0, 60), contactInfo, htmlRoutes,
          microCopy, cardDescriptions, stats, libraryEvidence, headings,
          navLinks, visibleButtons, bodyFont, h1Font, title, metaDescription,
          elementSummary, images, hasNavToggle, filterItems,
          forms: Array.from(document.querySelectorAll('form')).map(f => ({ action: f.action, method: f.method, fields: Array.from(f.querySelectorAll('input,select,textarea')).map(i => i.name || i.type).filter(Boolean) })).slice(0, 5),
        };
      });

      return { data: { domData, cssUrls, cssTexts, jsUrls } };
    };
  `;

  try {
    // ─── Run sequentially to stay within Browserless free tier (2 concurrent max) ──
    const desktopResult = await runInBrowser(domExtractionScript, { width: 1440, height: 1000 });
    const desktopScreenshot = await takeScreenshot(1440, 1000);
    const mobileResult = await runInBrowser(domExtractionScript, { width: 390, height: 844 });
    const mobileScreenshot = await takeScreenshot(390, 844);

    const desktop = desktopResult?.data || {};
    const mobile = mobileResult?.data || {};

    // ─── Fetch CSS text for extraction (same as crawler stageEntryFetch) ──
    const combinedCss = (desktop.cssTexts || []).join('\n');

    // ─── Simple CSS evidence extraction (regex-based, runs server-side) ───
    function extractFromCSS(css: string) {
      const colors = [...new Set((css.match(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]+\)|hsl[a]?\([^)]+\)/g) || []))].slice(0, 100);
      const fontFamilies = [...new Set((css.match(/font-family\s*:\s*([^;}{]+)/g) || []).map(m => m.replace('font-family:', '').trim()))].slice(0, 20);
      const keyframes = [...new Set((css.match(/@keyframes\s+[\w-]+/g) || []))];
      const transitions = [...new Set((css.match(/transition\s*:\s*[^;}{]+/g) || []).map(m => m.replace('transition:', '').trim()))].slice(0, 30);
      const animations = [...new Set((css.match(/animation\s*:\s*[^;}{]+/g) || []).map(m => m.replace('animation:', '').trim()))].slice(0, 30);
      const cssCustomProperties: string[] = [];
      const propRegex = /(--[\w-]+)\s*:\s*([^;}{]+)/g;
      let match;
      while ((match = propRegex.exec(css)) !== null) {
        cssCustomProperties.push(`${match[1]}: ${match[2].trim()}`);
      }
      const letterSpacings = [...new Set((css.match(/letter-spacing\s*:\s*[^;}{]+/g) || []).map(m => m.replace('letter-spacing:', '').trim()))];
      return { colors, fontFamilies, keyframes, transitions, animationDeclarations: animations, cssCustomProperties: cssCustomProperties.slice(0, 200), letterSpacings };
    }

    const cssEvidence = extractFromCSS(combinedCss);

    // ─── Build curated object (same structure as original crawler) ─────────
    const dd = desktop.domData || {};
    const md = mobile.domData || {};

    function uniq(arr: any[]) { return [...new Set((arr || []).filter(Boolean))]; }

    const customProperties = Object.entries(dd.customProperties || {})
      .map(([k, v]) => ({ name: k, value: v }));
    const gradientTokens = Object.entries(dd.gradientProperties || {})
      .map(([k, v]) => ({ name: k, value: v }));
    const glowTokens = Object.entries(dd.glowProperties || {})
      .map(([k, v]) => ({ name: k, value: v }));

    // Merge CSS custom props not already in domData
    const knownNames = new Set(customProperties.map((p: any) => p.name));
    for (const decl of cssEvidence.cssCustomProperties) {
      const [name, ...rest] = decl.split(':');
      const trimName = name.trim();
      if (trimName.startsWith('--') && !knownNames.has(trimName)) {
        customProperties.push({ name: trimName, value: rest.join(':').trim() });
        knownNames.add(trimName);
      }
    }

    const curated = {
      meta: {
        url: targetUrl,
        title: dd.title || '',
        description: dd.metaDescription || '',
        viewport: 'width=device-width, initial-scale=1',
      },
      assetManifest: {
        cssUrls: uniq(desktop.cssUrls || []),
        jsUrls: uniq(desktop.jsUrls || []),
      },
      routes: uniq([...(dd.htmlRoutes || [])]),
      tokens: { customProperties, gradientTokens, glowTokens },
      customProperties,
      gradientTokens,
      glowTokens,
      apiEndpoints: [],
      detectedLibraries: {
        domConfirmed: uniq(dd.libraryEvidence || []),
        scriptConfirmed: [],
        bundleHints: [],
      },
      fonts: cssEvidence.fontFamilies || [],
      tailwindVersion: null,
      tailwindArbitraryValues: {
        colors: [],
        spacing: [],
        sizing: [],
        typography: [],
        shadows: [],
      },
      domEvidence: {
        desktop: {
          stats: dd.stats || [],
          headings: dd.headings,
          navLinks: uniq(dd.navLinks),
          visibleButtons: uniq(dd.visibleButtons),
          forms: dd.forms,
          filterItems: uniq(dd.filterItems),
          bodyFont: dd.bodyFont,
          h1Font: dd.h1Font,
          colorSamples: uniq(dd.colorSamples),
          computedStyles: dd.computedStyles,
          libraryEvidence: uniq(dd.libraryEvidence),
          elementSummary: dd.elementSummary,
          images: dd.images,
          contactInfo: dd.contactInfo,
          microCopy: dd.microCopy,
          cardDescriptions: dd.cardDescriptions,
        },
        mobile: {
          stats: md.stats || [],
          hasNavToggle: md.hasNavToggle ?? null,
          bodyFont: md.bodyFont || null,
          navLinks: uniq(md.navLinks || []),
          colorSamples: uniq(md.colorSamples || []),
          computedStyles: md.computedStyles || {},
          visibleButtons: uniq(md.visibleButtons || []),
          headings: md.headings || {},
          elementSummary: (md.elementSummary || []).slice(0, 50),
          contactInfo: md.contactInfo || {},
        },
        cssEvidence,
      },
    };

    return {
      success: true,
      curated,
      screenshot: desktopScreenshot,
      mobileScreenshot: mobileScreenshot,
      bundleStats: {
        cssUrlsFound: (desktop.cssUrls || []).length,
        jsUrlsFound: (desktop.jsUrls || []).length,
        cssLength: combinedCss.length,
        jsLength: (desktop.jsUrls || []).length,
        isJsFrameworkSite: (dd.libraryEvidence || []).some((l: string) =>
          ['React', 'Vue', 'Angular', 'Nuxt', 'Next'].some(f => l.includes(f))
        ),
      },
    };

  } catch (err: any) {
    throw createError({
      statusCode: 500,
      message: err.message || 'Crawl failed',
    });
  }
});
