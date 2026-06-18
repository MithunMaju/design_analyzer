export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const urlStr = query.url as string;
  if (!urlStr) {
    throw createError({ statusCode: 400, message: 'URL query parameter is required' });
  }

  const storage = useStorage('reports');
  const key = Buffer.from(urlStr).toString('base64url');
  await storage.removeItem(key);
  
  return { success: true };
});
