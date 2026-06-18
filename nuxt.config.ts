export default defineNuxtConfig({
  compatibilityDate: '2026-06-13',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    browserlessApiKey: process.env.BROWSERLESS_API_KEY || '',
    scrapeDoToken: process.env.SCRAPE_DO_TOKEN || '',
    public: {},
  },
  nitro: {
    preset: 'cloudflare-pages',
  },
});