<?php
declare(strict_types=1);

namespace Boilerplate\Theme\Services;

use Boilerplate\Theme\Blocks\AbstractBlock;
use Timber\Timber;
use Twig\Environment;
use Twig\TwigFunction;

/**
 * Service for managing custom Gutenberg blocks (ACF Blocks v3)
 */
class BlocksService
{
    public const MIN_ACF_VERSION = '6.7.0';
    public const BLOCK_VERSION = 3;

    /**
     * Registered block instances keyed by block name (e.g. acf/example-block).
     *
     * @var array<string, AbstractBlock>
     */
    private static array $blocks = [];

    public function init(): void
    {
        $this->registerHooks();
    }

    /**
     * Register WordPress hooks
     */
    private function registerHooks(): void
    {
        add_filter('block_categories_all', [$this, 'registerBlockCategories'], 10, 2);
        add_filter('acf/blocks/default_block_version', [$this, 'defaultBlockVersion']);
        add_filter('timber/twig', [$this, 'addTwigFunctions']);
        add_action('init', [$this, 'loadBlocks']);
        add_action('admin_notices', [$this, 'renderAcfVersionNotice']);
    }

    /**
     * Load all blocks from blocks directory
     */
    public function loadBlocks(): void
    {
        if (!self::isAcfSupported()) {
            return;
        }

        $blocksDir = get_template_directory() . '/blocks';

        if (!is_dir($blocksDir)) {
            return;
        }

        $blockDirs = glob($blocksDir . '/*', GLOB_ONLYDIR) ?: [];

        foreach ($blockDirs as $blockDir) {
            $blockName = basename($blockDir);
            $blockFile = $blockDir . '/' . $blockName . '.php';

            if (!file_exists($blockFile)) {
                continue;
            }

            require_once $blockFile;

            $className = 'Boilerplate\\Theme\\Blocks\\' . $blockName . '\\' . $blockName;
            if (!class_exists($className) || !is_subclass_of($className, AbstractBlock::class)) {
                continue;
            }

            $block = new $className();

            if (file_exists($blockDir . '/block.json')) {
                $blockType = register_block_type($blockDir, [
                    'example' => $block->getEditorExample(),
                ]);

                if ($blockType instanceof \WP_Block_Type) {
                    self::$blocks[$blockType->name] = $block;
                }

                continue;
            }

            // Blocks without block.json still register through the deprecated PHP API.
            $name = $block->registerLegacy();
            if ($name !== '') {
                self::$blocks[$name] = $block;
            }
        }
    }

    /**
     * Render callback referenced by acf.renderCallback in every block.json.
     */
    public static function renderAcfBlock(array $block, string $content = '', bool $is_preview = false, int|string $post_id = 0, ?\WP_Block $wp_block = null, array|false $context = false): void
    {
        $instance = self::$blocks[$block['name'] ?? ''] ?? null;

        if ($instance === null) {
            return;
        }

        $instance->render($block, $content, $is_preview, $post_id, $wp_block, $context);
    }

    /**
     * Opt every ACF block that does not declare a version into Blocks v3.
     */
    public function defaultBlockVersion(): int
    {
        return self::BLOCK_VERSION;
    }

    /**
     * ACF PRO must be active and recent enough for Blocks v3 inline editing.
     */
    public static function isAcfSupported(): bool
    {
        return defined('ACF_VERSION')
            && function_exists('acf_register_block_type')
            && version_compare((string) ACF_VERSION, self::MIN_ACF_VERSION, '>=');
    }

    /**
     * Warn admins when ACF PRO is active but too old to register the theme blocks.
     */
    public function renderAcfVersionNotice(): void
    {
        if (!defined('ACF_VERSION') || self::isAcfSupported() || !current_user_can('activate_plugins')) {
            return;
        }

        printf(
            '<div class="notice notice-error"><p>%s</p></div>',
            esc_html(sprintf(
                /* translators: 1: required ACF PRO version, 2: installed ACF PRO version */
                __('Theme blocks require Advanced Custom Fields PRO %1$s or newer (installed: %2$s).', 'boilerplate'),
                self::MIN_ACF_VERSION,
                (string) ACF_VERSION
            ))
        );
    }

    /**
     * Register custom block category
     */
    public function registerBlockCategories(array $categories, \WP_Block_Editor_Context $context): array
    {
        return array_merge($categories, [
            [
                'slug' => 'boilerplate-blocks',
                'title' => __('Boilerplate Blocks', 'boilerplate'),
                'icon' => 'admin-customizer',
            ],
        ]);
    }

    /**
     * Twig helpers for block templates.
     */
    public function addTwigFunctions(Environment $twig): Environment
    {
        $safe = ['is_safe' => ['html']];

        $twig->addFunction(new TwigFunction('block_wrapper_attributes', [self::class, 'wrapperAttributes'], $safe));
        $twig->addFunction(new TwigFunction('acf_inline_text', [self::class, 'inlineTextAttributes'], $safe + ['needs_context' => true]));
        $twig->addFunction(new TwigFunction('acf_inline_toolbar', [self::class, 'inlineToolbarAttributes'], $safe + ['needs_context' => true]));

        return $twig;
    }

    /**
     * Block wrapper attributes (anchor, className, supports) merged with template attributes.
     *
     * On the frontend this delegates to get_block_wrapper_attributes(); in the editor
     * preview the editor renders its own wrapper, so only the passed attributes are printed.
     *
     * @param array<string, scalar|null> $extra
     */
    public static function wrapperAttributes(array $extra = []): string
    {
        $extra = array_filter($extra, static fn ($value): bool => $value !== null && $value !== '' && $value !== false);

        if (\WP_Block_Supports::$block_to_render !== null) {
            return get_block_wrapper_attributes(array_map('strval', $extra));
        }

        $attributes = [];
        foreach ($extra as $name => $value) {
            $attributes[] = sprintf('%s="%s"', esc_attr((string) $name), esc_attr((string) $value));
        }

        return implode(' ', $attributes);
    }

    /**
     * Inline text editing attributes for a Text/Textarea field.
     *
     * ACF returns these attributes for every v3 render, so they are limited to the
     * editor preview here to keep data-acf-* and role="button" out of the frontend.
     */
    public static function inlineTextAttributes(array $context, string $fieldName, array $args = []): string
    {
        if (empty($context['is_preview']) || !function_exists('acf_inline_text_editing_attrs')) {
            return '';
        }

        return acf_inline_text_editing_attrs($fieldName, $args);
    }

    /**
     * Inline toolbar editing attributes for one or more fields (editor preview only).
     *
     * @param string|string[] $fields
     */
    public static function inlineToolbarAttributes(array $context, string|array $fields, array $args = []): string
    {
        if (empty($context['is_preview']) || !function_exists('acf_inline_toolbar_editing_attrs')) {
            return '';
        }

        $attributes = acf_inline_toolbar_editing_attrs((array) $fields, $args);

        return is_string($attributes) ? $attributes : '';
    }

    /**
     * Render block template with Timber
     */
    public static function renderBlock(string $blockName, array $context = []): string
    {
        $templatePath = 'blocks/' . $blockName . '/' . $blockName . '.twig';
        $mergedContext = array_merge(Timber::context(), $context);

        return Timber::compile($templatePath, $mergedContext) ?: '';
    }
}
