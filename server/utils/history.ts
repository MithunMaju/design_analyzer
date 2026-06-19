export function extractSummary(report: string): string {
  if (!report) return '';
  // Extract text under 'Executive Summary' line up to the next heading.
  // Uses [^\n]*? to robustly match headings containing bold tags (**Executive Summary**), numbers, or trailing punctuation.
  const match = report.match(/(?:#+)\s+[^\n]*?Executive Summary[^\n]*?\n+([\s\S]*?)(?=\n+#+|$)/i);
  if (match && match[1]) {
    // Strip evidence tags like [observed] or [inferred] to make it clean for a homepage card
    return match[1]
      .replace(/\[observed\]/gi, '')
      .replace(/\[inferred\]/gi, '')
      .replace(/\[unverified\]/gi, '')
      .trim();
  }
  return '';
}

export function inferCategory(url: string, title: string, summary: string, detectedLibraries: any): string {
  const text = `${url} ${title} ${summary}`.toLowerCase();
  
  // Use regex with word boundaries to avoid matching substrings like "trip" inside "stripe"
  if (/\b(travel|hotel|booking|flight|airbnb|trips?|vacation)\b/i.test(text)) {
    return 'Travel & Tourism';
  }
  if (/\b(shop|store|ecommerce|buy|retail|ikea|cart|shopify)\b/i.test(text)) {
    return 'Shopping & E-commerce';
  }
  if (/\b(finance|bank|pay|stripe|crypto|billing|wallet|checkout)\b/i.test(text)) {
    return 'Finance & Payments';
  }
  if (/\b(ai|artificial|gpt|gemini|llm|chatbot|lovable|openai|claude|copilot|deepmind|prompt)\b/i.test(text)) {
    return 'AI & Machine Learning';
  }
  if (/\b(productivity|task|project|collab|linear|slack|notion|workflow)\b/i.test(text)) {
    return 'Productivity & SaaS';
  }
  if (/\b(portfolio|personal|designer|developer|resume|cv)\b/i.test(text) || text.includes('about me')) {
    return 'Portfolio & Personal';
  }
  if (/\b(news|blog|magazine|article|journal|read|reddit)\b/i.test(text)) {
    return 'Media & Content';
  }
  if (/\b(dev|code|git|api|library|npm|documentation|github)\b/i.test(text)) {
    return 'Developer Tools';
  }
  if (/\b(social|community|chat|forum|network)\b/i.test(text)) {
    return 'Social & Community';
  }
  
  // Look at libraries
  if (detectedLibraries) {
    const libs = JSON.stringify(detectedLibraries).toLowerCase();
    if (libs.includes('stripe')) return 'Finance & Payments';
    if (libs.includes('shopify')) return 'Shopping & E-commerce';
  }
  
  return 'Technology'; // Fallback category
}

export function parseColorToHex(colorStr: string): string | null {
  if (!colorStr) return null;
  colorStr = colorStr.trim();

  // Hex format already
  if (colorStr.startsWith('#')) {
    const match = colorStr.match(/^#([0-9a-fA-F]{3,8})/);
    if (match) {
      const hex = match[1];
      if (hex.length === 3 || hex.length === 6) return `#${hex}`;
      if (hex.length === 4 || hex.length === 8) return `#${hex.slice(0, hex.length === 4 ? 3 : 6)}`;
      return colorStr;
    }
  }

  // RGB/RGBA formats (e.g. rgb(255 69 0) or rgba(59,130,246,.5))
  const rgbMatch = colorStr.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      const toHex = (c: number) => {
        const hex = Math.min(255, Math.max(0, c)).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
  }

  return null;
}

export function isColorful(hex: string): boolean {
  const match = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!match) return false;
  const r = parseInt(match[1], 16);
  const g = parseInt(match[2], 16);
  const b = parseInt(match[3], 16);
  
  // Neutral colors (grayscale) have very close rgb components
  const diff1 = Math.abs(r - g);
  const diff2 = Math.abs(g - b);
  const diff3 = Math.abs(b - r);
  if (diff1 < 25 && diff2 < 25 && diff3 < 25) return false;
  
  // Exclude extremely dark colors (blackish backgrounds)
  if (r < 30 && g < 30 && b < 30) return false;
  
  // Exclude extremely light colors (whitish backgrounds)
  if (r > 240 && g > 240 && b > 240) return false;
  
  return true;
}

export function extractColors(item: any): { primary: string, accent: string, bg: string, isDark: boolean } {
  const colors = {
    primary: '#635bff', // Default brand color (indigo)
    accent: '#ff5cbb',  // Default accent color (pink)
    bg: '#ffffff',      // Default page background (white)
    isDark: false
  };

  const cssColors = item.result?.curated?.cssEvidence?.colors || [];
  const props = item.result?.curated?.customProperties || [];

  // 1. Gather all parsed hex colors
  const parsedColors: string[] = [];
  const colorSet = new Set<string>();

  // Process custom properties first (more specific to element states)
  for (const prop of props) {
    if (!prop || typeof prop !== 'object' || !prop.value) continue;
    const hex = parseColorToHex(prop.value);
    if (hex && !colorSet.has(hex)) {
      colorSet.add(hex);
      parsedColors.push(hex);
    }
  }

  // Process stylesheet colors
  for (const c of cssColors) {
    const hex = parseColorToHex(c);
    if (hex && !colorSet.has(hex)) {
      colorSet.add(hex);
      parsedColors.push(hex);
    }
  }

  // 2. Extract background color candidate
  let bgCandidate = '';
  for (const prop of props) {
    if (!prop || typeof prop !== 'object' || !prop.name) continue;
    const name = prop.name.toLowerCase();
    if (name.includes('bg') || name.includes('background')) {
      const hex = parseColorToHex(prop.value);
      if (hex) {
        bgCandidate = hex;
        break;
      }
    }
  }

  if (!bgCandidate) {
    for (const hex of parsedColors) {
      if (hex === '#ffffff' || hex === '#000000' || hex === '#08090a' || hex === '#0b0c0e' || hex === '#f8f9fa' || hex === '#fcfbf8') {
        bgCandidate = hex;
        break;
      }
    }
  }

  if (bgCandidate) {
    colors.bg = bgCandidate;
    const hex = bgCandidate.toLowerCase();
    if (hex === '#000000' || hex === '#08090a' || hex === '#0b0c0e' || hex.startsWith('#1') || hex.startsWith('#0f')) {
      colors.isDark = true;
    }
  }

  // 3. Extract primary and accent brand colors (colorful elements)
  const colorful = parsedColors.filter(isColorful);

  if (colorful.length > 0) {
    let brandColor = '';
    for (const prop of props) {
      if (!prop || typeof prop !== 'object' || !prop.name) continue;
      const name = prop.name.toLowerCase();
      if (name.includes('primary') || name.includes('brand') || name.includes('logo')) {
        const hex = parseColorToHex(prop.value);
        if (hex && isColorful(hex)) {
          brandColor = hex;
          break;
        }
      }
    }

    if (brandColor) {
      colors.primary = brandColor;
      const remaining = colorful.filter(c => c !== brandColor);
      if (remaining.length > 0) {
        colors.accent = remaining[0];
      } else {
        colors.accent = brandColor;
      }
    } else {
      colors.primary = colorful[0];
      if (colorful.length > 1) {
        colors.accent = colorful[1];
      } else {
        colors.accent = colorful[0];
      }
      
      // Override: Prioritize reddish/orange branding colors (e.g. Reddit's #ff4500)
      const orangeOrRed = colorful.find(c => {
        const r = parseInt(c.slice(1,3), 16);
        const g = parseInt(c.slice(3,5), 16);
        const b = parseInt(c.slice(5,7), 16);
        return r > 200 && g < 120 && b < 80;
      });
      if (orangeOrRed) {
        colors.primary = orangeOrRed;
        const other = colorful.find(c => c !== orangeOrRed);
        if (other) colors.accent = other;
      }
    }
  }

  return colors;
}

export function cleanBrandTitle(title: string, domain: string): string {
  if (!title) return 'Design';
  
  let cleaned = title.trim();
  
  // Clean titles like "Stripe | Financial Infrastructure" or "Reddit - Dive into anything"
  if (cleaned.includes('|')) {
    cleaned = cleaned.split('|')[0].trim();
  } else if (cleaned.includes(' - ')) {
    cleaned = cleaned.split(' - ')[0].trim();
  } else if (cleaned.includes(' – ')) {
    cleaned = cleaned.split(' – ')[0].trim();
  } else if (cleaned.includes(':')) {
    cleaned = cleaned.split(':')[0].trim();
  }
  
  // If it matches domain or is a URL
  if (cleaned.includes('.') && cleaned.toLowerCase() === domain.toLowerCase()) {
    const parts = domain.split('.');
    cleaned = parts[0];
  }
  
  cleaned = cleaned.replace(/^(https?:\/\/)?(www\.)?/, '');
  
  // Capitalize first letter
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  
  return cleaned || 'Design';
}

export function detectFontFamily(item: any): { url: string, family: string, serif: boolean, fontStyle: string } {
  const domFonts = item.result?.curated?.domEvidence;
  const h1Font = domFonts?.desktop?.h1Font || domFonts?.mobile?.h1Font || '';
  const bodyFont = domFonts?.desktop?.bodyFont || domFonts?.mobile?.bodyFont || '';
  const fontFamilies = item.result?.curated?.cssEvidence?.fontFamilies || [];
  
  const allFontsStr = `${h1Font} ${bodyFont} ${fontFamilies.join(' ')}`.toLowerCase();
  
  // 1. Serif / Editorial fonts
  if (
    allFontsStr.includes('playfair') ||
    allFontsStr.includes('serif') ||
    allFontsStr.includes('garamond') ||
    allFontsStr.includes('georgia') ||
    allFontsStr.includes('times') ||
    allFontsStr.includes('editorial') ||
    allFontsStr.includes('lora') ||
    allFontsStr.includes('cormorant') ||
    allFontsStr.includes('merriweather') ||
    allFontsStr.includes('harvey')
  ) {
    return {
      url: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&display=swap',
      family: "'Cormorant Garamond', serif",
      serif: true,
      fontStyle: 'font-weight: 500; letter-spacing: -0.01em;'
    };
  }
  
  // 2. Mono / Tech fonts
  if (
    allFontsStr.includes('mono') ||
    allFontsStr.includes('code') ||
    allFontsStr.includes('consolas') ||
    allFontsStr.includes('courier') ||
    allFontsStr.includes('sfmono')
  ) {
    return {
      url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;700&display=swap',
      family: "'JetBrains Mono', monospace",
      serif: false,
      fontStyle: 'font-weight: 700; letter-spacing: -0.03em;'
    };
  }
  
  // 3. Modern display / Grotesk fonts
  if (
    allFontsStr.includes('grotesk') ||
    allFontsStr.includes('space') ||
    allFontsStr.includes('syne') ||
    allFontsStr.includes('clash')
  ) {
    return {
      url: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap',
      family: "'Space Grotesk', sans-serif",
      serif: false,
      fontStyle: 'font-weight: 700; letter-spacing: -0.04em;'
    };
  }

  // 4. Premium sans fonts like Outfit
  if (
    allFontsStr.includes('outfit') ||
    allFontsStr.includes('lexend') ||
    allFontsStr.includes('sora')
  ) {
    return {
      url: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;700;800&display=swap',
      family: "'Outfit', sans-serif",
      serif: false,
      fontStyle: 'font-weight: 700; letter-spacing: -0.03em;'
    };
  }

  // 5. Default premium Sans (Plus Jakarta Sans)
  return {
    url: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,700;0,800;1,400&display=swap',
    family: "'Plus Jakarta Sans', sans-serif",
    serif: false,
    fontStyle: 'font-weight: 700; letter-spacing: -0.02em;'
  };
}

export function generateFallbackSvg(item: any): string {
  const domain = (item.domain || 'domain.com').toLowerCase();
  const colors = extractColors(item);
  const fontData = detectFontFamily(item);

  const primaryHex = colors.primary || '#635bff';
  const isDark = colors.isDark;

  // Setup text contrast color
  const textColor = isDark ? '#ffffff' : '#18181b';

  // Dynamic font size based on domain length
  let fontSize = 80;
  if (domain.length > 12) fontSize = 64;
  if (domain.length > 18) fontSize = 48;
  if (domain.length > 24) fontSize = 36;

  // Clean key for gradient ID to avoid syntax errors
  const gradKey = domain.replace(/[^a-zA-Z0-9]/g, '');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="100%" height="100%">
    <defs>
      <linearGradient id="brand-grad-${gradKey}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${primaryHex}" stop-opacity="${isDark ? 0.22 : 0.14}" />
        <stop offset="100%" stop-color="${isDark ? '#0c0c0e' : '#e4e4e7'}" stop-opacity="${isDark ? 0.98 : 0.95}" />
      </linearGradient>
    </defs>
    
    <style>
      @import url('${fontData.url}');
      .brand-title-${gradKey} {
        font-family: ${fontData.family};
        ${fontData.fontStyle}
        fill: ${textColor};
      }
    </style>

    <!-- Background solid -->
    <rect width="1200" height="630" fill="${isDark ? '#0c0c0e' : '#ffffff'}" />
    
    <!-- Brand Gradient Overlay -->
    <rect width="1200" height="630" fill="url(#brand-grad-${gradKey})" />
    
    <!-- Decorative subtle border inside -->
    <rect x="4" y="4" width="1192" height="622" fill="none" stroke="${isDark ? '#ffffff' : '#000000'}" stroke-opacity="0.04" stroke-width="4" />

    <!-- Centered Brand Title (Domain name only) -->
    <text 
      x="50%" 
      y="50%" 
      text-anchor="middle" 
      dominant-baseline="middle" 
      alignment-baseline="middle"
      class="brand-title-${gradKey}"
      font-size="${fontSize}"
    >${domain}</text>
  </svg>`;
}
