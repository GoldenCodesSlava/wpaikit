<?php
declare(strict_types=1);

namespace Boilerplate\Theme\Checkout;

final class ProjectDeliveryPolicy implements DeliveryPolicyInterface
{
    /**
     * @var array<string, mixed>
     */
    private array $config;

    /**
     * @param array<string, mixed> $config
     */
    public function __construct(array $config)
    {
        $this->config = $config;
    }

    public function init(): void
    {
        add_filter('woocommerce_checkout_fields', [$this, 'addFields']);
        add_action('woocommerce_checkout_process', [$this, 'validateFields']);
        add_action('woocommerce_cart_calculate_fees', [$this, 'addDeliveryFee']);
        add_action('woocommerce_checkout_create_order', [$this, 'saveOrderMetadata'], 10, 2);
    }

    /**
     * @param array<string, array<string, array<string, mixed>>> $fields
     * @return array<string, array<string, array<string, mixed>>>
     */
    public function addFields(array $fields): array
    {
        $fields['order']['delivery_method'] = [
            'type' => 'radio',
            'label' => __('Delivery method', 'boilerplate'),
            'required' => true,
            'options' => [
                'delivery' => (string) $this->config['delivery_label'],
                'pickup' => (string) $this->config['pickup_label'],
            ],
            'priority' => 10,
        ];
        $fields['order']['delivery_zone'] = [
            'type' => 'select',
            'label' => __('Delivery zone', 'boilerplate'),
            'required' => false,
            'options' => ['' => __('Select a zone', 'boilerplate')] + (array) $this->config['zones'],
            'priority' => 20,
        ];

        return $fields;
    }

    public function validateFields(): void
    {
        $method = isset($_POST['delivery_method']) ? sanitize_key(wp_unslash($_POST['delivery_method'])) : '';
        $zone = isset($_POST['delivery_zone']) ? sanitize_key(wp_unslash($_POST['delivery_zone'])) : '';

        if (!in_array($method, ['delivery', 'pickup'], true)) {
            wc_add_notice(__('Select a delivery method.', 'boilerplate'), 'error');
        }

        if ($method === 'delivery' && !array_key_exists($zone, (array) $this->config['zones'])) {
            wc_add_notice(__('Select a valid delivery zone.', 'boilerplate'), 'error');
        }
    }

    public function addDeliveryFee(\WC_Cart $cart): void
    {
        if (is_admin() && !wp_doing_ajax()) {
            return;
        }

        $method = isset($_POST['post_data'])
            ? $this->readPostedCheckoutValue((string) wp_unslash($_POST['post_data']), 'delivery_method')
            : '';

        if ($method !== 'delivery' || (float) $cart->get_subtotal() >= (float) $this->config['free_delivery_from']) {
            return;
        }

        $cart->add_fee(__('Delivery', 'boilerplate'), (float) $this->config['delivery_fee'], true);
    }

    /**
     * @param array<string, mixed> $data
     */
    public function saveOrderMetadata(\WC_Order $order, array $data): void
    {
        $method = isset($_POST['delivery_method']) ? sanitize_key(wp_unslash($_POST['delivery_method'])) : '';
        $zone = isset($_POST['delivery_zone']) ? sanitize_key(wp_unslash($_POST['delivery_zone'])) : '';

        $order->update_meta_data('_boilerplate_delivery_method', $method);
        $order->update_meta_data('_boilerplate_delivery_zone', $zone);
    }

    private function readPostedCheckoutValue(string $query, string $key): string
    {
        parse_str($query, $values);

        return isset($values[$key]) ? sanitize_key((string) $values[$key]) : '';
    }
}
