# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Requirements

PHP 7.4+ (enforced by `composer.json`; plugin header also declares 7.2 as the minimum), WordPress 5.9+, WooCommerce 5.0+.

## Build Commands

```bash
npm run build    # Webpack production build → build/
npm run watch    # Webpack watch mode for development
npm run start    # Webpack dev server on port 9000 (not used in WordPress context)
composer install # Install PHP dependencies (PSR-4 autoloader)
```

No test suite configured.

## Architecture Overview

CommerceKit is a WooCommerce enhancement plugin. Entry point is `commercekit.php`, which boots the singleton `COMMERCE_KIT` class and registers all core classes on the `plugins_loaded` hook.

### Plugin Constants

Defined in `commercekit.php`:
- `COMMERCE_KIT_VERSION` — plugin version string
- `COMMERCE_KIT_FILE` — absolute path to `commercekit.php`
- `COMMERCE_KIT_PATH` — plugin directory path (with trailing slash)
- `COMMERCE_KIT_URL` — plugin directory URL (with trailing slash)
- `COMMERCE_KIT_ASSETS` — URL to the `assets/` directory

### PHP Namespace & Autoloading

PSR-4 via Composer:
- `CommerceKit\Commerce\` → `app/`
- `CommerceKit\Commerce\Classes\` → `classes/`
- Global helpers → `includes/functions.php` (autoloaded via `composer.json` `files`)

### Hookable Trait

`classes/Trait/Hookable.php` provides `$this->action()`, `$this->filter()`, `$this->add_shortcode()`, and `$this->register_route()`. Every class that needs WordPress hooks or REST routes must `use Hookable` — never call `add_action`/`add_filter`/`register_rest_route` directly.

**Known bug in `register_route()`:** the `permission_callback` key has a trailing space (`'permission_callback '`) when remapped from `'permission'`, so the `permission` shorthand silently fails. Always use `permission_callback` directly in the `$args` array.

### Core Classes (instantiated in `init_plugin()`)

| Class | File | Purpose |
|---|---|---|
| `Common\Assets` | `app/Common/Assets.php` | Enqueues all scripts/styles for admin, frontend, and blocks |
| `Email` | `app/Email.php` | Email-related hooks |
| `Common\API` | `app/Common/API.php` | Registers all REST routes under `commerce-kit/v1` |
| `Common\Init` | `app/Common/Init.php` | Injects shared modal HTML into `<head>` |
| `Blocks` | `app/Blocks.php` | Registers Gutenberg blocks conditionally from `commerce_kit_block_settings` option |
| `Features` | `app/Features.php` | Loads feature plugins conditionally from `commerce_kit_settings` option |
| `Helper` | `app/Helper.php` | Shared utility hooks |
| `Ajax` | `app/Ajax.php` | Only instantiated when `DOING_AJAX` is true |
| `Admin\Menu` | `app/Admin/Menu.php` | Admin-only; registers admin menu and all submenus |

> Note: `app/API.php` and `app/Assets.php` are stub files left as redirect comments — actual code is in `app/Common/`.

### Utility Helper

`classes/Helper/Utility.php` provides static helpers:
- `Utility::pri($data)` — debug dump (admin-only, safe to leave in code; wraps output in `<pre>`)
- `Utility::get_option($menu, $submenu, $key)` — reads from `commercekit-{menu}-{submenu}` option key
- `Utility::format_date($date)` — formats using WordPress date settings

### WordPress Options Reference

| Option key | Purpose |
|---|---|
| `commerce_kit_settings` | Feature enable/disable toggles (`'on'`/`'off'`) |
| `commerce_kit_block_settings` | Block enable/disable toggles |
| `commerce_kit_stock_threshold` | Stock threshold config (merged with defaults from `commercekit_get_stock_settings()`) |
| `commercekit-tips-settings` | WooCommerce tips UI settings; stores flat array with `tcwt_*` keys (e.g. `tcwt_cart`, `tcwt_checkout`, `tcwt_btncolor`, `tcwt_btntext`, `tcwt_textcolor`, `tcwt_note`) |
| `commerce_kit_buy_button_settings` | Buy button config (merged with defaults from `commercekit_get_buy_button_settings()`) |

### Features System

Features live in `features/<kebab-name>/<kebab-name>.php` and are loaded by `app/Features.php` on the `init` hook only when the matching key is `'on'` in `commerce_kit_settings`. The class name is derived by converting the **directory name** (not the settings key) to PascalCase — these differ for `woocommerce-product-barcode` (directory) vs `woocommerce-product_barcode` (settings key).

**The feature class constructor is only called when the feature is enabled** — no guard needed inside the class itself.

Current features and implementation status:

| Settings key | Directory | Status |
|---|---|---|
| `stock-threshold-for-wc` | `stock-threshold-for-wc` | Complete |
| `buy-button-for-woocommerce` | `buy-button-for-woocommerce` | Complete |
| `woocommerce-tips` | `woocommerce-tips` | UI only — tip amounts not added to order totals |
| `woocommerce-faq` | `woocommerce-faq` | PHP file does not exist yet |
| `woocommerce-product_barcode` | `woocommerce-product-barcode` | PHP file does not exist yet |

### Admin Menu

`app/Admin/Menu.php` registers the admin menu via `admin_menu`. All feature submenus are **always registered unconditionally** so their `<li>` elements exist in the DOM on every admin page. `app/Common/Assets.php` computes a `hiddenHashes` array (hashes of disabled features) and passes it via the `COMMERCEKIT` global; `assets/js/admin.js` reads it and hides those `<li>` elements on `DOMContentLoaded`. On the CommerceKit page itself, the React SPA additionally re-syncs sidebar visibility whenever features are saved — enabling a feature shows its submenu immediately, disabling one hides it immediately, both without a page reload.

Submenu pages use a hash-suffixed slug (e.g. `commerce-kit#/stock-threshold`) and all render the same `<div id="commerce_kit_render"></div>` — the SPA takes over from there.

