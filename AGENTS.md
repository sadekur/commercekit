# AGENTS.md

This file is gitignored (`.gitignore` matches `.md`). Changes here are local only.

## Build & Test

- `npm run build` — Webpack prod build to `build/`
- `npm run watch` — Webpack watch mode
- No test suite. `npm test` echoes an error.
- `build/` is gitignored — run `npm run build` before testing JS changes.

## Bootstrap

`commercekit.php` defines plugin constants (`COMMERCE_KIT_VERSION`, `COMMERCE_KIT_FILE`, `COMMERCE_KIT_PATH`, `COMMERCE_KIT_URL`, `COMMERCE_KIT_ASSETS`) and bootstraps the singleton `COMMERCE_KIT` class via `plugins_loaded`. All core classes are instantiated in `init_plugin()`.

## PHP

| Area | Detail |
|---|---|
| PSR-4 | `CommerceKit\Commerce\` → `app/`; `CommerceKit\Commerce\Classes\` → `classes/` |
| Global helpers | `includes/functions.php` (autoloaded via `composer.json` `files`) |
| Hookable trait | `classes/Trait/Hookable.php` — use `$this->action()` / `$this->filter()` / `$this->add_shortcode()` / `$this->register_route()`. Never call `add_action`/`add_filter` directly. |
| **Hookable bug** | `register_route()` maps `'permission'` → `'permission_callback '` (trailing space). The shorthand silently fails. Always use `permission_callback` directly. |
| Features | `app/Features.php` loads `features/<kebab>/<kebab>.php` on `init` only when key is `'on'` in `commerce_kit_settings`. Class name: PascalCase from directory name. |
| Feature key vs dir | `woocommerce-product_barcode` (option key) ≠ `woocommerce-product-barcode` (directory). |
| Blocks | `app/Blocks.php` registers `blocks/<name>/block.json` conditionally on `commerce_kit_block_settings`. `blocks/App.jsx` loads only enabled blocks via `window.COMMERCEKIT.activeBlocks`. |
| AJAX | `app/Ajax.php` — only instantiated when `DOING_AJAX` is defined. |
| Admin menu | `app/Admin/Menu.php` — all feature submenus always registered; disabled ones hidden via JS (`COMMERCEKIT.hiddenHashes` in `assets/js/admin.js`). |

## REST API

Namespace: `commerce-kit/v1`. Routes registered in `app/Common/API.php`, handlers in `app/API/`.

| Endpoint | Method |
|---|---|
| `/get-settings`, `/post-settings` | GET, POST |
| `/get-block-register`, `/block-register-save` | GET, POST |
| `/get-tips`, `/save-tips` | GET, POST |
| `/get-stock-threshold`, `/save-stock-threshold` | GET, POST |
| `/get-variation-stock` | GET (public, no auth) |
| `/get-buy-button-settings`, `/save-buy-button-settings` | GET, POST |

## JavaScript

| Entry | Output | Purpose |
|---|---|---|
| `spa/admin/App.jsx` | `build/admin.build.js` | Admin React SPA (hash routing on `#commerce_kit_render`) |
| `blocks/App.jsx` | `build/block.build.js` | Gutenberg block editor JS |
| `spa/public/src/App.jsx` | `build/public.build.js` | Frontend React app (**stub** — only renders `<h2>Public App</h2>`) |
| `assets/css/tailwind.css` | `build/tailwind.build.js` | Tailwind styles |

Externals (not bundled): `react`→`React`, `react-dom`→`ReactDOM`, `@wordpress/*`→`wp.*`.

Feature JS (buy-button.js, tips.js) is **not webpack-compiled** — enqueued directly as standalone scripts.

## Nonces

- **Admin REST**: `wp_create_nonce('wp_rest')` — sent in `COMMERCEKIT.nonce`
- **Frontend AJAX**: `wp_create_nonce('commerce-kit')` — sent in `COMMERCEKIT.nonce`
- **Tips AJAX**: `wp_create_nonce('ck_tips_nonce')` — separate nonce for tip actions
- **Buy Button AJAX**: `wp_create_nonce('ck_buy_button_nonce')`

## Asset Versioning

- Build artifacts + block scripts: `time()` (always cache-bust)
- Static `assets/`: `filemtime()` (cache-bust on change)

## Tailwind Content Config

Scans: `app/**/*.php`, `views/**/*.html`, `spa/public/src/**/*.jsx`, `spa/admin/**/*.jsx`, `spa/admin/common/**/*.jsx`

## Features Status

| Feature | Directory | Status |
|---|---|---|
| Stock Threshold | `stock-threshold-for-wc` | Complete |
| Buy Button | `buy-button-for-woocommerce` | Complete |
| WooCommerce Tips | `woocommerce-tips` | Complete (fee via `WC()->cart->add_fee()`, session key `ck_tip`) |
| WooCommerce FAQ | `woocommerce-faq` | Not implemented |
| WooCommerce Product Barcode | `woocommerce-product-barcode` | Not implemented |

## Known Gotchas

- **Tip feature**: `woocommerce-tips.php` calls `commercekit_get_load_tip_settings()` defined in `includes/functions.php:136` — verify it exists before editing.
- **Stock Threshold double-adjustment**: `StockThresholdForWc` uses `$adjusted_cart_items` + `$original_cart_prices` to prevent compound price adjustment when WC calls `calculate_totals()` multiple times. New price code must follow this pattern.
- **WooCommerce Blocks compat**: `is_checkout()`/`is_cart()` return `false` during Store API requests. For Blocks-compatible filters, also check `defined('REST_REQUEST') && REST_REQUEST`.
- **Adding a new feature page**: Must touch 5 files: `app/Admin/Menu.php`, `app/Common/Assets.php`, `spa/admin/App.jsx`, the new page component, and the REST API handler.
