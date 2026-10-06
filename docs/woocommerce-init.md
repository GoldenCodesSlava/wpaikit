# WooCommerce preset

Run the interactive initializer and select `WooCommerce`:

```bash
wpaikit init
```

The WooCommerce choices can also be supplied as flags while keeping the project/location
questions interactive:

```bash
wpaikit init \
  --preset woo \
  --multilingual wpml \
  --variant-catalog main-only \
  --wishlist no
```

The initializer clones `WP-Boilerplate-Woocommerce`, renames the theme, runs its
`bin/configure.php` command, installs Composer dependencies from the theme root, builds frontend
assets from `frontend/`, records the selected profile in `.wpaikit.json`, and installs the Common,
WordPress and WooCommerce knowledge layers in the generated project root.

`wpaikit knowledge install` reads the preset and canonical target from the nearest parent
`.wpaikit.json` when the knowledge base needs to be updated or repaired. Use `--dry-run` to inspect changes. Locally modified managed files are
protected unless `--force` is supplied.

When `init` uses the current directory, a previously installed and unmodified WPAIKit knowledge
base is allowed. Any unmanaged visible file still blocks initialization to prevent overwrites.

WooCommerce, custom simple-product variants, the custom mini-cart, and Twig checkout are always
enabled. They do not have feature switches.

## Required plugins

Every Woo project requires WooCommerce. The `wpml` profile also requires:

- WPML Multilingual CMS
- WPML String Translation
- Advanced Custom Fields Multilingual
- WooCommerce Multilingual & Multicurrency

Licensed WPML packages are not stored in or downloaded by the boilerplate. Install them after the
WordPress database is configured, then run:

```bash
wpaikit doctor
```

Doctor reports missing, installed-but-unverified, inactive, and active plugin states. Activation
can only be verified when WP-CLI can load the configured WordPress installation and database.
