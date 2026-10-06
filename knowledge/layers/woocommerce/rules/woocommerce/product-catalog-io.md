# Product Catalog I/O

Catalog XLSX import belongs to the bundled first-party `wpaikit-product-catalog-io` plugin. Do not
put product, taxonomy, custom variation or media import logic in the theme. The theme may only
register project fields through the plugin extension filter.

## Client workbook

The client template is stored at
`knowledge/templates/woocommerce/product-catalog-io/wpaikit-products-client-import.xlsx`. Current
schema version is `client-1.5`; `client-1.4` remains readable for backward compatibility.

## Export and round trip

The first-party plugin owns all three catalog exports: `client`, `full` and `price-stock`. Do not
implement project export logic inside the theme. Every exported workbook must pass the same
profile-specific preflight used for uploads. Full export uses the technical `Products`,
`Translations`, `Terms`, `Product Terms`, `Media` and `Custom Fields` sheets. Client exports store
`_wpaikit_product_key` in a hidden system column, rebuild `variant_of_sku` from the current
simple-product anchor and never expose WordPress IDs.

Price/stock workbooks use the dedicated `Price Stock` contract. Their import path may update
only price, stock status/quantity and backorders, and must finish before taxonomy, variation,
media and project-field phases. All exported user-controlled strings must be written explicitly as
spreadsheet text to prevent formula injection.

The `Media` sheet uses these columns:

| Column | Values |
|---|---|
| `sku` | Existing SKU from the `Products` sheet |
| `role` | `featured` or `gallery` |
| `source` | `attachment:<id>`, uploads-relative path, public HTTPS URL, or `__CLEAR__` |
| `position` | Non-negative gallery order; ignored for a single featured image |
| `alt` | Source-language attachment alt text |

Remote media must stay behind the plugin guard: HTTPS only, public DNS/IP only, no credentials or
custom port, at most two redirects, 10 MB maximum, and JPEG/PNG/WebP/AVIF/GIF content. Do not bypass
the guard with direct `download_url()`, `file_get_contents()` or unvalidated HTTP calls.

`__CLEAR__` is explicit destructive intent. An empty cell means leave the current value unchanged.
The same media source is deduplicated by its source hash and reused across WPML translations.

## Project fields

Register every design-specific field through
`wpaikit_product_catalog_io_product_fields`. Arbitrary post-meta keys from an XLSX are forbidden.
Each registered field requires:

- one of `text`, `html`, `integer`, `decimal`, `boolean`;
- an explicit `translatable` policy;
- `read(productId)` and `write(productId, value)` callbacks for snapshot and rollback;
- optional `sanitize(value)` and `validate(value)` callbacks; validation returns `true` or an error
  string, and type defaults are used when omitted.

Example:

```php
add_filter('wpaikit_product_catalog_io_product_fields', static function (array $fields): array {
    $fields['subtitle'] = [
        'type' => 'text',
        'translatable' => true,
        'read' => static fn (int $productId): mixed => metadata_exists('post', $productId, '_product_subtitle')
            ? get_post_meta($productId, '_product_subtitle', true)
            : null,
        'write' => static function (int $productId, mixed $value): void {
            if ($value === null) {
                delete_post_meta($productId, '_product_subtitle');
                return;
            }
            update_post_meta($productId, '_product_subtitle', $value);
        },
    ];
    return $fields;
});
```

Translatable values belong to language rows in `Product Content`. Non-translatable values belong
to `Products` and are written only to the source product. All writes must preserve the plugin's
preflight, batch processing and rollback flow.
