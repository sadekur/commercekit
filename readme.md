# CommerceKit — User Documentation

CommerceKit is a WooCommerce enhancement plugin that adds dynamic pricing, buy-now shortcuts, customer tips, and Gutenberg blocks to your WooCommerce store.

**Requirements:** WordPress 5.9+, WooCommerce 5.0+, PHP 7.4+

---

## Table of Contents

- [Getting Started — Admin Panel](#getting-started)
- [Features](#features)
  - [Stock Threshold for WooCommerce](#1-stock-threshold-for-woocommerce) ✅ Complete
  - [Buy Button for WooCommerce](#2-buy-button-for-woocommerce) ✅ Complete
  - [WooCommerce Tips](#3-woocommerce-tips) ✅ Complete
  - [WooCommerce FAQ](#4-woocommerce-faq) 🚧 Incomplete
  - [WooCommerce Product Barcode](#5-woocommerce-product-barcode) 🚧 Incomplete
- [Gutenberg Blocks](#gutenberg-blocks)
  - [Accordion Block](#1-accordion-block) ✅ Complete
  - [Category Products Slider](#2-category-products-slider-block) ✅ Complete

---

## Getting Started

### Installation & Activation

1. Install and activate **WooCommerce** first — CommerceKit declares WooCommerce as a required parent plugin, so WordPress will not let you activate CommerceKit until WooCommerce is installed and active.
2. Install and activate **CommerceKit** the same way as any other plugin (upload the zip via **Plugins → Add New → Upload Plugin**, or place it in `wp-content/plugins/`, then activate).
3. Go to **WordPress Admin → CommerceKit** in the main admin menu to open the dashboard.

### Enabling Features

1. Go to **WordPress Admin → CommerceKit → Dashboard**
2. Click the **Feature** tab
3. Toggle on any feature you want to activate
4. Either:
   - Click **Save Settings** to save all toggle changes at once, or
   - Click **Configure →** on a feature card — this automatically saves all current toggle states and takes you directly to that feature's settings page

Features are independent of each other. Enabling one has no effect on others. Once a feature is enabled, its dedicated settings page (if any) appears in the **CommerceKit** submenu.

### Enabling Blocks

1. Go to **WordPress Admin → CommerceKit → Dashboard**
2. Click the **Blocks** tab
3. Toggle on the blocks you want available in the editor
4. Click **Save Settings**

Only enabled blocks will appear in the Gutenberg block inserter under the **CommerceKit - WooCommerce** category.

---

## Features

---

### 1. Stock Threshold for WooCommerce

**Status:** ✅ Complete

Automatically adjusts product prices based on current stock levels, following a three-tier logic: prices rise when stock is scarce and drop when stock is high. A customer-facing message also displays wherever the product appears.

#### How the price logic works

| Condition | Effect |
|---|---|
| Stock ≤ Low Threshold | Price **increases** by the Low % |
| Stock ≤ Medium Threshold | Price **increases** by the Medium % |
| Stock ≥ High Threshold | Price **decreases** by the High % |
| Stock falls between thresholds | Base price applies unchanged |

The price adjustment applies to:
- The **single product page** (shown price)
- **Variable products** — each variation's price range updates individually based on that variation's stock
- The **cart** — the adjusted price is recalculated before totals are summed
- The **checkout** order summary
- **WooCommerce Blocks cart and checkout** (Store API-compatible)

#### Where stock messages appear

When the Customer Messages toggle is turned on, a highlighted notice appears:
- Below the price on the **single product page** (for variable products it appears dynamically when a variation is selected)
- Below the product name in the **cart** order summary
- Below the product name in the **checkout** order summary (both classic and Blocks checkout)
- Below the product name on the **thank-you / order confirmation** page

#### Setting it up

1. Enable **Stock Threshold for WooCommerce** on the Features page
2. Go to **CommerceKit → Stock Threshold**
3. Configure the three pricing tiers:

**Low Stock Rules**
- **Low Stock Threshold** — Stock count at or below this number is considered "low". Default: `5`
- **Price Increase %** — Percentage added to the base price. Default: `40%`

**Medium Stock Rules**
- **Medium Stock Threshold** — Stock at or below this number (but above low) is "medium". Default: `20`
- **Price Increase %** — Percentage added to the base price. Default: `20%`

**High Stock Rules**
- **High Stock Threshold** — Stock at or above this number is "high". Default: `100`
- **Price Decrease %** — Percentage subtracted from the base price. Default: `15%`

**Customer Messages**
- Toggle the switch **on** to enable visible notices for shoppers
- Write a separate message for each tier (Low / Medium / High). Defaults:
  - Low: *"Low stock - high demand item"*
  - Medium: *"Medium stock - price adjusted"*
  - High: *"High stock - clearance price"*

4. Click **Save Changes**

> **Note:** WooCommerce must have **stock management enabled** for each product (Product → Inventory → Enable stock management). Products without a stock quantity are not affected.

> **Variable products:** Each variation's stock is used independently. The price range displayed before a variation is selected reflects the adjusted range across all variations.

---

### 2. Buy Button for WooCommerce

**Status:** ✅ Complete

Adds a **"Buy Now"** button to single product pages and the shop/archive listing. When clicked, the button adds the product to the cart and immediately redirects the shopper — skipping the cart page entirely. Supports both **simple** and **variable** products, configurable redirect destinations, custom button styles, and an optional AJAX mode.

#### Setting it up

1. Enable **Buy Button for WooCommerce** on the Features page
2. Go to **CommerceKit → Buy Button**
3. Configure the **General** and **Button Styles** tabs (see below)
4. Click **Save Changes**

---

#### General Settings

**Enable Button On**

| Option | Description |
|---|---|
| **Single Product Page** | Renders the Buy Now button on individual product pages |
| **Shop / Archive Page** | Renders the Buy Now button on shop and category listing pages |

**Button Position on Single Product Page**

| Value | Hook used |
|---|---|
| After Add to Cart Button *(default)* | `woocommerce_after_add_to_cart_button` |
| Before Add to Cart Button | `woocommerce_before_add_to_cart_button` |

**Button Position on Shop / Archive Page**

| Value | Behaviour |
|---|---|
| After Add to Cart Button *(default)* | Appended after the WooCommerce loop item button |
| Before Add to Cart Button | Prepended before the WooCommerce loop item button |

> **Note:** On the archive page, variable products show a Buy Now button that links to the product page so the customer can select a variation before buying.

**Redirect Location**

| Option | Destination |
|---|---|
| Checkout Page *(default)* | WooCommerce checkout URL |
| Cart Page | WooCommerce cart URL |
| Custom Page | A URL you specify in the **Custom Redirect URL** field |

**Other options**

| Option | Default | Description |
|---|---|---|
| **Button Text** | `Buy Now` | Text displayed on every Buy Now button |
| **Default Shop Quantity** | `1` | Quantity added to cart when clicked on the shop/archive page |
| **Auto Reset Cart** | Off | Clears the cart before adding the product — ensures a single-product checkout |
| **Ajax Add to Cart** | Off | Submits via AJAX on the single product page for simple products. Variable products always use AJAX regardless of this setting |
| **Hide WooCommerce Add to Cart Button** | Off | Hides the default WooCommerce Add to Cart button on both the single product page and shop/archive pages. Useful when you want Buy Now to be the only purchase action |

---

#### Button Styles

Navigate to the **Button Styles** tab to customise the button's appearance.

**Style mode**

- **Default Styles (Theme)** — inherits `.button` styles from your active theme (recommended)
- **Custom Styles** — apply explicit CSS values via the fields below

**Custom style fields** *(visible when Custom Styles is selected)*

| Field | Description |
|---|---|
| **Text Color** | Button label color |
| **Background Color** | Button fill color |
| **Border Color** | Button border color |
| **Border Size** | Border width in px |
| **Border Radius** | Corner radius in px |
| **Font Size** | Label font size in px |
| **Margin** | Top / Right / Bottom / Left in px |
| **Padding** | Top / Right / Bottom / Left in px |

A **live preview** at the bottom of the tab reflects your custom values instantly.

---

#### Variable product support

On the single product page, clicking Buy Now intercepts the WooCommerce variation form via JavaScript. The selected variation and attributes are read from the form and sent to the server via AJAX. If no variation has been selected, the button shows an alert asking the customer to choose product options first.

---

#### Shortcode (backward compatible)

The original shortcode continues to work and respects the current **Button Text** and **Redirect Location** settings:

```
[buy_button id="123"]
[buy_button id="123" button_text="Get It Now"]
[buy_button id="123" button_text="Get It Now" class="my-custom-button"]
```

| Attribute | Required | Default | Description |
|---|---|---|---|
| `id` | Yes | — | WooCommerce product ID |
| `button_text` | No | *(from settings)* | Overrides the button label for this instance |
| `class` | No | — | Additional CSS class on the wrapper `<div>` |

> **Note:** The shortcode supports simple products only. For variable products use the automatic hooks on the single product page.

---

### 3. WooCommerce Tips

**Status:** ✅ Complete

Adds a tip form to the cart and/or checkout page. Shoppers pick a preset percentage or fixed amount (or enter a custom amount, or select "Cash"), and the selected tip is added to the cart as a WooCommerce fee — it appears in the order totals and is charged along with the order. The tip choice is also saved to the completed order so it can be looked up later.

#### How it works

- Presets are rendered as buttons from the **Tip Rates** list, shown either as **%** of the cart subtotal or as a **fixed** currency amount, depending on the **Tip Type** setting.
- Selecting a preset (or entering a **Custom** amount) sends it via AJAX, stores it in the WooCommerce session, and immediately recalculates the cart totals — no page reload. Percentage tips recalculate live if the cart contents change afterwards; fixed and custom amounts stay static.
- Selecting **Cash** records the shopper's intent to tip in cash but adds **$0** to the cart total — no fee is charged online.
- A **Remove Tip** button appears once a tip is selected, letting the shopper clear it before checkout.
- When **Apply Tax to Tip** is on, the fee is taxed according to your WooCommerce tax settings.
- When the order is placed, the chosen tip is saved to the order as meta (`_ck_tip`). If **Clear Tip After Order Placed** is on, the session tip is cleared on the thank-you page so the next cart starts fresh.
- Works on **both classic and WooCommerce Blocks** cart/checkout pages — on Blocks pages the form is injected directly above the cart items block or the payment block; on classic pages it renders via the standard cart/checkout template hooks.

#### Setting it up

1. Enable **WooCommerce Tip** on the Features page
2. Go to **CommerceKit → Tips Settings**
3. Configure the options:

**Display Settings**

| Option | Description | Default |
|---|---|---|
| **Show on Cart Page** | Displays the tip form after the cart product table | Off |
| **Show on Checkout Page** | Displays the tip form above the payment section | Off |

**Tip Configuration**

| Option | Description | Default |
|---|---|---|
| **Form Title** | Heading shown above the tip buttons | `Send us a tip` |
| **Tip Type** | Whether tip rates are a **% Percent** of the subtotal or a **$ Fixed** amount | Percent |
| **Tip Rates** | Comma-separated list of preset values shown as buttons | `5,10,15,20,25,30` |
| **Apply Tax to Tip** | Taxes the tip fee per your WooCommerce tax settings | Off |

**Options**

| Option | Description | Default |
|---|---|---|
| **Enable Custom Tip** | Lets customers enter any tip amount | On |
| **Enable Cash Tip** | Shows a "Cash" button that records tip intent without adding a charge | On |
| **Clear Tip After Order Placed** | Removes the tip from the session after a successful order | On |

4. Click **Save Changes**

---

### 4. WooCommerce FAQ

**Status:** 🚧 Incomplete — feature file not yet implemented

This feature is registered in the admin panel but its PHP implementation does not exist yet. Enabling it has no visible effect on the frontend.

---

### 5. WooCommerce Product Barcode

**Status:** 🚧 Incomplete — feature file not yet implemented

This feature is registered in the admin panel but its PHP implementation does not exist yet. Enabling it has no visible effect on the frontend.

---

## Gutenberg Blocks

All CommerceKit blocks must be enabled from the **Blocks** tab in the CommerceKit admin dashboard before they appear in the editor. Enabled blocks appear under the **CommerceKit - WooCommerce** category in the block inserter.

---

### 1. Accordion Block

**Status:** ✅ Complete

An interactive accordion that shows and hides sections of content when the header is clicked. Useful for FAQs, product details, or any expandable content on any page or post.

#### Adding the block

1. In the Gutenberg editor, click the **+** inserter
2. Search for **Accordion** or browse **CommerceKit - WooCommerce**
3. Insert the block

#### Adding and removing sections

- Click **Add Section** (the button below the accordion) to add a new section
- Each section has a **title** (click to edit inline) and **content** area (supports rich text: bold, italic, links, lists)
- Click **Remove Section** inside a section to delete it (you cannot remove the last remaining section)
- Click a section header to toggle it open or closed in the editor preview

#### Customizing the appearance

Open the **Inspector Controls** (right sidebar) to access **Accordion Settings**:

| Setting | Description |
|---|---|
| **Border Color** | Color picker for section borders |
| **Border Size** | Border width in pixels |
| **Border Style** | Solid / Dashed / Dotted / Double / None |
| **Title Color** | Color of section heading text |
| **Title Font Size** | Heading font size in pixels |
| **Title Font Family** | Default / Arial / Georgia / Roboto |
| **Content Color** | Color of body text |
| **Content Font Size** | Body font size in pixels |
| **Content Font Family** | Default / Arial / Georgia / Roboto |
| **Button Background Color** | Background of the "Add Section" button |
| **Button Text Color** | Text color of the "Add Section" button |
| **Button Font Size** | Font size of the button label |
| **Button Font Family** | Font family of the button label |
| **Button Text** | Label on the add-section button |

#### Frontend behaviour

- Sections that were **open** in the editor start open on the page
- Sections that were **closed** in the editor start collapsed
- Clicking a header toggles the content open/closed (JavaScript-driven, no page reload)

---

### 2. Category Products Slider Block

**Status:** ✅ Complete

Displays WooCommerce **product categories** as interactive cards in a fully customisable carousel, slider, grid, or inline scroll layout. Each card links to the category archive and can show the category thumbnail, name, product count, description, custom text, and a "Shop Now" call-to-action.

#### Adding the block

1. In the Gutenberg editor insert **Category Products Slider**
2. Select a layout and configure the block in the **Inspector Controls** sidebar

#### Layout options

| Layout | Behaviour |
|---|---|
| **Carousel** | Swiper carousel — multiple cards visible at once, slides one at a time |
| **Ticker** | Shortcut button next to Carousel — sets layout to Carousel with Carousel Style forced to **Ticker** (continuous, non-stop auto-scroll) |
| **Slider** | Swiper slider with selectable transition styles (Slide, Fade, Coverflow, Flip, Cube, Ken Burns) — see Columns per Breakpoint below |
| **Grid** | Static responsive CSS grid — no sliding |
| **Inline** | Horizontally scrollable row — no sliding |

##### Grid Pagination (Grid layout only)

| Setting | Description | Default |
|---|---|---|
| **Pagination** | **None** (all categories up to Total Categories render at once) / **Load More** (a button appends the next page of categories) / **Numbered** (First « Prev, page numbers, Next › Last) | None |
| **Items Per Page** | How many categories are shown per page/load when Pagination is not None | `6` |

Only the first page of categories is included in the page's initial HTML — later pages are fetched on demand from a public REST endpoint (`commerce-kit/v1/csl-grid-page`), so enabling pagination reduces the markup sent for large category counts.

##### Carousel Style (Carousel layout only)

| Style | Behaviour | Default |
|---|---|---|
| **Standard** | Slides one step at a time, with navigation arrows and pagination | ✅ Default |
| **Ticker** | Continuous, non-stop auto-scroll — cards glide by with no snapping, arrows, or pagination | — |
| **Fade** | Crossfades between one category at a time (always 1-up, ignoring the Columns setting) | — |

##### Slider Style (Slider layout only)

| Style | Behaviour | Default |
|---|---|---|
| **Slide** | Classic slide-in transition — respects the Columns per Breakpoint setting | ✅ Default |
| **Fade** | Crossfades between slides (always 1-up, ignoring the Columns setting) | — |
| **Coverflow** | 3D — side slides tilt away in perspective — respects the Columns per Breakpoint setting | — |
| **Flip** | Slides flip over like a card (always 1-up, ignoring the Columns setting) | — |
| **Cube** | Slides rotate like the faces of a cube (always 1-up, ignoring the Columns setting) | — |
| **Ken Burns** | Crossfades while the image slowly zooms in (always 1-up, ignoring the Columns setting) | — |

#### General settings

| Setting | Description | Default |
|---|---|---|
| **Section Title** | Optional heading rendered above the block | `Category Showcase` |
| **Category Source** | **Parent only** (top-level categories) or **All** (every depth, with depth-filter toggles) | Parent only |
| **Specific Categories** | Comma-separated IDs to show only chosen categories | — |
| **Total Categories** | Maximum number of category cards to display | `12` |
| **Order By / Order** | Sort by name, ID, or product count; ascending or descending | Name / ASC |
| **Randomize** | Shuffle categories on each page load | Off |
| **Hide Empty** | Skip categories with no products | Off |
| **Hide Without Thumbnail** | Skip categories that have no image set | Off |

#### Display settings

Controls what appears inside each category card.

| Setting | Description |
|---|---|
| **Content Position** | Where text sits relative to the thumbnail: Below, Above, Left, Right, or Overlay (bottom / top / middle / full-box) |
| **Show Category Name** | Toggle the category title link |
| **Show Product Count** | Show the number of products beside or under the name |
| **Show Description** | Show the category description text |
| **Show Custom Text** | Show a static text string on every card |
| **Show "Shop Now" button** | Add a CTA link to the category archive |
| **Equal Height** | Force all cards to the same height |

#### Thumbnail settings

Controls the category image inside each card.

| Setting | Description |
|---|---|
| **Image Size** | WordPress image size (thumbnail / medium / large / full) |
| **Thumbnail Shape** | Square or circle |
| **Border Radius** | Rounds the image corners in px |
| **Thumbnail Border** | Optional border around the image |
| **Box Shadow** | Drop shadow on the card |
| **Zoom on Hover** | Scale, blur, or greyscale effect when the user hovers |
| **Image Colour Overlay** | Tint the image with a custom colour |
| **Custom Placeholder** | Image shown when a category has no thumbnail set |

#### Slider settings (carousel and slider layouts only)

| Setting | Description | Default |
|---|---|---|
| **Columns** | Slides visible at once per breakpoint (Large / Desktop / Laptop / Tablet / Mobile) | 4 / 3 / 2 / 2 / 1 |
| **Space Between** | Gap between slides in px | `20` |
| **Autoplay** | Automatically advance slides | On |
| **Autoplay Speed** | Milliseconds between auto-advances | `3000` |
| **Scroll Speed** | Transition duration in ms | `600` |
| **Slides to Scroll** | How many slides advance per click | `1` |
| **Pause on Hover** | Stop autoplay when the pointer is over the slider | On |
| **Infinite Loop** | Wrap around from the last slide to the first | On |
| **RTL Direction** | Right-to-left slide order | Off |
| **Show Navigation** | Prev / Next arrow buttons | On |
| **Navigation Position** | Placement of the nav buttons: Top Right / Top Center / Top Left / Bottom Right / Bottom Center / Bottom Left / Vertical Inner / Vertical Outer / Vertical Center | Top Right |
| **Hide Nav on Mobile** | Suppress navigation arrows on small screens | Off |
| **Navigation Style** | Icon set (3 styles), size, colour, background, hover colours, border radius | — |
| **Show Pagination** | Dot / fraction / progress-bar indicator below the slider | Off |
| **Pagination Type** | Bullets / Dynamic Bullets / Fraction / Progressbar | Bullets |
| **Touch Swipe / Mouse Drag** | Allow swipe and drag gestures | On |

With **Ticker** style, Autoplay/Navigation/Pagination controls don't apply — scrolling is continuous and **Scroll Speed** controls how long one full pass takes. With **Fade** style, **Scroll Speed** controls the crossfade duration and the Columns setting is ignored (always 1-up).

For the **Slider** layout, **Scroll Speed** controls the transition speed for every Slider Style (crossfade duration for Fade/Ken Burns, rotation speed for Coverflow/Flip/Cube). The Coverflow, Flip, and Cube effects render in full 3D on the front-end; the block editor shows an approximate preview.

#### Frontend behaviour

- Each card links to the category archive page
- Navigation arrows respect the chosen **Navigation Position**
- Autoplay pauses on hover (when enabled)
- If no categories are found a notice is shown in place of the block

---

## Status Summary

| Name | Type | Status |
|---|---|---|
| Stock Threshold for WooCommerce | Feature | ✅ Complete |
| Buy Button for WooCommerce | Feature | ✅ Complete |
| WooCommerce Tips | Feature | ✅ Complete |
| WooCommerce FAQ | Feature | 🚧 Not implemented |
| WooCommerce Product Barcode | Feature | 🚧 Not implemented |
| Accordion | Block | ✅ Complete |
| Category Products Slider | Block | ✅ Complete |