### Blocks System

Gutenberg blocks live in `blocks/<block-name>/` with `block.json`, `index.js`, `edit.js`, `render.php`. Blocks register only when their key is `'on'` in `commerce_kit_block_settings`. All block editor JS compiles from `blocks/App.jsx` → `build/block.build.js`.

Current blocks: `accordion`, `category-products-slider`, `generic-faq`, `variant-faq`. The `generic-faq` and `variant-faq` blocks are hardcoded placeholder stubs — not yet functional.

### REST API

Namespace: `commerce-kit/v1`. All routes registered in `app/Common/API.php`. Handler classes live in `app/API/`.

Current endpoints:
- `GET /get-settings`, `POST /post-settings` — plugin feature toggles
- `GET /get-block-register`, `POST /block-register-save` — block enable/disable
- `GET /get-tips`, `POST /save-tips` — WooCommerce tips
- `GET /get-stock-threshold`, `POST /save-stock-threshold` — stock threshold config
- `GET /get-variation-stock` — variation stock data (public, no auth required)
- `GET /get-buy-button-settings`, `POST /save-buy-button-settings` — buy button config

### JavaScript / React SPA

Webpack entry points (defined in `webpack.config.js`):
- `spa/admin/App.jsx` → `build/admin.build.js` — Admin React SPA
- `blocks/App.jsx` → `build/block.build.js` — Gutenberg block editor JS
- `spa/public/src/App.jsx` → `build/public.build.js` — Frontend React app (currently a stub)
- `assets/css/tailwind.css` → `build/tailwind.build.js`

**Externals** (loaded from WordPress globals, not bundled): `react` → `React`, `react-dom` → `ReactDOM`, `@wordpress/blocks` → `wp.blocks`, `@wordpress/block-editor` → `wp.blockEditor`, `@wordpress/element` → `wp.element`. Other `@wordpress/*` packages (e.g. `api-fetch`, `components`) are **not** externals — if used they will be bundled.

The admin SPA mounts on `#commerce_kit_render` and uses **hash-based routing**. `spa/admin/App.jsx` switches on `window.location.hash`:
- `""` or `"/"` → `Dashboard` (Feature / Blocks / Settings tabs)
- `"/stock-threshold"` → `StockThreshold` page
- `"/commerce-kit-tip-settings"` → `TipSettings` page
- `"/buy-button-settings"` → `BuyButtonSettings` page

Tailwind scans `app/**/*.php` and `spa/**/src/**/*.jsx`.

### Adding a New Feature Page to the Admin SPA

Five files must change together when adding a new submenu page:

