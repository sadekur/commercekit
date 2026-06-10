module.exports = {
  content: [
      './app/**/*.php',
      './views/**/*.html',
      './spa/public/src/**/*.jsx',
      './spa/admin/**/*.jsx',
      './spa/admin/common/**/*.jsx',
  ],
  corePlugins: {
      preflight: false,
  },
  theme: {
      extend: {},
  },
  plugins: [],
}
