<?php
declare(strict_types=1);

namespace Boilerplate\Theme\Blocks;

use Boilerplate\Theme\Services\BlocksService;
use Boilerplate\Theme\Services\ImageService;
use Timber\Timber;

/**
 * Abstract base class for custom ACF blocks (Blocks v3).
 *
 * Block metadata lives in blocks/{Name}/block.json; BlocksService registers it
 * and routes acf.renderCallback to render(). The class only builds the context.
 */
abstract class AbstractBlock
{
    /**
     * Legacy metadata for blocks without block.json.
     *
     * @deprecated Move block metadata to blocks/{Name}/block.json.
     */
    protected string $name = '';
    protected string $title = '';
    protected string $description = '';
    protected array $keywords = [];
    protected string $icon = '';

    /**
     * Whether the current render is the editor preview; set before getContext() runs.
     */
    protected bool $isPreview = false;

    /**
     * Initialize legacy metadata properties for blocks without block.json.
     *
     * @deprecated Move block metadata to blocks/{Name}/block.json.
     */
    protected function init(): void
    {
    }

    /**
     * Register a block that has no block.json through the deprecated PHP API, as Blocks v3.
     *
     * @deprecated Add blocks/{Name}/block.json instead. Returns the registered block name.
     */
    public function registerLegacy(): string
    {
        if (!function_exists('acf_register_block_type')) {
            return '';
        }

        $this->init();

        if ($this->name === '') {
            return '';
        }

        $blockType = acf_register_block_type([
            'name' => $this->name,
            'title' => $this->title,
            'description' => $this->description,
            'category' => 'boilerplate-blocks',
            'icon' => $this->icon,
            'keywords' => $this->keywords,
            'api_version' => BlocksService::BLOCK_VERSION,
            'acf_block_version' => BlocksService::BLOCK_VERSION,
            'supports' => [
                'align' => false,
                'anchor' => true,
            ],
            'render_callback' => [BlocksService::class, 'renderAcfBlock'],
            'example' => $this->getEditorExample(),
        ]);

        return is_array($blockType) ? (string) ($blockType['name'] ?? '') : '';
    }

    /**
     * Inserter example, marked so getField() reads its data directly.
     */
    public function getEditorExample(): array
    {
        $example = $this->getExample();
        $example['attributes']['data']['is_example'] = true;

        return $example;
    }

    /**
     * Render the block. Called by BlocksService::renderAcfBlock() with the ACF render arguments.
     */
    public function render(array $block, string $content = '', bool $isPreview = false, int|string $postId = 0, ?\WP_Block $wpBlock = null, array|false $context = false): void
    {
        $this->isPreview = $isPreview;
        $isActive = $this->isActive($block);

        if (!$isActive && !$isPreview) {
            return;
        }

        $templateContext = $this->sanitizeContext($this->getContext($block));
        $templateContext['is_preview'] = $isPreview;
        $templateContext['inner_content'] = $content;

        $html = BlocksService::renderBlock($this->getBlockName(), $templateContext);

        echo $isActive ? $html : $this->wrapHiddenPreview($html);
    }

    /**
     * Whether the block is enabled on the frontend (is_active field, enabled by default).
     */
    protected function isActive(array $block): bool
    {
        if ($this->isExample($block)) {
            return true;
        }

        $isActive = function_exists('get_field') ? get_field('is_active') : null;

        return !($isActive === false || $isActive === 0 || $isActive === '0');
    }

    /**
     * Mark a block hidden on the frontend so editors can tell it apart in the always-on v3 preview.
     */
    protected function wrapHiddenPreview(string $html): string
    {
        return sprintf(
            '<div class="boilerplate-block-hidden" style="position:relative;opacity:.55;outline:2px dashed #d63638;outline-offset:-2px;">'
            . '<span style="position:absolute;top:8px;right:8px;z-index:10;padding:2px 8px;border-radius:3px;background:#d63638;color:#fff;font:600 12px/1.6 sans-serif;">%s</span>%s</div>',
            esc_html__('Hidden on frontend', 'boilerplate'),
            $html
        );
    }

