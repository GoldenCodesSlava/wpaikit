# Layout & Template Rules

Rules for structuring and generating any frontend template in the wpaikit boilerplate — blocks, partials, components, and layout-level elements (header, footer, nav).

Read this file alongside `knowledge/rules/figma-to-code.md` before generating any template code.

---

## Template Types

Use the right template type for each UI element:

| Type | Path | SCSS path | When to use |
|---|---|---|---|
| **Block** | `views/blocks/{Name}/{Name}.twig` | `frontend/src/css/blocks/_name.scss` | ACF Gutenberg block — full-width page section |
| **Component** | `views/components/{name}.twig` | `frontend/src/css/components/_name.scss` | Reusable UI element (button, card, badge) used in multiple places |
| **Partial** | `views/partials/{name}.twig` | `frontend/src/css/partials/_name.scss` | Layout-level element rendered once per page (header, footer, nav) |

Never put block-level markup in a component. Never re-implement a component's markup inside a block — use `{% include %}`.

---

## File Organization

```
frontend/src/css/
├── main.scss              ← entry point, all @imports here
├── base/
│   ├── _reset.scss
│   ├── _typography.scss   ← global type styles
│   └── _variables.scss
├── components/
│   ├── _button.scss
│   ├── _badge.scss
│   └── _card.scss
├── blocks/
│   ├── _hero-block.scss
│   └── _team-block.scss
└── partials/
    ├── _header.scss
    └── _footer.scss
```

Every new SCSS file must be imported in `main.scss`. Never reference a file that is not imported there.

---

## Using Existing Components

Before writing any new markup, check `.wpaikit/components-registry.md`.

**If the component exists → use `{% include %}`:**

```twig
{# Wrong — re-implementing an existing button #}
<a href="{{ cta.url|raw }}" class="btn btn--primary btn--md">{{ cta.title }}</a>

{# Correct — include the existing component #}
{% include 'views/components/button.twig' with {
  type: 'Primary',
  size: 'MD',
  label: cta.title,
  url: cta.url
} only %}
```

**If a BEM modifier already covers the variant → extend, don't duplicate:**

```scss
{# Wrong — new class for a variant that should be a modifier #}
.hero-cta { @apply bg-brand-primary text-white; }

{# Correct — use the existing modifier #}
{# In Twig: class="btn btn--primary btn--lg" #}
```

---

## Partial Structure (Header, Footer, Nav)

Partials are layout-level elements. They follow the same BEM + @apply rules as blocks.

**Header example:**

```twig
{#
  Partial: Header
  Usage: {% include 'views/partials/header.twig' %}
#}

<header class="site-header">
  <div class="site-header__inner container">
    <a href="{{ site.url }}" class="site-header__logo">
      <img src="{{ logo.url|raw }}" alt="{{ site.name }}">
    </a>
    <nav class="site-header__nav">
      {% for item in menu %}
        <a href="{{ item.url|raw }}" class="site-header__nav-link">{{ item.title }}</a>
      {% endfor %}
    </nav>
  </div>
</header>
```

```scss
.site-header {
  @apply sticky top-0 z-50 bg-canvas border-b border-subtle;

  &__inner {
    @apply flex items-center justify-between py-4;
  }

  &__logo {
    @apply flex-shrink-0;
  }

  &__nav {
    @apply hidden gap-6;

    @screen md {
      @apply flex;
    }
  }

  &__nav-link {
    @apply text-sm font-medium text-primary hover:text-brand-primary transition-colors;
  }
}
```

**Rules for partials:**
- BEM root = semantic name: `.site-header`, `.site-footer`, `.site-nav`
- Always use `container` for the inner wrapper (same as blocks)
- Sticky header: `sticky top-0 z-50` via `@apply`
- Never use `position: fixed` for header unless explicitly required — use `sticky`

---

## z-index Scale

Use a consistent z-index scale to avoid stacking conflicts:

| Layer | z-index | Usage |
|---|---|---|
| Base content | 0 | Default |
| Floating elements | 10 | Dropdowns, tooltips |
| Sticky header | 50 | `z-50` |
| Overlay backdrop | 100 | Modal/drawer background |
| Modal/Drawer | 200 | Above backdrop |
| Notifications | 300 | Toast messages |

Always use Tailwind z-index classes (`z-10`, `z-50`) via `@apply` in SCSS.

---

## Responsive Strategy

Mobile-first always. Base classes = mobile, `@screen md {}` = desktop.

Standard breakpoints:
```
sm:   640px   (rarely used — prefer md)
md:   768px   ← primary breakpoint for layout changes
lg:   1024px  ← secondary, for fine-tuning
xl:   1280px  ← container max-width area
```

Common responsive patterns:
```scss
// Stack → row
.block__content {
  @apply flex flex-col gap-4;
  @screen md { @apply flex-row gap-12; }
}

// Full width → grid
.block__items {
  @apply grid grid-cols-1 gap-6;
  @screen md { @apply grid-cols-3; }
}

// Hidden → visible
.site-header__nav {
  @apply hidden;
  @screen md { @apply flex gap-6; }
}
```

---

## Code Quality Standards

These apply to all generated templates regardless of type:

**Twig:**
- Header comment with component/partial name, params, usage snippet
- `{% if field %}...{% endif %}` for every optional field
- `url|raw` for all URLs (pre-sanitized via PHP)
- `content|raw` for wysiwyg output only
- No PHP logic, no inline styles
- `{% include %}` for any component in the registry

**SCSS:**
- Header comment: `// Block/Component/Partial: Name`
- BEM naming — kebab-case, no camelCase
- All styling via `@apply` — no raw CSS properties unless unavoidable (e.g. `clip-path`, `aspect-ratio` not in Tailwind)
- Mobile-first, `@screen md {}` for desktop
- One file per component/block/partial, imported in `main.scss`
- `&__inner {}` left empty when `container` handles width — add comment: `// container handles width`

**PHP (blocks only):**
- `declare(strict_types=1)` always first
- `get_field() ?: ''` for strings, `get_field() ?: null` for objects
- `new \Timber\Image()` for all image fields
- No HTML in PHP — all markup lives in Twig
