# WooCommerce Analytics

Read `knowledge/rules/boilerplate/analytics.md` and `knowledge/rules/boilerplate/cookie-consent.md` first.

## Event Contract

The WooCommerce profile provides these consent-aware events:

- `view_item_list`
- `select_item`
- `view_item`
- `add_to_cart`
- `remove_from_cart`
- `view_cart`
- `add_to_wishlist`
- `remove_from_wishlist`
- `begin_checkout`
- `add_shipping_info`
- `add_payment_info`
- `purchase`

The server builds initial page events. The frontend bridge handles interactive cart, wishlist, product-list, shipping, and payment events. Product variation IDs and selected variant data must describe the actual purchased product.

## Purchase Rules

- Build purchase data only after validating the order ID and order key.
- Never expose billing email, phone, names, customer IDs, or addresses to the analytics config.
- Use the order number as `transaction_id`.
- Deduplicate `purchase` per provider and order ID using the analytics runtime.
- Do not mark a failed order as a purchase.
- Do not emit purchase from both theme code and a GTM DOM scraper.

## Required Checkout Test

1. Reject optional consent and complete a test order. No ecommerce event may leave the browser.
2. Grant analytics consent and verify the GA4/GTM ecommerce payload.
3. Grant marketing consent and verify configured marketing destinations.
4. Reload the thank-you page and confirm `purchase` is not repeated for any provider that already received it.
5. Test AJAX and non-AJAX add-to-cart, custom variations, mini-cart removal, wishlist, coupons, shipping, and each payment method.
6. Compare currency, value, tax, shipping, coupon, item IDs, prices, and quantities with the WooCommerce order.

When GTM is active, configure tags from the event data layer. Do not scrape prices or customer data from rendered checkout HTML.
