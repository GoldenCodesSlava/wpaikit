# Initialization Profiles

WooCommerce is required and cannot be disabled. `wpaikit init --preset woo` runs the theme
initializer automatically and stores the selected profile in both `.wpaikit.json` and the
versioned theme configuration.

To reconfigure an existing theme directly, run the interactive initializer from the theme
directory:

```bash
php bin/configure.php
```

For deterministic automation:

```bash
php bin/configure.php \
  --multilingual=wpml \
  --variant-catalog=main-only \
  --wishlist=no \
  --non-interactive
```

The command validates values and updates the versioned `boilerplate-config.php`. It stores no credentials or license keys.

## Multilingual

- `wpml` is the default. It requires WPML CMS, String Translation, ACFML and WooCommerce Multilingual.
- `none` uses `NullMultilingualService` and registers no WPML admin tools or hooks.

### WPML UI string JSON

Theme UI keys and English fallbacks are declared in `src/Theme/Config/Translations.php`. Add one
JSON file per WPML language code under `translations/`, for example `translations/ro.json`:

```json
{
  "nav_search": "Cautare..."
}
```

Only keys declared in `Translations.php` are accepted. With the WPML profile active, import a
language from **Tools > WPML Import Strings**. The importer registers the source string in the
`boilerplate-theme` context and writes completed String Translation values. It never imports
products, categories, attributes or media. With the `none` profile, the service and admin page are
not registered and English fallbacks are returned directly.

## Variant catalog

- `main-only` shows standalone products and one group anchor in archives.
- `all` shows every sibling as a separate product card.

The custom `variant_parent` model remains enabled in both modes.

## Wishlist

When enabled, create a published page with the base-language slug `wishlist`. The WPML profile resolves its translated page ID automatically. Wishlist state uses the `boilerplate_wishlist_v1` browser storage contract.
