# Checkout Delivery Recipe

This recipe demonstrates a configurable delivery/pickup policy for the required Custom Twig Checkout. It is not loaded by the boilerplate.

To use it in a project:

1. Move `ExampleDeliveryPolicy.php` into the theme `src/Theme/Checkout/` directory and update its class name.
2. Move `example-config.php` into a versioned project config directory and replace the example values.
3. Register the policy before `ThemeSetup` is constructed:

```php
add_filter('boilerplate_delivery_policy', static function () {
    return new \Boilerplate\Theme\Checkout\ProjectDeliveryPolicy(
        require get_template_directory() . '/config/delivery.php'
    );
});
```

The policy uses WooCommerce hooks for fields, validation and fees. Order metadata is stored through `WC_Order::update_meta_data()` in `woocommerce_checkout_create_order`, which is compatible with HPOS.
