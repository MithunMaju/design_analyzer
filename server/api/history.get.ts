export default defineEventHandler(async (event) => {
  const storage = useStorage('reports');
  const keys = await storage.getKeys();
  
  const historyList = [];
  for (const key of keys) {
    const data = await storage.getItem(key);
    if (data && typeof data === 'object') {
      const item = data as any;
      historyList.push({
        url: item.url,
        title: item.title,
        domain: item.domain,
        date: item.date,
        timestamp: item.timestamp || 0,
        result: {
          curated: {
            customProperties: { length: item.result?.curated?.customProperties?.length || 0 },
            detectedLibraries: item.result?.curated?.detectedLibraries,
            routes: { length: item.result?.curated?.routes?.length || 0 }
          }
        }
      });
    }
  }
  
  // Sort by timestamp descending (newest first)
  historyList.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
  
  return historyList;
});
