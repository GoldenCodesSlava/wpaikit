<?php
declare(strict_types=1);

$themeRoot = dirname(__DIR__);
$renderCallback = 'Boilerplate\\Theme\\Services\\BlocksService::renderAcfBlock';

$fieldGroups = [];
foreach (glob($themeRoot . '/acf-json/*.json') ?: [] as $groupFile) {
    $group = json_decode((string) file_get_contents($groupFile), true);
    if (!is_array($group)) {
        throw new RuntimeException("ACF JSON is not valid: {$groupFile}");
    }

    foreach ($group['location'] ?? [] as $rules) {
        foreach ($rules as $rule) {
            if (($rule['param'] ?? '') === 'block' && ($rule['operator'] ?? '') === '==') {
                $fieldGroups[(string) $rule['value']] = basename($groupFile);
            }
        }
    }
}

$blockDirs = glob($themeRoot . '/blocks/*', GLOB_ONLYDIR) ?: [];
if ($blockDirs === []) {
    throw new RuntimeException('No blocks found in blocks/.');
}

foreach ($blockDirs as $blockDir) {
    $blockName = basename($blockDir);
    $slug = strtolower((string) preg_replace('/(?<!^)[A-Z]/', '-$0', $blockName));
    $name = 'acf/' . $slug;

    $jsonFile = $blockDir . '/block.json';
    if (!is_file($jsonFile)) {
        throw new RuntimeException("{$blockName}: block.json is missing.");
    }

    $metadata = json_decode((string) file_get_contents($jsonFile), true);
    if (!is_array($metadata)) {
        throw new RuntimeException("{$blockName}: block.json is not valid JSON.");
    }

    $expected = [
        'name' => $name,
        'apiVersion' => 3,
        'category' => 'boilerplate-blocks',
        'textdomain' => 'boilerplate',
    ];
    foreach ($expected as $key => $value) {
        if (($metadata[$key] ?? null) !== $value) {
            throw new RuntimeException("{$blockName}: block.json \"{$key}\" must be " . json_encode($value) . '.');
        }
    }

    foreach (['title', 'description', 'icon'] as $key) {
        if (!is_string($metadata[$key] ?? null) || $metadata[$key] === '') {
            throw new RuntimeException("{$blockName}: block.json \"{$key}\" is required.");
        }
    }

    $acf = $metadata['acf'] ?? [];
    if (($acf['blockVersion'] ?? null) !== 3) {
        throw new RuntimeException("{$blockName}: acf.blockVersion must be 3.");
    }
    if (($acf['renderCallback'] ?? null) !== $renderCallback) {
        throw new RuntimeException("{$blockName}: acf.renderCallback must be {$renderCallback}.");
    }

    // v3 always renders a preview; legacy v2 switches turn the block into a placeholder.
    $forbidden = [
        'acf.mode' => $acf['mode'] ?? null,
        'acf.renderTemplate' => $acf['renderTemplate'] ?? null,
        'supports.mode' => $metadata['supports']['mode'] ?? null,
        'supports.jsx' => $metadata['supports']['jsx'] ?? null,
        'example' => $metadata['example'] ?? null,
    ];
    foreach ($forbidden as $key => $value) {
        if ($value !== null) {
            $hint = $key === 'example' ? ' (inserter example data belongs in getExample())' : '';
            throw new RuntimeException("{$blockName}: block.json must not define \"{$key}\"{$hint}.");
        }
    }

    $classFile = $blockDir . '/' . $blockName . '.php';
    if (!is_file($classFile)) {
        throw new RuntimeException("{$blockName}: PHP class {$blockName}.php is missing.");
    }

    $class = (string) file_get_contents($classFile);
    $classContracts = [
        "namespace Boilerplate\\Theme\\Blocks\\{$blockName};" => 'namespace',
        "class {$blockName} extends AbstractBlock" => 'AbstractBlock subclass',
    ];
    foreach ($classContracts as $needle => $label) {
        if (!str_contains($class, $needle)) {
            throw new RuntimeException("{$blockName}: {$label} is missing ({$needle}).");
        }
    }
    foreach (['acf_register_block_type', 'function init(', 'function register('] as $legacy) {
        if (str_contains($class, $legacy)) {
            throw new RuntimeException("{$blockName}: legacy registration \"{$legacy}\" must move to block.json.");
        }
    }

    $twigFile = $themeRoot . "/views/blocks/{$blockName}/{$blockName}.twig";
    if (!is_file($twigFile)) {
        throw new RuntimeException("{$blockName}: Twig template views/blocks/{$blockName}/{$blockName}.twig is missing.");
    }

    $twig = (string) file_get_contents($twigFile);
    if (!str_contains($twig, 'block_wrapper_attributes(')) {
        throw new RuntimeException("{$blockName}: Twig root element must use block_wrapper_attributes().");
    }
    if (preg_match('/acf_inline_(text|toolbar)_editing_attrs/', $twig)) {
        throw new RuntimeException("{$blockName}: use acf_inline_text()/acf_inline_toolbar() in Twig; the raw ACF helpers leak attributes to the frontend.");
    }

    if (!isset($fieldGroups[$name])) {
        throw new RuntimeException("{$blockName}: no acf-json field group with location block == {$name}.");
    }
}

$abstractBlock = (string) file_get_contents($themeRoot . '/src/Theme/Blocks/AbstractBlock.php');
$blocksService = (string) file_get_contents($themeRoot . '/src/Theme/Services/BlocksService.php');
$serviceContracts = [
    'public static function renderAcfBlock(' => 'render dispatcher',
    "acf/blocks/default_block_version" => 'default block version filter',
    'register_block_type($blockDir' => 'block.json registration',
    "empty(\$context['is_preview'])" => 'inline editing limited to the editor preview',
    'MIN_ACF_VERSION' => 'ACF PRO version gate',
];
foreach ($serviceContracts as $needle => $label) {
    if (!str_contains($blocksService, $needle)) {
        throw new RuntimeException("BlocksService: {$label} is missing.");
    }
}
if (!str_contains($abstractBlock, 'bool $isPreview') || !str_contains($abstractBlock, "['is_example']")) {
    throw new RuntimeException('AbstractBlock: render() must take $isPreview and getField() must read raw data only for the inserter example.');
}
if (!str_contains($abstractBlock, 'isBooleanField(')) {
    throw new RuntimeException('AbstractBlock: getField() must keep false from True/False fields instead of returning the default.');
}

echo count($blockDirs) . " block(s) follow the ACF Blocks v3 contract.\n";
