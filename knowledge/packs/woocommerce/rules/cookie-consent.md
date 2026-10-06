# WooCommerce Cookie Consent

Read `knowledge/wordpress/rules/boilerplate/cookie-consent.md` first.

## Necessary Store Functions

Do not block the cookies required for an explicitly requested shopping flow:

- `woocommerce_cart_hash`
- `woocommerce_items_in_cart`
- `wp_woocommerce_session_*`
- authentication and security cookies
- cart, custom mini-cart, variations, checkout, and order security

The boilerplate wishlist is Functional/Preferences. Its local-storage reads/writes, page request, account synchronization, and AJAX endpoints remain unavailable until that consent exists. Withdrawal removes the browser key; account data already synchronized is server data governed by the Privacy Policy and project deletion workflow.

Recently viewed products write `<project-slug>_recently_viewed_v1` automatically after a product view. Register it under Functional/Preferences, gate reads and writes on that consent, and remove it when consent is denied or withdrawn. Product IDs alone are not treated as a personal profile and must never be joined to an account in the boilerplate.

## Order Attribution

WooCommerce order attribution (`sbjs_*`) is registered as analytics. `CookieConsentService` filters `wc_order_attribution_allow_tracking`, so Sourcebuster cannot write attribution cookies until a valid `analytics` consent exists.

Do not remove this filter or reclassify attribution as necessary. If WP Consent API is installed, the banner also publishes consent changes through `wp_set_consent`.

## Payments And Extensions

Audit every payment, fraud, shipping, reviews, chat, recommendations, and advertising extension separately. A payment cookie is necessary only when it is required to complete or secure the payment selected by the visitor. Marketing and cross-site measurement from the same provider remain optional.

Before production, test guest and authenticated flows after rejecting all optional categories:

1. Add and remove cart items.
2. Use the custom mini-cart.
3. Select custom product variations.
4. Apply coupons and choose shipping.
5. Complete each payment method.
6. Confirm no `sbjs_*` storage exists before analytics consent.
7. Confirm wishlist controls open consent settings and neither local storage nor account sync occurs before Functional/Preferences consent.
