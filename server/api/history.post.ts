export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  if (!body.url) {
    throw createError({ statusCode: 400, message: 'URL is required' });
  }

  const storage = useStorage('reports');
  // Use a base64url slug of the full URL as a unique, filesystem-safe key
  const key = btoa(body.url).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const reportText = body.report || '';
  const summary = extractSummary(reportText);
  const category = inferCategory(
    body.url,
    body.title || body.domain || new URL(body.url).hostname,
    summary,
    body.result?.curated?.detectedLibraries
  );

  const payload = {
    url: body.url,
    title: body.title || body.domain || new URL(body.url).hostname,
    domain: body.domain || new URL(body.url).hostname,
    date: body.date || new Date().toLocaleDateString(),
    timestamp: body.timestamp || Date.now(),
    report: reportText,
    result: body.result || null,
    summary: summary,
    category: category,
    svg: body.svg || ''
  };

  await storage.setItem(key, payload);
  return { success: true };
});
