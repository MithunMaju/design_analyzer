export function extractSummary(report: string): string {
  if (!report) return '';
  // Extract text under 'Executive Summary' up to the next heading, matching different heading levels or numbers
  const match = report.match(/(?:#+)\s+(?:\d+\.)?\s*Executive Summary\s*\n+([\s\S]*?)(?=\n+#+|$)/i);
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

export function extractColors(item: any): { primary: string, accent: string, bg: string, isDark: boolean } {
  const colors = {
    primary: '#635bff', // Default brand color (indigo)
    accent: '#ff5cbb',  // Default accent color (pink)
    bg: '#ffffff',      // Default page background (white)
    isDark: false
  };

  const props = item.result?.curated?.customProperties || [];
  const colorRegex = /#(?:[0-9a-fA-F]{3}){1,2}\b/;

  let bgCandidate = '';
  let primaryCandidate = '';
  let accentCandidate = '';

  for (const prop of props) {
    if (typeof prop !== 'object' || !prop.name) continue;
    const name = prop.name.toLowerCase();
    const value = (prop.value || '').trim();

    if (colorRegex.test(value)) {
      if (name.includes('bg') || name.includes('background')) {
        bgCandidate = value;
      } else if (name.includes('primary') || name.includes('brand')) {
        primaryCandidate = value;
      } else if (name.includes('accent') || name.includes('link') || name.includes('active')) {
        accentCandidate = value;
      }
    }
  }

  if (bgCandidate) colors.bg = bgCandidate;
  if (primaryCandidate) colors.primary = primaryCandidate;
  if (accentCandidate) colors.accent = accentCandidate;

  // Heuristic to detect dark mode background
  const bg = colors.bg.toLowerCase();
  if (bg === '#000' || bg === '#000000' || bg.includes('black') || bg.startsWith('#0f') || bg.startsWith('#1')) {
    colors.isDark = true;
  }

  return colors;
}

export function generateFallbackSvg(item: any): string {
  const title = item.title || 'Design Report';
  const domain = item.domain || 'domain.com';
  const colors = extractColors(item);

  const bg = colors.isDark ? '#0b0c0e' : '#f8f9fa';
  const panelBg = colors.isDark ? '#121417' : '#ffffff';
  const borderColor = colors.isDark ? '#22262c' : '#e9ecef';
  const textColor = colors.isDark ? '#f8f9fa' : '#212529';
  const mutedTextColor = colors.isDark ? '#6c757d' : '#adb5bd';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="100%" height="100%">
    <!-- Base Background -->
    <rect width="1200" height="630" fill="${bg}" />
    <!-- Grid Pattern -->
    <g stroke="${colors.isDark ? '#ffffff' : '#000000'}" stroke-opacity="0.03" stroke-width="1">
      <path d="M 0,100 L 1200,100 M 0,200 L 1200,200 M 0,300 L 1200,300 M 0,400 L 1200,400 M 0,500 L 1200,500" />
      <path d="M 200,0 L 200,630 M 400,0 L 400,630 M 600,0 L 600,630 M 800,0 L 800,630 M 1000,0 L 1000,630" />
    </g>
    <!-- Mock Browser Header -->
    <rect width="1200" height="70" fill="${panelBg}" stroke="${borderColor}" stroke-width="1" />
    <circle cx="40" cy="35" r="7" fill="#ff5f56" />
    <circle cx="65" cy="35" r="7" fill="#ffbd2e" />
    <circle cx="90" cy="35" r="7" fill="#27c93f" />
    
    <!-- Address Bar -->
    <rect x="250" y="20" width="700" height="30" rx="15" fill="${bg}" stroke="${borderColor}" stroke-width="1" />
    <text x="600" y="40" font-family="monospace" font-size="12" fill="${mutedTextColor}" text-anchor="middle">${domain}</text>

    <!-- Main Container -->
    <rect x="80" y="120" width="1040" height="430" rx="16" fill="${panelBg}" stroke="${borderColor}" stroke-width="1.5" />

    <!-- Hero Content -->
    <rect x="140" y="185" width="400" height="32" rx="6" fill="${colors.primary}" />
    <rect x="140" y="240" width="300" height="12" rx="3" fill="${mutedTextColor}" opacity="0.5" />
    <rect x="140" y="265" width="350" height="12" rx="3" fill="${mutedTextColor}" opacity="0.3" />
    <rect x="140" y="310" width="130" height="36" rx="18" fill="${colors.accent}" />

    <!-- Mock Cards (Right Column) -->
    <rect x="660" y="170" width="400" height="140" rx="12" fill="${bg}" stroke="${borderColor}" stroke-width="1" />
    <circle cx="710" cy="220" r="20" fill="${colors.primary}" opacity="0.8" />
    <rect x="750" y="200" width="270" height="12" rx="3" fill="${textColor}" />
    <rect x="750" y="225" width="180" height="8" rx="2" fill="${mutedTextColor}" opacity="0.6" />
    
    <rect x="660" y="335" width="400" height="140" rx="12" fill="${bg}" stroke="${borderColor}" stroke-width="1" />
    <circle cx="710" cy="385" r="20" fill="${colors.accent}" opacity="0.8" />
    <rect x="750" y="365" width="270" height="12" rx="3" fill="${textColor}" />
    <rect x="750" y="390" width="180" height="8" rx="2" fill="${mutedTextColor}" opacity="0.6" />
  </svg>`;
}
