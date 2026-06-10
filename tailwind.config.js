module.exports = {
  content: [
      './app/**/*.php',
      './views/**/*.html',
      './spa/public/src/**/*.jsx',
      './spa/admin/**/*.jsx',
      './spa/admin/common/**/*.jsx',
      './blocks/**/*.js',   // block edit.js — Tailwind classes used in editor UI
      './blocks/**/*.php',  // block render.php — Tailwind classes used in frontend output
  ],
//   corePlugins: {
//       preflight: false,     // prevents Tailwind's CSS reset from overriding theme/WooCommerce styles on the frontend
//   },
  theme: {
      extend: {},
  },
  plugins: [],
}
