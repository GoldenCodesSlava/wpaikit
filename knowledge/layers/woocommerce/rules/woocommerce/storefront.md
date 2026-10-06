# Storefront Runtime

## Catalog and filters

- Server-rendered GET URLs are the source of truth. AJAX is a progressive enhancement, never the only navigation path.
- Preserve `product_cat[]`, `attribute[]`, `stock_status[]`, `min_price`, `max_price`, `orderby` and `product_page` in the URL.
- AJAX responses render the same `product-results.twig` partial used on the first request.
- All public storefront mutations and fragment requests require the `boilerplate_storefront` nonce.
- Keep custom variant catalog collapsing in `ProductVariationService`; filters must not bypass it.

## ProductsListingBlock

Supported sources are catalog, manual, category, featured, on sale, new, related and recently viewed. Manual and recently viewed sources preserve their curated order. Related products use an explicit reference product or the current product. Do not add project-specific queries to Twig.

## Wishlist

- Guests use `boilerplate_wishlist_v1` in local storage.
- Logged-in users use per-user local storage plus `_boilerplate_wishlist_product_ids` user meta.
- On sign-in, merge the guest IDs into the account before clearing the guest key.
- Validate all IDs as published products and cap stored lists.
- Treat wishlist storage as Functional/Preferences. Gate browser storage and both wishlist AJAX endpoints on a valid consent record.

## Recently viewed products

- Store only an ordered, deduplicated array of product IDs in `boilerplate_recently_viewed_v1`.
- Do not synchronize this history with accounts and do not attach visitor, session or analytics identifiers.
- Treat the storage as Functional/Preferences consent. Without consent the history remains empty; withdrawal removes it.
- `ProductsListingBlock` hydrates the `recently_viewed` source through the existing catalog endpoint and hides an empty block.
- Exclude the current product and every sibling resolving to the same custom variation anchor.
- Translate stored IDs to the active WPML language on the server and preserve recent-first order.

## Mini-cart

The custom mini-cart is mandatory. Quantity, removal and coupons update through `boilerplate_update_mini_cart`; a successful response replaces both mini-cart and count fragments. Free-shipping progress and cross-sell limits come from WooCommerce > Storefront. Preserve focus trapping, Escape close, focus restoration and normal cart/checkout links.

## Badges

`ProductBadgeService` is the only product-card badge assembler. Sale and New are automatic; Bestseller, Limited and custom badges are product settings. Extend with `boilerplate_product_badges` instead of adding project conditions to Twig.
