# Reusable Commerce Components

## Bundled ACF blocks

Only two blocks ship with the WooCommerce boilerplate:

- `ExampleBlock`, the implementation reference for future project blocks;
- `ProductsListingBlock`, the reusable commerce listing described below.

## ProductsListingBlock

Files:

- `blocks/ProductsListingBlock/ProductsListingBlock.php`
- `views/blocks/ProductsListingBlock/ProductsListingBlock.twig`
- `acf-json/group_products_listing_block.json`
- `views/components/woocommerce/products-listing.twig`
- `views/components/woocommerce/product-results.twig`
- `views/partials/woocommerce/active-product-filters.twig`
- `views/partials/woocommerce/product-filters.twig`
- `frontend/src/css/woocommerce/catalog.scss`
- `frontend/src/js/components/product-catalog.js`

Context:

- `products`: normalized product card DTOs.
- `filters`: product categories, hierarchical `product_attribute` groups and stock statuses.
- `active_filters`: validated request values.
- `sort_options`: stable order keys and labels.
- `pagination`: numbered page DTO.
- `locked_category`: optional category slug configured on the block.
- `source`: catalog, manual products, category, featured, on sale, new, related or recently viewed.

The block keeps a normal GET form as its no-JavaScript fallback. JavaScript progressively enhances filters, sort and pagination through the nonce-protected `boilerplate_filter_products` endpoint. Every state change is reflected in the canonical query string with `history.pushState`; browser back/forward restores the UI and result set.

## Product Card

The card component includes price, stock, reusable badges, custom-attribute swatches, native add-to-cart behavior and the custom-variant dialog. `ProductBadgeService` owns automatic Sale/New badges and the product-level Bestseller, Limited and custom badge fields. A concrete custom variant can be added directly from the dialog because it remains a complete simple WooCommerce product.

## Single Product

The single product component includes the gallery, price/stock state, custom variant picker and add-to-cart target. Selecting a complete custom attribute combination loads sanitized variant data and updates the product state in place. Native variable products use the WooCommerce variation form as a compatibility path.

## Custom Attributes

Filters and pickers use the same hierarchical `product_attribute` taxonomy. Parent terms are UI groups and child terms are values. There is no separate `specifications` entity.
