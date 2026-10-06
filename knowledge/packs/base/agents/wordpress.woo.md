## WordPress Rules

WordPress profile: WooCommerce (Standard + WooCommerce layer).

- Architecture and structure: `knowledge/wordpress/rules/boilerplate/architecture.md`
- PHP, services, blocks and CPTs: `knowledge/wordpress/rules/boilerplate/php.md`
- Twig autoescape and sanitization: `knowledge/wordpress/rules/boilerplate/twig.md`
- Frontend commands and conventions: `knowledge/wordpress/rules/boilerplate/frontend.md`
- Layouts, partials and components: `knowledge/wordpress/rules/boilerplate/layout.md`
- Figma to ACF block rules: `knowledge/shared/rules/figma-blocks.md`
- Figma to code (BEM, SCSS, Twig, PHP, ACF JSON): `knowledge/wordpress/rules/figma-to-code.md`
- WooCommerce configuration: `knowledge/woocommerce/rules/configuration.md`
- Product catalog XLSX and registered project fields: `knowledge/woocommerce/rules/product-catalog-io.md`
- Custom simple-product variations: `knowledge/woocommerce/rules/custom-variations.md`
- Reusable commerce components: `knowledge/woocommerce/rules/components.md`
- Storefront catalog, wishlist, mini-cart and badges: `knowledge/woocommerce/rules/storefront.md`
- Custom Twig checkout: `knowledge/woocommerce/rules/checkout.md`

WooCommerce, custom variations, the custom mini-cart and Custom Twig Checkout are mandatory.
WPML is the default profile, while the `none` multilingual adapter must remain supported. Do not
add product, category, attribute or media importers to the theme: catalog I/O belongs to the
bundled first-party plugin. WPML UI string import is the only theme-local import workflow.
