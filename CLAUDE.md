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

No test suite configured. `build/` is gitignored — run `npm run build` before testing any JS changes.

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
- `CommerceKit\Commerce\Support\` → `support/`
- Global helpers → `support/functions.php` (autoloaded via `composer.json` `files`)

`app/Models/` resolves as `CommerceKit\Commerce\Models\` automatically under the `app/` root mapping.

### Directory Structure

```
app/
├── Admin/          Controllers: admin menu
├── API/            Controllers: REST endpoint handlers
├── Common/         Core infrastructure (Assets, API router, Init)
├── Models/         Data layer — settings loaders
│   ├── StockSettings.php
│   ├── BuyButtonSettings.php
│   └── TipSettings.php
├── Ajax.php        AJAX handler (instantiated only when DOING_AJAX)
├── Blocks.php      Block registration + static get_active_blocks()
├── Email.php       Email hooks
└── Features.php    Feature loader

support/
├── Base/
│   └── Feature.php     Abstract base class for all feature classes
├── Helper/
│   └── Utility.php     Static utilities: pri(), get_option(), format_date(), get_template()
├── Traits/
│   └── Hookable.php    Hook registration trait
└── functions.php       Global helpers: commercekit_is_product_in_cart(), commercekit_is_blocks_page()

features/           Feature plugins (loaded on demand)
blocks/             Gutenberg block source (block.json, index.js, edit.js, render.php)
spa/                React SPA source
assets/             Static CSS/JS (not webpack-compiled)
```

### Support Layer

**`support/Traits/Hookable.php`** (`CommerceKit\Commerce\Support\Traits\Hookable`) provides `$this->action()`, `$this->filter()`, `$this->add_shortcode()`, and `$this->register_route()`. Never call `add_action`/`add_filter`/`register_rest_route` directly.

**Known bug in `register_route()`:** the `permission_callback` key has a trailing space (`'permission_callback '`) when remapped from `'permission'`, so the `permission` shorthand silently fails. Always use `permission_callback` directly in the `$args` array.

**`support/Base/Feature.php`** (`CommerceKit\Commerce\Support\Base\Feature`) is an abstract class that all feature classes extend. It uses `Hookable` and declares `protected array $settings = []`. Feature classes never need to declare `use Hookable` or a `$settings` property themselves.

**`support/Helper/Utility.php`** (`CommerceKit\Commerce\Support\Helper\Utility`) provides static helpers:
- `Utility::pri($data)` — debug dump (admin-only, safe to leave in code)
- `Utility::get_option($menu, $submenu, $key)` — reads from `commercekit-{menu}-{submenu}` option key
- `Utility::format_date($date)` — formats using WordPress date settings
- `Utility::get_template($template_name, $path, $data)` — loads a PHP template from `app/settings/`

### Models

Settings loaders live in `app/Models/` as classes with a single `static get(): array` method that reads the option, merges with defaults, and returns the result. Always use the Model — never call `get_option()` directly for these settings.

| Class | Option key |
|---|---|
| `Models\StockSettings::get()` | `commerce_kit_stock_threshold` |
| `Models\BuyButtonSettings::get()` | `commerce_kit_buy_button_settings` |
| `Models\TipSettings::get()` | `commercekit-tips-settings` |

### Core Classes (instantiated in `init_plugin()`)

| Class | File | Purpose |
|---|---|---|
| `Common\Assets` | `app/Common/Assets.php` | Enqueues all scripts/styles for admin, frontend, and blocks |
| `Email` | `app/Email.php` | Email-related hooks |
| `Common\API` | `app/Common/API.php` | Registers all REST routes under `commerce-kit/v1` |
| `Common\Init` | `app/Common/Init.php` | Injects shared modal HTML into `<head>` |
| `Blocks` | `app/Blocks.php` | Registers Gutenberg blocks; provides `static get_active_blocks()` |
| `Features` | `app/Features.php` | Loads feature plugins conditionally from `commerce_kit_settings` option |
| `Ajax` | `app/Ajax.php` | Only instantiated when `DOING_AJAX` is true |
| `Admin\Menu` | `app/Admin/Menu.php` | Admin-only; registers admin menu and all submenus |

### WordPress Options Reference

| Option key | Purpose |
|---|---|
| `commerce_kit_settings` | Feature enable/disable toggles (`'on'`/`'off'`) |
| `commerce_kit_block_settings` | Block enable/disable toggles |
| `commerce_kit_stock_threshold` | Stock threshold config — read via `StockSettings::get()` |
| `commercekit-tips-settings` | WooCommerce tips settings — read via `TipSettings::get()` |
| `commerce_kit_buy_button_settings` | Buy button config — read via `BuyButtonSettings::get()` |

### Features System

Features live in `features/<kebab-name>/<kebab-name>.php` and are loaded by `app/Features.php` on the `init` hook only when the matching key is `'on'` in `commerce_kit_settings`. The class name is derived by converting the **directory name** (not the settings key) to PascalCase — these differ for `woocommerce-product-barcode` (directory) vs `woocommerce-product_barcode` (settings key).

**The feature class constructor is only called when the feature is enabled** — no guard needed inside the class itself.

Every feature class extends `CommerceKit\Commerce\Support\Base\Feature` (which provides `Hookable` and `$this->settings`). Load settings from the corresponding Model in the constructor.

Current features and implementation status:

| Settings key | Directory | Status |
|---|---|---|
| `stock-threshold-for-wc` | `stock-threshold-for-wc` | Complete |
| `buy-button-for-woocommerce` | `buy-button-for-woocommerce` | Complete |
| `woocommerce-tips` | `woocommerce-tips` | Complete |
| `woocommerce-faq` | `woocommerce-faq` | PHP file does not exist yet |
| `woocommerce-product_barcode` | `woocommerce-product-barcode` | PHP file does not exist yet |

### Admin Menu

`app/Admin/Menu.php` registers the admin menu via `admin_menu`. All feature submenus are **always registered unconditionally** so their `<li>` elements exist in the DOM on every admin page. `app/Common/Assets.php` computes a `hiddenHashes` array (hashes of disabled features) and passes it via the `COMMERCEKIT` global; `assets/js/admin.js` reads it and hides those `<li>` elements on `DOMContentLoaded`. On the CommerceKit page itself, the React SPA additionally re-syncs sidebar visibility whenever features are saved — enabling a feature shows its submenu immediately, disabling one hides it immediately, both without a page reload.

Submenu pages use a hash-suffixed slug (e.g. `commerce-kit#/stock-threshold`) and all render the same `<div id="commerce_kit_render"></div>` — the SPA takes over from there.

