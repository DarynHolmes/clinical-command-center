// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  ignores: [
    'pocketbase/pb_data/**',
    'pocketbase/pb_hooks/**',
    'pocketbase/pb_migrations/**'
  ]
})
