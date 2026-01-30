// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/a11y',
    '@nuxt/hints',
    '@nuxt/test-utils'
  ],
  // CRITICAL: Disable SSR for Pockethost static hosting
  ssr: false,
  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  ui: {
    // This allows us to use any Tailwind color as a 'primary'
    theme: {
      colors: ['primary', 'slate', 'indigo', 'emerald', 'rose']
    }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
