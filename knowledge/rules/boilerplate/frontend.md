# Frontend Conventions

## Commands

Run all theme commands from `wp-content/themes/boilerplate/`.

```bash
composer install        # install PHP deps
composer phpstan        # static analysis — level 5, src/ and blocks/

cd frontend
npm install
npm run dev             # Vite dev server on port 3002
npm run build           # build to frontend/dist/
npm run lint            # lint JS/config files
npm run format          # format frontend files
```

## Development Mode

Toggle Vite dev assets via `wp-config.php` — never edit `Constants.php` directly:

```php
define('BOILERPLATE_DEV', true);
```

`Constants::isDevelopment()` reads this constant at runtime. Remove it or set it to `false` for staging/production.

## Style Conventions

Prettier: 2-space indentation, single quotes, ES5 trailing commas, 160-character print width. Use kebab-case for SCSS files.

## Tailwind + SCSS: @apply Pattern

Do not write Tailwind utility classes directly in Twig templates.
Instead, use semantic BEM class names in Twig and apply Tailwind utilities in SCSS via `@apply`.

**Twig:**
```twig
<a href="{{ url|raw }}" class="btn btn--primary btn--md">{{ label }}</a>
```

**SCSS (`frontend/src/components/_button.scss`):**
```scss
.btn {
  @apply inline-flex items-center font-medium transition-colors;

  &--primary {
    @apply bg-brand-primary text-white hover:bg-brand-primary/90;
  }

  &--secondary {
    @apply bg-brand-accent text-white hover:bg-brand-accent/90;
  }

  &--ghost {
    @apply border border-brand-primary text-brand-primary hover:bg-brand-primary/10;
  }

  &--sm { @apply text-sm px-3 py-1.5 rounded-md gap-1.5; }
  &--md { @apply text-base px-5 py-2.5 rounded-lg gap-2; }
  &--lg { @apply text-lg px-6 py-3 rounded-lg gap-2.5; }

  &--disabled { @apply opacity-40 pointer-events-none; }
}
```

**Rules:**
- Every component and block has its own SCSS partial: `frontend/src/components/_[name].scss`
- All SCSS partials are imported in `frontend/src/main.scss` (or equivalent entry)
- BEM naming: `.block`, `.block__element`, `.block--modifier`
- Responsive via Tailwind inside `@apply`: `@apply text-base md:text-lg`
- Never write utility classes directly in Twig or PHP

## Testing

No committed automated PHP test suite. Run `php -l` on changed PHP files. Run `composer phpstan` for type errors. For frontend changes, run `npm run lint` and `npm run build`, then manually verify the affected page or block.

## Commits

Short imperative subjects: `Add example block`, `Register product CPT`. PRs should describe the change, list verification steps, mention affected templates/blocks/services, and include screenshots for visual changes.
