export default defineEventHandler(async (event) => {
  const { curated } = await readBody(event);
  if (!curated) throw createError({ statusCode: 400, message: 'curated is required' });

  const config = useRuntimeConfig(event);
  const apiKey = config.groqApiKey || event.context?.cloudflare?.env?.GROQ_API_KEY || '';

  console.log('[DEBUG] context keys:', Object.keys(event.context || {}));
  console.log('[DEBUG] cloudflare keys:', Object.keys(event.context?.cloudflare || {}));
  console.log('[DEBUG] cloudflare.env keys:', Object.keys(event.context?.cloudflare?.env || {}));
  console.log('[DEBUG] process.env keys (filtered):', Object.keys(process.env || {}).filter(k => k.includes('GROQ') || k.includes('NUXT')));

  if (!apiKey) {
    throw createError({ statusCode: 500, message: 'GROQ_API_KEY not available at runtime' });
  }
  const compactEvidence = {
    meta: curated.meta,
    routes: (curated.routes || []).slice(0, 20),
    assetManifest: {
      cssUrls: (curated.assetManifest?.cssUrls || []).slice(0, 10),
      jsUrls: (curated.assetManifest?.jsUrls || []).slice(0, 10),
    },
    customProperties: (curated.customProperties || curated.tokens?.customProperties || []).slice(0, 40),
    gradientTokens: (curated.gradientTokens || curated.tokens?.gradientTokens || []).slice(0, 10),
    glowTokens: (curated.glowTokens || curated.tokens?.glowTokens || []).slice(0, 10),
    detectedLibraries: curated.detectedLibraries,
    fonts: curated.fonts,
    domEvidence: {
      desktop: {
        headings: curated.domEvidence?.desktop?.headings,
        navLinks: (curated.domEvidence?.desktop?.navLinks || []).slice(0, 15),
        visibleButtons: (curated.domEvidence?.desktop?.visibleButtons || []).slice(0, 15),
        bodyFont: curated.domEvidence?.desktop?.bodyFont,
        h1Font: curated.domEvidence?.desktop?.h1Font,
        colorSamples: (curated.domEvidence?.desktop?.colorSamples || []).slice(0, 20),
        computedStyles: curated.domEvidence?.desktop?.computedStyles,
        microCopy: (curated.domEvidence?.desktop?.microCopy || []).slice(0, 15),
        cardDescriptions: (curated.domEvidence?.desktop?.cardDescriptions || []).slice(0, 10),
      },
      mobile: {
        hasNavToggle: curated.domEvidence?.mobile?.hasNavToggle,
        navLinks: (curated.domEvidence?.mobile?.navLinks || []).slice(0, 10),
        computedStyles: curated.domEvidence?.mobile?.computedStyles,
      },
      cssEvidence: curated.domEvidence?.cssEvidence ? {
        colors: (curated.domEvidence.cssEvidence.colors || []).slice(0, 30),
        mediaQueries: (curated.domEvidence.cssEvidence.mediaQueries || []).slice(0, 10),
        fontFamilies: (curated.domEvidence.cssEvidence.fontFamilies || []).slice(0, 15),
        borderRadii: (curated.domEvidence.cssEvidence.borderRadii || []).slice(0, 15),
        shadows: (curated.domEvidence.cssEvidence.shadows || []).slice(0, 15),
      } : undefined,
    },
  };

  const prompt = [
    'You are a senior product designer and frontend engineer.',
    'Create a concise design architecture report from the extracted website evidence.',
    'Use Markdown with sections for visual system, typography, color, layout, components, interactions, responsive behavior, libraries, and rebuild guidance.',
    'Do not invent facts. If evidence is missing, say so briefly.',
    '',
    JSON.stringify(compactEvidence, null, 2),
  ].join('\n');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 1800,
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw createError({
      statusCode: res.status,
      message: `Groq error ${res.status}: ${text.slice(0, 240)}`,
    });
  }

  const json = await res.json();
  const report = json?.choices?.[0]?.message?.content?.trim();

  if (!report) throw createError({ statusCode: 502, message: 'Groq returned an empty report' });

  return { report };
});
