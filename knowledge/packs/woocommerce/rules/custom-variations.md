# Custom Product Variations

The boilerplate treats each selectable variant as a complete WooCommerce simple product. Each product keeps its own SKU, URL, price, stock, images and cart identity.

## Group contract

- `variant_parent`: group anchor ID.
- `is_main`: enabled only on the anchor.
- `variant_label`: picker label.
- The anchor stores its own ID in `variant_parent`.
- Every sibling stores the anchor ID in `variant_parent`.
- Standalone products leave `variant_parent` empty.
- All members of a group must be simple products in the same language.

Use the **Clone as variant** product row action to create a sibling. This also converts a standalone source product into a valid group anchor. Existing products can be linked through the ACF fields.

WooCommerce > Variant Integrity reports missing anchors, chained anchors, invalid product types, multiple main products and cross-language links.

## Catalog profile

The default catalog shows standalone products and group anchors:

```php
define('BOILERPLATE_VARIANT_CATALOG', 'main-only');
```

To show every sibling product in catalog listings:

```php
define('BOILERPLATE_VARIANT_CATALOG', 'all');
```

## Attributes

`product_attribute` is a hierarchical taxonomy. Parent terms define attribute types such as Color or Volume. Child terms define values such as Red or 30 ml. Child terms can store optional `hex` metadata for color swatches.

These custom attributes describe and filter custom variant products. They are separate from WooCommerce's native `pa_*` attributes, which remain available for native variable products.
