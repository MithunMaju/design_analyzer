export default defineNuxtConfig({
  compatibilityDate: '2026-06-13',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    groqApiKey: process.env.GROQ_API_KEY || '',
    browserlessApiKey: process.env.BROWSERLESS_API_KEY || '',
    public: {},
  },
  nitro: {
    preset: 'cloudflare-pages',
  },
});
