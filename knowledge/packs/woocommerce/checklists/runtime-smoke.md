# Runtime Smoke Checklist

Run this checklist on a clean WordPress database after assigning the WooCommerce Shop, Cart, Checkout and My Account pages.

## Profiles

- WPML profile with WPML CMS, String Translation, ACFML and WooCommerce Multilingual active.
- None profile with all WPML plugins inactive.
- `main-only` custom variant catalog.
- `all` custom variant catalog.
- Wishlist disabled and enabled.

## Catalog and variants

- Open Shop, a product category and product search.
- Combine category, multiple custom attribute groups, stock and price filters.
- Verify sorting and pagination retain active filters.
- Open a group anchor and select every valid custom attribute combination.
- Confirm URL, product ID, price, sale state, stock, gallery and add-to-cart target update.
- Confirm an unavailable combination cannot be added.
- Confirm a native Woo variable product still uses the native variation form.
- Switch language and verify anchor, siblings and attribute terms resolve in the current language.

## Cart

- Add standalone, custom sibling and native variable products.
- Verify the custom mini-cart fragment, count and removal link update.
- Update quantity, remove an item, apply/remove a coupon and test an invalid quantity.
- Verify taxes, shipping, discounts and total match WooCommerce calculations.

## Checkout and orders

- Test guest and logged-in checkout.
- Test billing validation and a different shipping address.
- Change shipping methods and confirm Twig review fragments stay in place.
- Test each payment gateway success and failure path, including gateway-specific fields.
- Verify stock reduction, order email and redirect.
- Verify thank-you access with the correct key, wrong key and another customer's order.
- Verify My Account orders, addresses, downloads and logout.
- Repeat with HPOS enabled.

## Frontend

- Test desktop and mobile widths.
- Navigate filters, dialogs, gallery, variant picker, cart and checkout by keyboard.
- Test with JavaScript disabled: GET filters, product links, cart form and checkout update-totals submit remain usable.
- Confirm `WP_DEBUG=true` produces no warnings.
## Recently viewed products

- Reject Functional/Preferences consent, visit products and confirm no recently viewed local-storage key is written.
- Accept Functional/Preferences consent, visit multiple products and confirm recent-first order without duplicates.
- Add a `ProductsListingBlock` using Recently viewed and confirm it hides when empty and hydrates through AJAX when populated.
- On a product page, confirm the current product and siblings from its custom variation group are excluded.
- Switch WPML languages and confirm stored products resolve to the active-language product IDs.
- Withdraw Functional/Preferences consent and confirm the local-storage history is removed.

## Wishlist consent

- Reject Functional/Preferences consent and confirm wishlist controls open cookie settings.
- Confirm no wishlist local-storage key, account synchronization, or wishlist AJAX response is available before consent.
- Accept Functional/Preferences, test guest storage and authenticated merge, then withdraw and confirm browser storage is removed.

## Consent and analytics

- Run `composer test:cookie-consent`, `npm run test:consent`, and `npm run test:e2e`.
- With every WooCommerce extension active, confirm the Network panel contains no optional tracking, iframe, fraud, chat, review, or attribution request before its category is accepted.
- Confirm Privacy Policy, Cookie Policy, recipient countries, transfer safeguards, and each WooCommerce service appear correctly in all enabled languages.
