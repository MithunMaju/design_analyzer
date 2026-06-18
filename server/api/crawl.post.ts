// crawl.post.ts — Uses Browserless.io to replace the self-hosted crawler.
// Browserless runs the real Chromium browser; we just call their API.
// All DOM extraction logic is sent as a script that runs inside the browser.

// crawl.post.ts — Dual-mode crawler: Uses Cloudflare Browser Rendering in production, and falls back to Browserless.io in development/local.

// Helper function to extract DOM data (runs in the browser context)
function getDomData() {
  const norm = (s: string | null | undefined) => (s || '').replace(/\s+/g, ' ').trim();
  function uniqArr(arr: any[]) { return [...new Set((arr || []).filter(Boolean))]; }

  // Custom properties from :root
  const customProperties: Record<string, string> = {};
  const rootStyle = getComputedStyle(document.documentElement);
  for (let i = 0; i < rootStyle.length; i++) {
    const prop = rootStyle[i];
    if (prop.startsWith('--')) {
      const val = rootStyle.getPropertyValue(prop).trim();
      if (val) customProperties[prop] = val;
    }
  }

  // Gradient properties
  const gradientProperties: Record<string, string> = {};
  for (const [name, value] of Object.entries(customProperties)) {
    if (name.includes('gradient') || name.includes('mesh') ||
        value.includes('linear-gradient') || value.includes('radial-gradient') ||
        value.includes('conic-gradient')) {
      gradientProperties[name] = value;
    }
  }

  // Glow/shadow properties
  const glowProperties: Record<string, string> = {};
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
  const computedStyles: Record<string, any> = {};
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
  const colorSet = new Set<string>();
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
      .map(a => (a as HTMLAnchorElement).href.replace('mailto:', '').split('?')[0]),
    phones: Array.from(document.querySelectorAll('a[href^="tel:"]'))
      .map(a => (a as HTMLAnchorElement).href.replace('tel:', '')),
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
  const libraryEvidence: string[] = [];
  const win = window as any;
  const checks: Array<[() => boolean, () => string]> = [
    [() => !!win.React, () => 'React ' + (win.React?.version || '')],
    [() => !!win.__NEXT_DATA__, () => 'Next.js'],
    [() => !!win.__nuxt || !!win.__NUXT__, () => 'Nuxt'],
    [() => !!win.Vue, () => 'Vue ' + (win.Vue?.version || '')],
    [() => !!win.angular, () => 'AngularJS'],
    [() => !!win.ng, () => 'Angular'],
    [() => !!win.Svelte, () => 'Svelte'],
    [() => !!win.jQuery, () => 'jQuery ' + (win.jQuery?.fn?.jquery || '')],
    [() => !!win.bootstrap, () => 'Bootstrap ' + (win.bootstrap?.Tooltip?.VERSION || '')],
    [() => !!win.gsap, () => 'GSAP ' + (win.gsap?.version || '')],
    [() => !!win.AOS, () => 'AOS'],
    [() => !!win.ScrollReveal, () => 'ScrollReveal'],
    [() => !!win.Swiper, () => 'Swiper ' + (win.Swiper?.version || '')],
    [() => !!win.THREE, () => 'Three.js r' + (win.THREE?.REVISION || '')],
    [() => !!win.gtag, () => 'Google Analytics (gtag)'],
    [() => !!win.fbq, () => 'Facebook Pixel'],
    [() => !!win.Intercom, () => 'Intercom'],
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
  const metaDescription = (document.querySelector('meta[name="description"]') as HTMLMetaElement)?.content || '';
  const elementSummary = Array.from(document.body.querySelectorAll('*'))
    .filter(el => el.children.length === 0 && (el.textContent || '').trim().length > 0)
    .map(el => ({ tag: el.tagName.toLowerCase(), text: norm(el.textContent).slice(0, 100), className: (el.className || '').toString().slice(0, 80) }))
    .slice(0, 80);
  const images = Array.from(document.querySelectorAll('img[src]'))
    .map(img => (img as HTMLImageElement).src).filter(Boolean).slice(0, 30);
  const hasNavToggle = !!document.querySelector('[class*="hamburger"],[class*="menu-toggle"],[class*="nav-toggle"],[aria-label*="menu"]');
  const filterItems = uniqArr(Array.from(document.querySelectorAll('[class*="filter"] button,[class*="tab"] button')).map(el => norm(el.textContent)).filter(Boolean));

  // Extract CSS, JS links and inline CSS text
  const cssUrls: string[] = [];
  const jsUrls: string[] = [];
  const cssTexts: string[] = [];
  document.querySelectorAll('link[rel="stylesheet"]').forEach(el => {
    try {
      const href = (el as HTMLLinkElement).href;
      if (href) cssUrls.push(href);
    } catch {}
  });
  document.querySelectorAll('script[src]').forEach(el => {
    try {
      const src = (el as HTMLScriptElement).src;
      if (src) jsUrls.push(src);
    } catch {}
  });
  document.querySelectorAll('style').forEach(el => {
    try {
      const text = el.textContent;
      if (text) cssTexts.push(text);
    } catch {}
  });
  for (let i = 0; i < document.styleSheets.length; i++) {
    try {
      const sheet = document.styleSheets[i];
      const rules = sheet.cssRules || sheet.rules;
      if (rules) {
        let css = '';
        for (let j = 0; j < rules.length; j++) {
          css += rules[j].cssText + '\n';
        }
        cssTexts.push(css);
      }
    } catch (e) {}
  }

  const isCfChallenge = !!document.querySelector('#challenge-form, #challenge-stage, #cf-wrapper') ||
                       document.title.toLowerCase().includes('just a moment') ||
                       document.title.toLowerCase().includes('verify you are human') ||
                       document.title.toLowerCase().includes('performing security verification') ||
                       document.title.toLowerCase().includes('checking if the site connection is secure');

  return {
    isCfChallenge,
    customProperties, gradientProperties, glowProperties, computedStyles,
    colorSamples: [...colorSet].slice(0, 60), contactInfo, htmlRoutes,
    microCopy, cardDescriptions, stats, libraryEvidence, headings,
    navLinks, visibleButtons, bodyFont, h1Font, title, metaDescription,
    elementSummary, images, hasNavToggle, filterItems,
    forms: Array.from(document.querySelectorAll('form')).map(f => ({ action: f.action, method: f.method, fields: Array.from(f.querySelectorAll('input,select,textarea')).map(i => (i as HTMLInputElement).name || i.type).filter(Boolean) })).slice(0, 5),
    cssUrls,
    jsUrls,
    cssTexts,
  };
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function parseDataFromHtml(html: string, baseUrl: string) {
  const norm = (s: string) => s.replace(/\s+/g, ' ').trim();
  const stripHtml = (s: string) => norm(s.replace(/<[^>]*>/g, ''));

  const lowercaseHtml = html.toLowerCase();
  const isCfChallenge = lowercaseHtml.includes('id="challenge-form"') || 
                        lowercaseHtml.includes('id="challenge-stage"') || 
                        lowercaseHtml.includes('verify you are human') ||
                        lowercaseHtml.includes('performing security verification') ||
                        lowercaseHtml.includes('attention required! | cloudflare') ||
                        lowercaseHtml.includes('checking if the site connection is secure') ||
                        lowercaseHtml.includes('just a moment') ||
                        lowercaseHtml.includes('cf-challenge');

  let title = '';
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) title = decodeHtmlEntities(titleMatch[1].trim());

  let metaDescription = '';
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
                    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  if (descMatch) metaDescription = decodeHtmlEntities(descMatch[1].trim());

  const cssUrls: string[] = [];
  const jsUrls: string[] = [];
  const cssTexts: string[] = [];

  // Extract link tags rel="stylesheet"
  const linkRegex = /<link[^>]+>/gi;
  let linkMatch;
  while ((linkMatch = linkRegex.exec(html)) !== null) {
    const tag = linkMatch[0];
    if (/rel=["']stylesheet["']/i.test(tag)) {
      const hrefMatch = tag.match(/href=["']([^"']+)["']/i);
      if (hrefMatch) {
        try {
          cssUrls.push(new URL(hrefMatch[1], baseUrl).href);
        } catch {
          cssUrls.push(hrefMatch[1]);
        }
      }
    }
  }

  // Extract scripts src
  const scriptRegex = /<script[^>]+src=["']([^"']+)["']/gi;
  let scriptMatch;
  while ((scriptMatch = scriptRegex.exec(html)) !== null) {
    try {
      jsUrls.push(new URL(scriptMatch[1], baseUrl).href);
    } catch {
      jsUrls.push(scriptMatch[1]);
    }
  }

  // Extract inline style tags
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let styleMatch;
  while ((styleMatch = styleRegex.exec(html)) !== null) {
    cssTexts.push(styleMatch[1]);
  }

  // Extract style attribute properties
  const styleAttrRegex = /style=["']([^"']+)["']/gi;
  let sam;
  while ((sam = styleAttrRegex.exec(html)) !== null) {
    cssTexts.push(sam[1]);
  }

  // Extract routes
  const htmlRoutes: string[] = [];
  const aRegex = /<a[^>]+href=["']([^"']+)["']/gi;
  let am;
  const parsedBase = new URL(baseUrl);
  while ((am = aRegex.exec(html)) !== null) {
    const href = am[1];
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) continue;
    try {
      const parsed = new URL(href, baseUrl);
      if (parsed.hostname === parsedBase.hostname) {
        htmlRoutes.push(parsed.pathname);
      }
    } catch {}
  }
  const uniqRoutes = [...new Set(htmlRoutes)].slice(0, 80);

  // Extract headings
  const headings = { h1: [] as string[], h2: [] as string[], h3: [] as string[] };
  const h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/gi;
  let hm;
  while ((hm = h1Regex.exec(html)) !== null) {
    const t = stripHtml(decodeHtmlEntities(hm[1]));
    if (t) headings.h1.push(t);
  }
  headings.h1 = headings.h1.slice(0, 5);

  const h2Regex = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  while ((hm = h2Regex.exec(html)) !== null) {
    const t = stripHtml(decodeHtmlEntities(hm[1]));
    if (t) headings.h2.push(t);
  }
  headings.h2 = headings.h2.slice(0, 10);

  const h3Regex = /<h3[^>]*>([\s\S]*?)<\/h3>/gi;
  while ((hm = h3Regex.exec(html)) !== null) {
    const t = stripHtml(decodeHtmlEntities(hm[1]));
    if (t) headings.h3.push(t);
  }
  headings.h3 = headings.h3.slice(0, 15);

  // Extract images
  const images: string[] = [];
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  let im;
  while ((im = imgRegex.exec(html)) !== null) {
    try {
      images.push(new URL(im[1], baseUrl).href);
    } catch {
      images.push(im[1]);
    }
  }
  const uniqImages = [...new Set(images)].slice(0, 30);

  // Extract forms
  const forms: any[] = [];
  const formRegex = /<form([^>]*)>([\s\S]*?)<\/form>/gi;
  let fm;
  while ((fm = formRegex.exec(html)) !== null) {
    const attrs = fm[1];
    const content = fm[2];
    const actionMatch = attrs.match(/action=["']([^"']+)["']/i);
    const methodMatch = attrs.match(/method=["']([^"']+)["']/i);
    const action = actionMatch ? actionMatch[1] : '';
    const method = methodMatch ? methodMatch[1] : 'get';
    const fields: string[] = [];
    const inputRegex = /<(input|select|textarea)[^>]*>/gi;
    let ipm;
    while ((ipm = inputRegex.exec(content)) !== null) {
      const tag = ipm[0];
      const nameMatch = tag.match(/name=["']([^"']+)["']/i);
      const typeMatch = tag.match(/type=["']([^"']+)["']/i);
      if (nameMatch) {
        fields.push(nameMatch[1]);
      } else if (typeMatch) {
        fields.push(typeMatch[1]);
      }
    }
    forms.push({ action, method, fields: fields.slice(0, 20) });
  }

  // Extract library evidence
  const libraryEvidence: string[] = [];
  if (jsUrls.some(u => u.includes('react') || u.includes('/chunks/')) || lowercaseHtml.includes('react-root') || lowercaseHtml.includes('_next/data')) {
    libraryEvidence.push('React');
  }
  if (jsUrls.some(u => u.includes('next.js') || u.includes('_next/static'))) {
    libraryEvidence.push('Next.js');
  }
  if (jsUrls.some(u => u.includes('nuxt') || u.includes('/_nuxt/')) || lowercaseHtml.includes('__nuxt')) {
    libraryEvidence.push('Nuxt');
  }
  if (jsUrls.some(u => u.includes('vue'))) {
    libraryEvidence.push('Vue');
  }
  if (jsUrls.some(u => u.includes('jquery'))) {
    libraryEvidence.push('jQuery');
  }
  if (jsUrls.some(u => u.includes('bootstrap'))) {
    libraryEvidence.push('Bootstrap');
  }
  if (jsUrls.some(u => u.includes('gsap'))) {
    libraryEvidence.push('GSAP');
  }
  if (jsUrls.some(u => u.includes('swiper'))) {
    libraryEvidence.push('Swiper');
  }
  if (jsUrls.some(u => u.includes('three'))) {
    libraryEvidence.push('Three.js');
  }
  if (lowercaseHtml.includes('gtag') || lowercaseHtml.includes('google-analytics')) {
    libraryEvidence.push('Google Analytics (gtag)');
  }
  if (libraryEvidence.length === 0) {
    libraryEvidence.push('Static HTML site');
  }

  // Extract navLinks
  const navLinks: string[] = [];
  const navRegex = /<nav[^>]*>([\s\S]*?)<\/nav>/gi;
  let nm;
  while ((nm = navRegex.exec(html)) !== null) {
    const navContent = nm[1];
    const navA = /<a[^>]*>([\s\S]*?)<\/a>/gi;
    let nam;
    while ((nam = navA.exec(navContent)) !== null) {
      const t = stripHtml(decodeHtmlEntities(nam[1]));
      if (t) navLinks.push(t);
    }
  }
  const uniqNavLinks = [...new Set(navLinks)].slice(0, 30);

  // Extract visibleButtons
  const visibleButtons: string[] = [];
  const btnRegex = /<(?:button|a)[^>]+class=["'][^"']*(?:btn|button)[^"']*["'][^>]*>([\s\S]*?)<\/(?:button|a)>/gi;
  let bm;
  while ((bm = btnRegex.exec(html)) !== null) {
    const t = stripHtml(decodeHtmlEntities(bm[1]));
    if (t && t.length < 50) visibleButtons.push(t);
  }
  const rawBtnRegex = /<button[^>]*>([\s\S]*?)<\/button>/gi;
  while ((bm = rawBtnRegex.exec(html)) !== null) {
    const t = stripHtml(decodeHtmlEntities(bm[1]));
    if (t && t.length < 50) visibleButtons.push(t);
  }
  const uniqVisibleButtons = [...new Set(visibleButtons)].slice(0, 30);

  // Leaf tag elementSummary
  const elementSummary: any[] = [];
  const leafTagRegex = /<([a-zA-Z1-6]+)([^>]*)>([^<]+)<\/\1>/g;
  let lm;
  while ((lm = leafTagRegex.exec(html)) !== null) {
    const tag = lm[1].toLowerCase();
    if (['script', 'style', 'noscript', 'iframe', 'svg', 'path', 'a', 'span'].includes(tag)) continue;
    const attrs = lm[2];
    const text = stripHtml(decodeHtmlEntities(lm[3]));
    const classMatch = attrs.match(/class=["']([^"']+)["']/i);
    const className = classMatch ? classMatch[1] : '';
    if (text && text.length < 100) {
      elementSummary.push({ tag, text, className });
    }
    if (elementSummary.length >= 80) break;
  }

  // Extract contactInfo
  const emails: string[] = [];
  const phones: string[] = [];
  const addresses: string[] = [];
  const mailtoMatch = html.matchAll(/href=["']mailto:([^"']+)["']/gi);
  for (const m of mailtoMatch) {
    emails.push(m[1].split('?')[0]);
  }
  const telMatch = html.matchAll(/href=["']tel:([^"']+)["']/gi);
  for (const m of telMatch) {
    phones.push(m[1]);
  }

  // Extract paragraphs as cardDescriptions
  const cardDescriptions: string[] = [];
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let pm;
  while ((pm = pRegex.exec(html)) !== null) {
    const t = stripHtml(decodeHtmlEntities(pm[1]));
    if (t && t.length > 10 && t.length < 250) {
      cardDescriptions.push(t);
    }
  }

  return {
    customProperties: {},
    gradientProperties: {},
    glowProperties: {},
    computedStyles: {},
    colorSamples: [],
    contactInfo: {
      emails: [...new Set(emails)],
      phones: [...new Set(phones)],
      addresses
    },
    htmlRoutes: uniqRoutes,
    microCopy: [],
    cardDescriptions: cardDescriptions.slice(0, 20),
    stats: [],
    libraryEvidence,
    headings,
    navLinks: uniqNavLinks,
    visibleButtons: uniqVisibleButtons,
    bodyFont: null,
    h1Font: null,
    title,
    metaDescription,
    elementSummary,
    images: uniqImages,
    hasNavToggle: html.includes('hamburger') || html.includes('menu-toggle') || html.includes('nav-toggle'),
    filterItems: [],
    isCfChallenge,
    forms,
    cssUrls,
    jsUrls,
    cssTexts,
  };
}

export default defineEventHandler(async (event) => {
  const { url } = await readBody(event);
  if (!url) throw createError({ statusCode: 400, message: 'url is required' });

  let targetUrl: string;
  try {
    targetUrl = new URL(url).href;
  } catch {
    throw createError({ statusCode: 400, message: 'Invalid URL' });
  }

  const cfEnv = (event.context.cloudflare?.env || {}) as Record<string, any>;
  const myBrowser = cfEnv.MYBROWSER;
  const scrapeDoToken = cfEnv.SCRAPE_DO_TOKEN || useRuntimeConfig().scrapeDoToken;

  // Variables to be populated by either execution branch
  let desktop: any = {};
  let mobile: any = {};
  let desktopScreenshot = '';
  let mobileScreenshot = '';
  let crawled = false;

  // ─── Mode A: Scrape.do (Super Proxy/Render mode) ──────────────────────
  if (scrapeDoToken) {
    try {
      console.log("Attempting crawl with Scrape.do...");
      const regex = /<script id="extracted-design-data" type="application\/json">([\s\S]*?)<\/script>/;

      function verifyScrapeDoResponse(json: any) {
        const html = json.content || '';
        const lowercaseHtml = html.toLowerCase();
        const isCfChallenge = lowercaseHtml.includes('id="challenge-form"') || 
                              lowercaseHtml.includes('id="challenge-stage"') || 
                              lowercaseHtml.includes('verify you are human') ||
                              lowercaseHtml.includes('performing security verification') ||
                              lowercaseHtml.includes('attention required! | cloudflare') ||
                              lowercaseHtml.includes('checking if the site connection is secure') ||
                              lowercaseHtml.includes('just a moment') ||
                              lowercaseHtml.includes('cf-challenge');
        
        if (isCfChallenge) {
          throw new Error("Scrape.do response contains a Cloudflare challenge page / Turnstile CAPTCHA");
        }
        if (!html.trim()) {
          throw new Error("Scrape.do returned empty content");
        }
      }

      // Helper function to call Scrape.do with standard or super proxies
      async function scrapeWithDo(superProxy: boolean, isMobile: boolean): Promise<any> {
        const playWithBrowser = [
          {
            "Action": "Execute",
            "Execute": `(async () => {
              try {
                const overlaySelectors = [
                  "div[class*='login-modal']", "div[id*='login-modal']",
                  "div[class*='signup-modal']", "div[id*='signup-modal']",
                  "div[role='dialog']", "div[class*='overlay']",
                  "div[class*='popup']", "div[class*='modal-backdrop']",
                  "div[class*='modal-wrapper']", "div[class*='Modal-root']",
                  "#challenge-stage", "#challenge-form", "#cf-wrapper",
                  ".cf-turnstile", "#turnstile-wrapper", ".cf-turnstile-wrapper",
                  "iframe[src*='challenges.cloudflare.com']"
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

              try {
                const totalHeight = document.body.scrollHeight;
                const step = Math.floor(window.innerHeight * 0.8) || 600;
                for (let pos = 0; pos < totalHeight; pos += step) {
                  window.scrollTo(0, pos);
                  await new Promise(r => setTimeout(r, 120));
                }
                window.scrollTo(0, 0);
                await new Promise(r => setTimeout(r, 300));
              } catch (e) {}

              try {
                const data = (${getDomData.toString()})();
                const script = document.createElement("script");
                script.id = "extracted-design-data";
                script.type = "application/json";
                script.textContent = JSON.stringify(data);
                document.body.appendChild(script);
              } catch (e) {
                const script = document.createElement("script");
                script.id = "extracted-design-data";
                script.type = "application/json";
                script.textContent = JSON.stringify({ error: e.message });
                document.body.appendChild(script);
              }
            })()`
          },
          {
            "Action": "Wait",
            "Timeout": 3000
          }
        ];

        const headers = {
          'User-Agent': isMobile 
            ? "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
            : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        };

        const params = new URLSearchParams({
          token: scrapeDoToken,
          url: targetUrl,
          render: 'true',
          fullScreenShot: 'true',
          returnJSON: 'true',
          width: isMobile ? '390' : '1440',
          height: isMobile ? '844' : '1000',
          customHeaders: 'true',
          playWithBrowser: JSON.stringify(playWithBrowser)
        });
        if (superProxy) {
          params.append('super', 'true');
        }

        const res = await fetch(`https://api.scrape.do/?${params.toString()}`, { headers });
        if (!res.ok) {
          const errText = await res.text().catch(() => 'unknown');
          throw new Error(`Status ${res.status}: ${errText.slice(0, 200)}`);
        }
        return res.json();
      }

      // 1. Desktop Crawl
      let desktopJson: any;
      try {
        console.log("Scrape.do: Attempting desktop crawl with standard proxies...");
        desktopJson = await scrapeWithDo(false, false);
        verifyScrapeDoResponse(desktopJson);
      } catch (err: any) {
        console.warn("Scrape.do: Standard desktop crawl failed or blocked, retrying with super proxy...", err.message);
        desktopJson = await scrapeWithDo(true, false);
        verifyScrapeDoResponse(desktopJson);
      }

      const desktopHtml = desktopJson.content || '';
      desktopScreenshot = desktopJson.screenShots?.[0]?.image || '';

      const desktopMatch = desktopHtml.match(regex);
      let desktopDomData: any = {};
      if (desktopMatch && desktopMatch[1]) {
        try {
          desktopDomData = JSON.parse(desktopMatch[1].trim());
        } catch (e) {
          console.error("Failed to parse Scrape.do Desktop DOM data:", e);
        }
      }

      // If Scrape.do DOM data extraction failed (likely due to CSP preventing script injection), fallback to raw HTML parsing
      const desktopCustomPropsCount = Object.keys(desktopDomData.customProperties || {}).length;
      if (!desktopDomData.title && desktopCustomPropsCount === 0) {
        console.log("Scrape.do Desktop: JS extraction empty. Running raw HTML fallback parser...");
        desktopDomData = parseDataFromHtml(desktopHtml, targetUrl);
      }

      desktop = {
        domData: desktopDomData,
        cssUrls: desktopDomData.cssUrls || [],
        cssTexts: desktopDomData.cssTexts || [],
        jsUrls: desktopDomData.jsUrls || []
      };

      // 2. Mobile Crawl
      let mobileJson: any;
      try {
        console.log("Scrape.do: Attempting mobile crawl with standard proxies...");
        mobileJson = await scrapeWithDo(false, true);
        verifyScrapeDoResponse(mobileJson);
      } catch (err: any) {
        console.warn("Scrape.do: Standard mobile crawl failed or blocked, retrying with super proxy...", err.message);
        mobileJson = await scrapeWithDo(true, true);
        verifyScrapeDoResponse(mobileJson);
      }

      const mobileHtml = mobileJson.content || '';
      mobileScreenshot = mobileJson.screenShots?.[0]?.image || '';

      const mobileMatch = mobileHtml.match(regex);
      let mobileDomData: any = {};
      if (mobileMatch && mobileMatch[1]) {
        try {
          mobileDomData = JSON.parse(mobileMatch[1].trim());
        } catch (e) {
          console.error("Failed to parse Scrape.do Mobile DOM data:", e);
        }
      }

      // If Scrape.do DOM data extraction failed (likely due to CSP preventing script injection), fallback to raw HTML parsing
      const mobileCustomPropsCount = Object.keys(mobileDomData.customProperties || {}).length;
      if (!mobileDomData.title && mobileCustomPropsCount === 0) {
        console.log("Scrape.do Mobile: JS extraction empty. Running raw HTML fallback parser...");
        mobileDomData = parseDataFromHtml(mobileHtml, targetUrl);
      }

      mobile = {
        domData: mobileDomData
      };

      crawled = true;
      console.log("Scrape.do crawl completed successfully.");
    } catch (err: any) {
      console.warn("Scrape.do crawl failed completely, falling back to next available crawler. Error:", err.message);
    }
  }

  function verifyPuppeteerResponse(data: any) {
    if (!data || !data.domData) {
      throw new Error("Puppeteer returned empty data structure");
    }
    const title = (data.domData.title || '').toLowerCase();
    const hasChallengeTitle = title.includes('verify you are human') || 
                              title.includes('checking if the site connection is secure') ||
                              title.includes('performing security verification') ||
                              title.includes('cloudflare') ||
                              title.includes('attention required! | cloudflare') ||
                              title.includes('just a moment');
    const headingsCount = (data.domData.headings?.h1?.length || 0) + (data.domData.headings?.h2?.length || 0);
    const isCf = hasChallengeTitle || (!!data.domData.isCfChallenge && headingsCount === 0);
    if (isCf) {
      throw new Error("Puppeteer request was blocked by Cloudflare Turnstile CAPTCHA");
    }
  }

  // ─── Mode B: Cloudflare Browser Rendering (Production) ────────────────
  if (!crawled && myBrowser) {
    try {
      console.log("Attempting crawl with Cloudflare Browser Rendering...");
      const puppeteerModule = await import('@cloudflare/puppeteer');
      const puppeteer = puppeteerModule.default || puppeteerModule;
      const browser = await puppeteer.launch(myBrowser);

      const cssTexts: string[] = [];
      const cssUrls: string[] = [];
      const jsUrls: string[] = [];

      try {
        // 1. Desktop Crawl & Screenshot
        const desktopPage = await browser.newPage();

        // Apply basic stealth to hide webdriver flags and match platform
        await desktopPage.evaluateOnNewDocument(() => {
          Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
          Object.defineProperty(navigator, 'platform', { get: () => 'Linux x86_64' });
          Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
          Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
          Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
          Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
        });

        await desktopPage.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
        const desktopUa = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
        await desktopPage.setUserAgent(desktopUa);

        // Listen for stylesheet/script network responses on desktop run
        desktopPage.on('response', async (response) => {
          try {
            const req = response.request();
            const rUrl = response.url();
            const type = req.resourceType();
            if (type === 'stylesheet') {
              cssUrls.push(rUrl);
              const text = await response.text();
              if (text) cssTexts.push(text);
            }
            if (type === 'script') {
              jsUrls.push(rUrl);
            }
          } catch {}
        });

        await desktopPage.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});

        // Bypass Amazon soft captcha page if present
        try {
          const captchaForm = await desktopPage.$("form[action*='/errors/validateCaptcha'], form[action*='/captcha']");
          if (captchaForm) {
            const submitBtn = await captchaForm.$("button, input[type='submit']");
            if (submitBtn) {
              await Promise.all([
                submitBtn.click(),
                desktopPage.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {})
              ]);
            }
          }
        } catch (e) {}

        // Dismiss standard overlays/modals using Escape key
        try {
          await new Promise(r => setTimeout(r, 1000));
          await desktopPage.keyboard.press('Escape');
          await new Promise(r => setTimeout(r, 500));
        } catch (e) {}

        // Scroll to trigger lazy loading and reveal animations
        await desktopPage.evaluate(async () => {
          try {
            const overlaySelectors = [
              "div[class*='login-modal']", "div[id*='login-modal']",
              "div[class*='signup-modal']", "div[id*='signup-modal']",
              "div[role='dialog']", "div[class*='overlay']",
              "div[class*='popup']", "div[class*='modal-backdrop']",
              "div[class*='modal-wrapper']", "div[class*='Modal-root']",
              "#challenge-stage", "#challenge-form", "#cf-wrapper",
              ".cf-turnstile", "#turnstile-wrapper", ".cf-turnstile-wrapper",
              "iframe[src*='challenges.cloudflare.com']"
            ];
            for (const sel of overlaySelectors) {
              document.querySelectorAll(sel).forEach(el => {
                if (el.tagName !== "BODY" && el.tagName !== "HTML" && el.tagName !== "MAIN") {
                  (el as HTMLElement).style.setProperty("display", "none", "important");
                }
              });
            }
            document.body.style.setProperty("overflow", "auto", "important");
            document.body.style.setProperty("position", "static", "important");
            document.documentElement.style.setProperty("overflow", "auto", "important");
          } catch (e) {}

          const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
          const totalHeight = document.body.scrollHeight;
          const step = Math.floor(window.innerHeight * 0.8);
          for (let pos = 0; pos < totalHeight; pos += step) {
            window.scrollTo(0, pos);
            await delay(120);
          }
          window.scrollTo(0, 0);
          await delay(300);
        });

        // Extract DOM Data
        const desktopDomData = await desktopPage.evaluate(getDomData);
        desktop = {
          domData: desktopDomData,
          cssUrls,
          cssTexts,
          jsUrls
        };
        verifyPuppeteerResponse(desktop);

        // Take screenshot
        desktopScreenshot = await desktopPage.screenshot({
          type: 'jpeg',
          quality: 75,
          fullPage: true,
          encoding: 'base64'
        }) as string;

        await desktopPage.close();

        // 2. Mobile Crawl & Screenshot
        const mobilePage = await browser.newPage();

        // Apply basic stealth to hide webdriver flags and match platform
        await mobilePage.evaluateOnNewDocument(() => {
          Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
          Object.defineProperty(navigator, 'platform', { get: () => 'Linux armv8l' });
          Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
          Object.defineProperty(navigator, 'deviceMemory', { get: () => 4 });
          Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 4 });
          Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
        });

        await mobilePage.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
        const mobileUa = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
        await mobilePage.setUserAgent(mobileUa);

        await mobilePage.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});

        // Bypass Amazon soft captcha page if present on mobile
        try {
          const captchaForm = await mobilePage.$("form[action*='/errors/validateCaptcha'], form[action*='/captcha']");
          if (captchaForm) {
            const submitBtn = await captchaForm.$("button, input[type='submit']");
            if (submitBtn) {
              await Promise.all([
                submitBtn.click(),
                mobilePage.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {})
              ]);
            }
          }
        } catch (e) {}

        // Dismiss standard overlays/modals using Escape key
        try {
          await new Promise(r => setTimeout(r, 1000));
          await mobilePage.keyboard.press('Escape');
          await new Promise(r => setTimeout(r, 500));
        } catch (e) {}

        // Scroll to trigger lazy loading and reveal animations on mobile
        await mobilePage.evaluate(async () => {
          try {
            const overlaySelectors = [
              "div[class*='login-modal']", "div[id*='login-modal']",
              "div[class*='signup-modal']", "div[id*='signup-modal']",
              "div[role='dialog']", "div[class*='overlay']",
              "div[class*='popup']", "div[class*='modal-backdrop']",
              "div[class*='modal-wrapper']", "div[class*='Modal-root']",
              "#challenge-stage", "#challenge-form", "#cf-wrapper",
              ".cf-turnstile", "#turnstile-wrapper", ".cf-turnstile-wrapper",
              "iframe[src*='challenges.cloudflare.com']"
            ];
            for (const sel of overlaySelectors) {
              document.querySelectorAll(sel).forEach(el => {
                if (el.tagName !== "BODY" && el.tagName !== "HTML" && el.tagName !== "MAIN") {
                  (el as HTMLElement).style.setProperty("display", "none", "important");
                }
              });
            }
            document.body.style.setProperty("overflow", "auto", "important");
            document.body.style.setProperty("position", "static", "important");
            document.documentElement.style.setProperty("overflow", "auto", "important");
          } catch (e) {}

          const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
          const totalHeight = document.body.scrollHeight;
          const step = Math.floor(window.innerHeight * 0.8);
          for (let pos = 0; pos < totalHeight; pos += step) {
            window.scrollTo(0, pos);
            await delay(120);
          }
          window.scrollTo(0, 0);
          await delay(300);
        });

        // Extract DOM Data
        const mobileDomData = await mobilePage.evaluate(getDomData);
        mobile = {
          domData: mobileDomData
        };
        verifyPuppeteerResponse(mobile);

        // Take screenshot
        mobileScreenshot = await mobilePage.screenshot({
          type: 'jpeg',
          quality: 75,
          fullPage: true,
          encoding: 'base64'
        }) as string;

        await mobilePage.close();
      } finally {
        await browser.close();
      }
      crawled = true;
      console.log("Cloudflare Browser Rendering crawl completed successfully.");
    } catch (err: any) {
      console.warn("Cloudflare Browser Rendering crawl failed, falling back to Browserless. Error:", err.message);
    }
  }

  // ─── Mode C: Browserless.io (Local Dev Fallback) ───────────────────────
  if (!crawled) {
    console.log("Attempting crawl with Browserless.io...");
    const apiKey = cfEnv.BROWSERLESS_API_KEY || cfEnv.NUXT_BROWSERLESS_API_KEY || useRuntimeConfig().browserlessApiKey;
    if (!apiKey) throw createError({ statusCode: 500, message: 'BROWSERLESS_API_KEY not set' });

    const BROWSERLESS_BASE = `https://production-sfo.browserless.io`;

    // ─── Helper: call Browserless /function endpoint ──────────────────────────
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
        '        "div[class*=\'modal-wrapper\']", "div[class*=\'Modal-root\']",',
        '        "#challenge-stage", "#challenge-form", "#cf-wrapper",',
        '        ".cf-turnstile", "#turnstile-wrapper", ".cf-turnstile-wrapper",',
        '        "iframe[src*=\'challenges.cloudflare.com\']"',
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
          try {
            const overlaySelectors = [
              "div[class*='login-modal']", "div[id*='login-modal']",
              "div[class*='signup-modal']", "div[id*='signup-modal']",
              "div[role='dialog']", "div[class*='overlay']",
              "div[class*='popup']", "div[class*='modal-backdrop']",
              "div[class*='modal-wrapper']", "div[class*='Modal-root']",
              "#challenge-stage", "#challenge-form", "#cf-wrapper",
              ".cf-turnstile", "#turnstile-wrapper", ".cf-turnstile-wrapper",
              "iframe[src*='challenges.cloudflare.com']"
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

        const domData = await page.evaluate(${getDomData.toString()});

        return { data: { domData, cssUrls, cssTexts, jsUrls } };
      };
    `;

    try {
      const desktopResult = await runInBrowser(domExtractionScript, { width: 1440, height: 1000 });
      desktopScreenshot = await takeScreenshot(1440, 1000);
      const mobileResult = await runInBrowser(domExtractionScript, { width: 390, height: 844 });
      mobileScreenshot = await takeScreenshot(390, 844);

      desktop = desktopResult?.data || {};
      mobile = mobileResult?.data || {};

      verifyPuppeteerResponse(desktop);
      verifyPuppeteerResponse(mobile);
    } catch (err: any) {
      throw createError({
        statusCode: 500,
        message: err.message || 'Crawl failed',
      });
    }
  }

  // ─── Shared Processing of Results ───────────────────────────────────────
  try {
    // If external stylesheets failed to load in browser (combined length is very small or empty)
    const combinedLength = (desktop.cssTexts || []).join('').length;
    if (combinedLength < 5000 && (desktop.cssUrls || []).length > 0 && scrapeDoToken) {
      console.log("External stylesheets failed to load in browser. Fetching via Scrape.do proxy fallback...");
      const fetchPromises = (desktop.cssUrls || []).slice(0, 5).map(async (cssUrl: string) => {
        try {
          const absoluteUrl = new URL(cssUrl, targetUrl).href;
          const params = new URLSearchParams({
            token: scrapeDoToken,
            url: absoluteUrl,
            super: 'true'
          });
          const res = await fetch(`https://api.scrape.do/?${params.toString()}`, {
            signal: AbortSignal.timeout(6000)
          });
          if (res.ok) {
            const text = await res.text();
            console.log(`Successfully fetched CSS via proxy fallback: ${cssUrl.slice(0, 60)}... (${text.length} bytes)`);
            return text;
          }
        } catch (e: any) {
          console.warn(`Failed to fetch CSS fallback for ${cssUrl}:`, e.message);
        }
        return '';
      });
      const fetchedTexts = await Promise.all(fetchPromises);
      for (const text of fetchedTexts) {
        if (text) {
          desktop.cssTexts = desktop.cssTexts || [];
          desktop.cssTexts.push(text);
        }
      }
    }

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
      message: err.message || 'Processing results failed',
    });
  }
});
