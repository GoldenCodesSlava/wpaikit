# Custom Twig Checkout

The checkout is always enabled and has no Native Checkout initialization option.

Twig owns the page layout, billing/shipping field placement, order review and payment presentation. WooCommerce still owns:

- checkout field contracts and values;
- nonce validation;
- update-order-review requests;
- shipping and payment gateway availability;
- field and gateway validation;
- customer and order creation;
- stock reduction, emails and redirects.

`CheckoutService` replaces the standard order-review fragments with the matching Twig partials. This prevents a WooCommerce totals refresh from switching the page back to native markup.

Payment field HTML and the order button HTML are produced by active gateway plugins. They are intentionally rendered as trusted extension HTML so hosted fields, express payment controls and gateway-specific validation can work.

Do not call `WC()->checkout()->process_checkout()` from a controller. Both standard POST and WooCommerce AJAX submissions already reach the native checkout processor.

## Delivery policies

The core profile uses `NullDeliveryPolicy`. Projects can provide a policy through the
`boilerplate_delivery_policy` filter. The complete configurable example is in
`knowledge/woocommerce/recipes/checkout-delivery/`.

Order metadata must be written in `woocommerce_checkout_create_order` through `WC_Order::update_meta_data()`. Do not write order post meta directly; orders may use HPOS tables.