1. **`app/Admin/Menu.php`** — add `add_submenu_page()` with slug `commerce-kit#/<your-hash>`
2. **`app/Common/Assets.php`** — add the feature key → hash mapping to `$feature_hashes` so disabled submenus are hidden via `hiddenHashes`
3. **`spa/admin/App.jsx`** — add the feature key → anchor CSS selector to `FEATURE_SUBMENUS` (controls live show/hide on the CommerceKit page), and add a `case "/<your-hash>"` to `renderPage()`
4. **`spa/admin/pages/features/<your-slug>/page.jsx`** — create the page component
5. **`app/Common/API.php`** + **`app/API/<Handler>.php`** — register and implement the REST endpoints the page needs

### Sidebar Submenu Visibility

Two mechanisms work together:
- **On every admin page**: `assets/js/admin.js` reads `COMMERCEKIT.hiddenHashes` (set by `app/Common/Assets.php`) and hides disabled submenu items on `DOMContentLoaded`.
- **On the CommerceKit page**: `App.jsx` reads `window.COMMERCEKIT.settings_data` on mount to show/hide submenus. When features are saved, `Feature.jsx` dispatches a `commerceKitSettingsUpdated` custom event; `App.jsx` listens and re-syncs visibility without a page reload.

### Shared Admin Components

All shared admin components live in `spa/admin/common/`: `CommonHeader`, `SectionHeader`, `Skeletons/`, `Svgs`, `Toggle`, `Pill`, `NumberField`, `CheckboxField`, `InputRow`, `FieldRow`, `SettingRow`, `SaveRow`, `RadioGroup`, `ColorField`, `DimensionFields`, `SmallNumberInput`.

Page components live in `spa/admin/pages/` — dashboard tabs in `pages/dashboard/tabs/`, feature pages in `pages/features/<slug>/page.jsx`.

### COMMERCEKIT JS Global

Localized differently per context:
- **Admin** (`commerce-kit-admin-script`): `nonce` (wp_rest), `adminurl`, `ajaxurl`, `apiurl` (REST base), `settings_data` (feature toggles object), `hiddenHashes` (array of hash strings for disabled feature submenus)
- **Frontend** (`commerce-kit-frontend-script`): `nonce` (commerce-kit), `adminurl`, `ajaxurl`, `resturl` (REST base), `error`

The buy button feature extends the frontend global with a `buy_button` sub-object: `is_ajax` (`'yes'`/`'no'`), `button_text`, `nonce`, `i18n_select_options`.

### Buy Button Vanilla JS

`features/buy-button-for-woocommerce/buy-button.js` is a standalone jQuery file — **not compiled through webpack**. It reads `COMMERCEKIT.buy_button` and handles two click targets:
- `.wc-buy-now-btn-single` — product page button; reads qty and variation from the parent `form.cart`
- `.wc-buy-now-btn-archive` — shop/archive page button; always uses AJAX regardless of `is_ajax`

Simple products on single pages use either AJAX (`action: ck_buy_button_add_to_cart`) or a `?wc-quick-buy-now=` query string depending on `is_ajax`. Variable products always use AJAX and require a `variation_id` already set in the form.

### Asset Versioning Convention

- Build artifacts and block scripts: `time()` (always cache-bust)
- Static assets in `assets/`: `filemtime()` (cache-bust on file change only)

### WooCommerce Blocks Checkout Compatibility

WooCommerce Blocks checkout renders its order summary via the Store API (`/wc/store/v1/cart`) — a REST request. In that context `is_checkout()` and `is_cart()` both return `false`. When writing filters that should apply to the Blocks checkout (e.g. `woocommerce_cart_item_name`), also allow the request when `defined('REST_REQUEST') && REST_REQUEST`:

```php
$is_store_api = defined( 'REST_REQUEST' ) && REST_REQUEST;
if ( ! is_cart() && ! is_checkout() && ! $is_store_api ) {
    return $value;
}
```

### Stock Threshold Cart Price Double-Adjustment

`StockThresholdForWc` uses two properties to prevent `woocommerce_product_get_price` from re-adjusting prices that `woocommerce_before_calculate_totals` already set via `$product->set_price()`:

- `$adjusted_cart_items` — product IDs set directly by `adjust_cart_item_prices()`; `get_adjusted_price()` skips any product in this map
- `$original_cart_prices` — raw DB prices captured once (using `get_price('edit')` to bypass the filter); never reset between recalculation calls so the threshold is always applied to the true base price

Any new price-adjustment code in this class must follow the same pattern to avoid compound adjustments when WooCommerce calls `calculate_totals()` multiple times per request.