### Blocks System

Gutenberg blocks live in `blocks/<block-name>/` with `block.json`, `index.js`, `edit.js`, `render.php`. Blocks register only when their key is `'on'` in `commerce_kit_block_settings`. All block editor JS compiles from `blocks/App.jsx` → `build/block.build.js`.

Current blocks: `accordion`, `category-products-slider` (both complete).

`blocks/App.jsx` reads `window.COMMERCEKIT.activeBlocks` (an array of enabled block names set by `Blocks::get_active_blocks()`) and only imports/registers the enabled ones. `app/Blocks.php` provides the static `get_active_blocks(): array` method used by both PHP block registration and JS localization.

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

Tailwind scans: `app/**/*.php`, `views/**/*.html`, `spa/public/src/**/*.jsx`, `spa/admin/**/*.jsx`, `spa/admin/common/**/*.jsx`.

### Adding a New Feature Page to the Admin SPA

Five files must change together when adding a new submenu page:

1. **`app/Admin/Menu.php`** — add `add_submenu_page()` with slug `commerce-kit#/<your-hash>`
2. **`app/Common/Assets.php`** — add the feature key → hash mapping to `$feature_hashes` so disabled submenus are hidden via `hiddenHashes`
3. **`spa/admin/App.jsx`** — add the feature key → anchor CSS selector to `FEATURE_SUBMENUS` (controls live show/hide on the CommerceKit page), and add a `case "/<your-hash>"` to `renderPage()`
4. **`spa/admin/pages/features/<your-slug>/page.jsx`** — create the page component
5. **`app/Common/API.php`** + **`app/API/<Handler>.php`** — register and implement the REST endpoints the page needs

Also create `app/Models/<FeatureName>Settings.php` for the settings defaults/loader and add the feature class in `features/` extending `Feature` base.

### Sidebar Submenu Visibility

