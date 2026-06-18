export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  if (!body.url) {
    throw createError({ statusCode: 400, message: 'URL is required' });
  }

  const storage = useStorage('reports');
  // Use a base64url slug of the full URL as a unique, filesystem-safe key
  const key = btoa(body.url).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const payload = {
    url: body.url,
    title: body.title || body.domain || new URL(body.url).hostname,
    domain: body.domain || new URL(body.url).hostname,
    date: body.date || new Date().toLocaleDateString(),
    timestamp: body.timestamp || Date.now(),
    report: body.report || '',
    result: body.result || null
  };

  await storage.setItem(key, payload);
  return { success: true };
});
