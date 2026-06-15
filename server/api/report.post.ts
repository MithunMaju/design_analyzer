export default defineEventHandler(async (event) => {
  const { curated } = await readBody(event);
  if (!curated) throw createError({ statusCode: 400, message: 'curated is required' });

  const cfEnv = (event.context.cloudflare?.env || {}) as Record<string, string>;
  const apiKey = cfEnv.GEMINI_API_KEY || cfEnv.NUXT_GEMINI_API_KEY || useRuntimeConfig().geminiApiKey;
  if (!apiKey) throw createError({ statusCode: 500, message: 'GEMINI_API_KEY not set' });

  const compactEvidence = {
    meta: curated.meta,
    routes: curated.routes,
    assetManifest: curated.assetManifest,
    customProperties: curated.customProperties || curated.tokens?.customProperties || [],
    gradientTokens: curated.gradientTokens || curated.tokens?.gradientTokens || [],
    glowTokens: curated.glowTokens || curated.tokens?.glowTokens || [],
    detectedLibraries: curated.detectedLibraries,
    fonts: curated.fonts,
    domEvidence: {
      desktop: {
        headings: curated.domEvidence?.desktop?.headings,
        navLinks: curated.domEvidence?.desktop?.navLinks,
        visibleButtons: curated.domEvidence?.desktop?.visibleButtons,
        bodyFont: curated.domEvidence?.desktop?.bodyFont,
        h1Font: curated.domEvidence?.desktop?.h1Font,
        colorSamples: curated.domEvidence?.desktop?.colorSamples,
        computedStyles: curated.domEvidence?.desktop?.computedStyles,
        microCopy: curated.domEvidence?.desktop?.microCopy,
        cardDescriptions: curated.domEvidence?.desktop?.cardDescriptions,
      },
      mobile: {
        hasNavToggle: curated.domEvidence?.mobile?.hasNavToggle,
        navLinks: curated.domEvidence?.mobile?.navLinks,
        computedStyles: curated.domEvidence?.mobile?.computedStyles,
      },
      cssEvidence: curated.domEvidence?.cssEvidence,
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

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2500,
      },
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw createError({
      statusCode: res.status,
      message: `Gemini error ${res.status}: ${text.slice(0, 240)}`,
    });
  }

  const json = await res.json();
  const report = json?.candidates?.[0]?.content?.parts
    ?.map((part: any) => part.text || '')
    .join('')
    .trim();

  if (!report) throw createError({ statusCode: 502, message: 'Gemini returned an empty report' });

  return { report };
});