    /**
     * Get block context data
     */
    protected function getContext(array $block): array
    {
        $page = Timber::get_post();
        return [
            'block_id' => $block['id'] ?? '',
            'block_class' => $block['className'] ?? '',
            'block_anchor' => $block['anchor'] ?? '',
            'block_custom_id' => get_field('block_custom_id') ?? '',
            'page' => $page,
        ];
    }

    /**
     * Sanitize context data
     */
    protected function sanitizeContext(array $context): array
    {
        return $context;
    }

    /**
     * Get block name for template: the class short name (blocks/{Name}/{Name}.php).
     */
    protected function getBlockName(): string
    {
        return (new \ReflectionClass($this))->getShortName();
    }

    /**
     * Get example data for block preview
     */
    protected function getExample(): array
    {
        return [
            'attributes' => [
                'mode' => 'preview',
                'data' => [],
            ],
        ];
    }

    /**
     * Get an ACF field with preview data and fallback support.
     *
     * Saved blocks store raw, flattened values in $block['data'] (repeater row
     * counts, attachment IDs), so only inserter example data is read directly;
     * everything else goes through get_field() for formatted values.
     */
    protected function getField(string $name, $default = null, array $block = [])
    {
        $blockData = $block['data'] ?? [];

        if ($this->isExample($block) && array_key_exists($name, $blockData) && $blockData[$name] !== null && $blockData[$name] !== false) {
            return $blockData[$name];
        }

        if (!function_exists('get_field')) {
            return $default;
        }

        $value = get_field($name);

        if ($value === null || ($value === false && !$this->isBooleanField($name))) {
            return $default;
        }

        return $value;
    }

    /**
     * True/False fields return a real false when switched off; keep it instead of the default.
     */
    private function isBooleanField(string $name): bool
    {
        if (!function_exists('get_field_object')) {
            return false;
        }

        $field = get_field_object($name);

        return is_array($field) && ($field['type'] ?? '') === 'true_false';
    }

    /**
     * Whether the block renders the inserter example from getExample().
     */
    protected function isExample(array $block): bool
    {
        return is_array($block['data'] ?? null) && !empty($block['data']['is_example']);
    }

    /**
     * Keep select/radio values inside the allowed set.
     */
    protected function sanitizeChoice(string $value, array $allowed, string $default): string
    {
        return in_array($value, $allowed, true) ? $value : $default;
    }

    /**
     * Sanitize plain text for safe HTML output.
     * Twig autoescape handles HTML encoding — do not double-escape here.
     */
    protected function sanitizeText($value): string
    {
        return trim((string) ($value ?? ''));
    }

    /**
     * Sanitize rich text that may contain safe HTML.
     */
    protected function sanitizeHtml($value): string
    {
        return wp_kses_post((string) ($value ?? ''));
    }

    /**
     * Sanitize values used inside HTML attributes.
     * Twig autoescape handles HTML encoding — do not double-escape here.
     */
    protected function sanitizeAttribute($value): string
    {
        return trim((string) ($value ?? ''));
    }

    /**
     * Sanitize URL values.
     */
    protected function sanitizeUrl($value): string
    {
        return esc_url((string) ($value ?? ''));
    }

    /**
     * Normalize an ACF image field returned as ID or array.
     */
    protected function sanitizeImage($image): ?array
    {
        return ImageService::normalize($image);
    }

    /**
     * Normalize an ACF link field.
     */
    protected function sanitizeLink($link): ?array
    {
        if (!is_array($link) || empty($link['url'])) {
            return null;
        }

        return [
            'url' => $this->sanitizeUrl($link['url']),
            'title' => $this->sanitizeText($link['title'] ?? $link['url']),
            'target' => $this->sanitizeAttribute($link['target'] ?? ''),
        ];
    }
} 
