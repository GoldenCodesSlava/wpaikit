# Repository Guidelines

## Knowledge Profile

This project uses the WPAIKit WooCommerce profile. It includes the Common, WordPress and
WooCommerce knowledge layers. WPAIKit-managed files and checksums are listed in
`.wpaikit/knowledge-manifest.json`.

## Project Rules

- Architecture and structure: `knowledge/rules/boilerplate/architecture.md`
- PHP, services, blocks and CPTs: `knowledge/rules/boilerplate/php.md`
- Twig autoescape and sanitization: `knowledge/rules/boilerplate/twig.md`
- Frontend commands and conventions: `knowledge/rules/boilerplate/frontend.md`
- Layouts, partials and components: `knowledge/rules/boilerplate/layout.md`
- Figma to ACF block rules: `knowledge/rules/figma-to-block.md`
- WooCommerce configuration: `knowledge/rules/woocommerce/configuration.md`
- Product catalog XLSX and registered project fields: `knowledge/rules/woocommerce/product-catalog-io.md`
- Custom simple-product variations: `knowledge/rules/woocommerce/custom-variations.md`
- Reusable commerce components: `knowledge/rules/woocommerce/components.md`
- Storefront catalog, wishlist, mini-cart and badges: `knowledge/rules/woocommerce/storefront.md`
- Custom Twig checkout: `knowledge/rules/woocommerce/checkout.md`

WooCommerce, custom variations, the custom mini-cart and Custom Twig Checkout are mandatory.
WPML is the default profile, while the `none` multilingual adapter must remain supported. Do not
add product, category, attribute or media importers to the theme: catalog I/O belongs to the
bundled first-party plugin. WPML UI string import is the only theme-local import workflow.

Read the relevant rule before changing that area. Put project-specific discoveries in
`.wpaikit/project.md`; do not fork the installed base rules without a project-specific reason.

## WPAIKit Commands

Read `knowledge/context.md` before acting on any command starting with `/`.
