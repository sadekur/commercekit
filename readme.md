# CommerceKit — User Documentation

CommerceKit is a WooCommerce enhancement plugin that adds dynamic pricing, buy-now shortcuts, customer tips, product FAQs, and Gutenberg blocks to your WooCommerce store.

**Requirements:** WordPress 5.9+, WooCommerce 5.0+, PHP 7.4+

---

## Table of Contents

- [Getting Started — Admin Panel](#getting-started)
- [Features](#features)
  - [Stock Threshold for WooCommerce](#1-stock-threshold-for-woocommerce) ✅ Complete
  - [Buy Button for WooCommerce](#2-buy-button-for-woocommerce) ✅ Complete
  - [WooCommerce Tips](#3-woocommerce-tips) ⚠️ Partial
  - [WooCommerce FAQ](#4-woocommerce-faq) 🚧 Incomplete
  - [WooCommerce Product Barcode](#5-woocommerce-product-barcode) 🚧 Incomplete
- [Gutenberg Blocks](#gutenberg-blocks)
  - [Accordion Block](#1-accordion-block) ✅ Complete
  - [Category Products Slider](#2-category-products-slider-block) ✅ Complete
  - [FAQs Block](#3-faqs-block) 🚧 Incomplete
  - [Variant FAQs Block](#4-variant-faqs-block) 🚧 Incomplete

---

## Getting Started

### Enabling Features

1. Go to **WordPress Admin → CommerceKit → Dashboard**
2. Click the **Feature** tab
3. Toggle on any feature you want to activate
4. Click **Save Settings** — the page reloads and the feature is live

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

**Status:** ⚠️ Partially complete — UI renders but tip amounts are not yet processed or added to order totals

Displays a tip/donation input form on the cart and/or checkout page. Shoppers can enter a custom tip amount and submit it. The form's visual appearance (button color, button text, text color) is configurable.

#### Setting it up

1. Enable **WooCommerce Tip** on the Features page
2. Go to **CommerceKit → Tips Settings**
3. Configure the options:

| Option | Description |
|---|---|
| **Add on Cart Page** | Show the tip form above the cart contents |
| **Add on Checkout Page** | Show the tip form above the payment section |
| **Button Color** | Background color of the submit button |
| **Button Text** | Label shown on the submit button |
| **Button Text Color** | Text color of the submit button |

4. Click **Save Settings**

> **Known limitation:** The tip form currently collects the amount from the shopper but does not add it to the order total or create a line item. This feature is under active development. It is safe to enable for UI preview, but do not use on a live store where the tip amount needs to be charged.

> **Blocks compatibility note:** The tip form uses classic WooCommerce hooks (`woocommerce_before_cart_contents`, `woocommerce_review_order_before_payment`) and does not render inside the WooCommerce Blocks cart or checkout. For Blocks-based pages, keep this feature disabled.

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

Displays a horizontal sliding carousel of WooCommerce products from a single category. Shows product image, name, short description, and price. Includes previous/next navigation buttons and optional autoplay.

#### Adding the block

1. In the Gutenberg editor insert **Category Products Slider**
2. Open the **Inspector Controls** sidebar under **Slider Settings**

#### Configuration

| Setting | Description | Default |
|---|---|---|
| **Category ID** | ID of the WooCommerce product category to display | `0` (must be set) |
| **Title** | Heading shown above the slider | `Category Products` |
| **Product Limit** | Maximum number of products to include | `10` |
| **Autoplay** | Automatically advance slides | On |
| **Autoplay Speed (ms)** | Milliseconds between auto-advances | `3000` |

> **Finding a Category ID:** Go to **Products → Categories**, hover over a category name, and read the `tag_ID` value from the URL shown at the bottom of the browser (e.g. `.../term.php?taxonomy=product_cat&tag_ID=**12**`).

#### Frontend behaviour

- Each slide shows a product image (links to product), product name (links to product), short description, and price
- **Prev / Next** arrow buttons on the left and right edges navigate one slide at a time
- With autoplay on, slides advance automatically; hovering over the slider pauses autoplay
- If the Category ID is not set, or no published products exist in that category, a placeholder message is shown instead

---

### 3. FAQs Block

**Status:** 🚧 Incomplete — no editable attributes; displays hardcoded placeholder questions only

The block can be inserted into pages but shows two hardcoded demo FAQ items ("What is CommerceKit?" / "How to use this FAQ?"). The questions and answers are not editable from the editor and there are no customization options. Do not use on a live site yet.

---

### 4. Variant FAQs Block

**Status:** 🚧 Incomplete — identical to FAQs block; intended for variant-specific FAQs but not yet implemented

The block renders the same hardcoded placeholder content as the FAQs block. The distinction between "generic" and "variant" FAQs has not been built out yet. Do not use on a live site.

---

## Status Summary

| Name | Type | Status |
|---|---|---|
| Stock Threshold for WooCommerce | Feature | ✅ Complete |
| Buy Button for WooCommerce | Feature | ✅ Complete |
| WooCommerce Tips | Feature | ⚠️ Partial — UI only, amounts not charged |
| WooCommerce FAQ | Feature | 🚧 Not implemented |
| WooCommerce Product Barcode | Feature | 🚧 Not implemented |
| Accordion | Block | ✅ Complete |
| Category Products Slider | Block | ✅ Complete |
| FAQs | Block | 🚧 Hardcoded placeholder only |
| Variant FAQs | Block | 🚧 Hardcoded placeholder only |
