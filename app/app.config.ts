export default defineAppConfig({
  ui: {
    // Setting global brand defaults
    primary: 'indigo',
    gray: 'slate',

    // refinement: Make all buttons and inputs
    // slightly more compact for data-heavy views
    button: {
      defaultVariants: {
        size: 'sm'
      }
    },
    input: {
      defaultVariants: {
        size: 'sm'
      }
    }
  }
})