Two mechanisms work together:
- **On every admin page**: `assets/js/admin.js` reads `COMMERCEKIT.hiddenHashes` (set by `app/Common/Assets.php`) and hides disabled submenu items on `DOMContentLoaded`.
- **On the CommerceKit page**: `App.jsx` reads `window.COMMERCEKIT.settings_data` on mount to show/hide submenus. When features are saved, `Feature.jsx` dispatches a `commerceKitSettingsUpdated` custom event; `App.jsx` listens and re-syncs visibility without a page reload.

### Shared Admin Components

All shared admin components live in `spa/admin/common/`: `CommonHeader`, `SectionHeader`, `Skeletons/`, `Svgs`, `Toggle`, `Pill`, `NumberField`, `CheckboxField`, `InputRow`, `FieldRow`, `SettingRow`, `SaveRow`, `RadioGroup`, `ColorField`, `DimensionFields`, `SmallNumberInput`.

Page components live in `spa/admin/pages/` — dashboard tabs in `pages/dashboard/tabs/`, feature pages in `pages/features/<slug>/page.jsx`.

### Nonces

| Context | Value | Used by |
|---|---|---|
| Admin REST | `wp_create_nonce('wp_rest')` | `COMMERCEKIT.nonce` (admin SPA) |
| Frontend AJAX | `wp_create_nonce('commerce-kit')` | `COMMERCEKIT.nonce` (frontend) |
| Tips AJAX | `wp_create_nonce('ck_tips_nonce')` | `tips.js` tip actions |
| Buy Button AJAX | `wp_create_nonce('ck_buy_button_nonce')` | `buy-button.js` |

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

### WooCommerce Tips — Architecture

The tips feature adds preset-rate and custom-amount buttons to the cart and checkout pages. Key design decisions:

**Session storage:** The active tip is stored in `WC()->session->set('ck_tip', [...])` as an array with keys `type`, `rate`, `amount`, `label`. All methods read from and write to this session key.

**Tip types:** `percent` (rate is a percentage applied to cart subtotal), `fixed` (rate is a flat currency amount), `custom` (shopper-entered amount), `cash` (records preference only — no fee line added to the order).

**Fee approach:** `woocommerce_cart_calculate_fees` reads the session and calls `$cart->add_fee($label, $amount, $taxable)`. The `cash` type is skipped — no fee is added. WooCommerce automatically carries fee lines to the order, thank-you page, and admin order view — no custom order display code needed. Percent tips are **recalculated live** in `add_tip_fee()` (not just stored) so they stay accurate if cart items change after selection. Taxability is controlled by `tcwt_taxable` in settings.

**Classic cart/checkout hooks:** `woocommerce_after_cart_table` and `woocommerce_review_order_before_payment` render the tip form on classic (shortcode-based) pages.

**WC Blocks injection:** For WooCommerce Blocks pages, `inject_for_blocks_cart` and `inject_for_blocks_checkout` hook into `render_block_woocommerce/cart` and `render_block_woocommerce/checkout` respectively. The tip form is prepended as raw HTML before the block's React root so React hydration cannot overwrite it. The checkout injector skips the order-received page via `is_wc_endpoint_url('order-received')`.

**Fragment updates (classic cart page):** `woocommerce_add_to_cart_fragments` registers both `.ck-tips-wrapper` (the tip form HTML) and `.cart_totals` as WC fragments. After AJAX tip selection, `wc_fragment_refresh` is triggered in JS and WC replaces both elements — no page reload needed.

**Checkout update:** On checkout, `$(document.body).trigger('update_checkout')` re-renders the full order review via WC's own AJAX, which fires `render_tip_form()` again via `woocommerce_review_order_before_payment`.

**Order persistence:** `woocommerce_checkout_order_created` fires `save_tip_to_order()`, which writes the full session tip array to order meta key `_ck_tip`. When `tcwt_clear` is `'yes'`, the session is cleared on `woocommerce_thankyou`.

**Standalone JS/CSS:** `features/woocommerce-tips/tips.js` and `tips.css` are not webpack-compiled. They are enqueued directly by `enqueue_assets()` on cart/checkout pages only. All event handlers in `tips.js` are delegated so they survive fragment DOM replacement.

**AJAX actions:** `ck_set_tip` and `ck_remove_tip` (both public + logged-in), nonce `ck_tips_nonce`.

**Settings:** loaded via `TipSettings::get()` (`app/Models/TipSettings.php`) in the constructor.
