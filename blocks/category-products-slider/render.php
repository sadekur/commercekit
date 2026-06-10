<?php
/**
 * Render template for the Category Products Slider block.
 *
 * Available in scope: $attributes (array), $content (string), $block (WP_Block)
 *
 * All render logic lives in Render.php (CategoryProductsSliderRender class):
 *   get_terms()      – DB query, ordering, thumbnail filter
 *   html()           – full HTML markup
 *   inline_styles()  – per-instance <style> (dynamic attribute values)
 *   inline_script()  – Swiper initialisation <script>
 *   swiper_config()  – Swiper JS options array
 */

require_once __DIR__ . '/Render.php';
( new CategoryProductsSliderRender( $attributes ) )->render();
