export default defineEventHandler(async (event) => {
  const { curated } = await readBody(event);
  if (!curated) throw createError({ statusCode: 400, message: 'curated is required' });

  const cfEnv = (event.context.cloudflare?.env || {}) as Record<string, string>;
  const config = useRuntimeConfig(event);
  const apiKey = cfEnv.GROQ_API_KEY || cfEnv.NUXT_GROQ_API_KEY || (config as any).groqApiKey || process.env.GROQ_API_KEY;
  if (!apiKey) throw createError({ statusCode: 500, message: 'GROQ_API_KEY not set' });

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
      max_tokens: 2500,
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
