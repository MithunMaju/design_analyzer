export function extractSummary(report: string): string {
  if (!report) return '';
  // Extract text under '## 1. Executive Summary' up to the next heading
  const match = report.match(/## 1\.\s+Executive Summary\s*\n+([\s\S]*?)(?=\n+##|$)/i);
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
