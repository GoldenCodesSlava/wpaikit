# Theme foundation

The standard and WooCommerce profiles share the same contracts for global settings, images, and system states.

## Theme Settings

General project data belongs to `Settings -> Theme Settings`. Cookies and Analytics keep their own settings pages because they are independent modules with separate validation and consent behavior.

Read normalized settings from `theme.themeSettings` in Twig. Do not call `get_field()` from a template and do not read the raw `theme_settings` option outside `ThemeSettingsService`.

Available groups:

- `branding` and compatibility aliases `header.logo` / `footer.logo`;
- `contact` with display values and a normalized `phone_url`;
- `social_links`;
- `images.default`;
- translated `legal` page links;
- `footer.copyright_title`, where `{year}` is replaced at runtime;
- `system_pages.maintenance`.

WPML String Translation owns the editable address, social labels, footer copyright, and maintenance copy. Legal page IDs are resolved through `wpml_object_id`. Without WPML, the source values are returned unchanged.

The Theme Settings site icon is synchronized to WordPress core's `site_icon` option so WordPress remains responsible for favicon markup.

## Images

All Twig images must use `views/components/image.twig`. Direct `<img>` markup elsewhere in `views/` is forbidden.

```twig
{% include 'components/image.twig' with {
  image: post.thumbnail,
  size: 'boilerplate-large',
  alt: post.title,
  loading: 'eager',
  fetchpriority: 'high',
  image_class: 'hero__image'
} only %}
```

`ImageService::normalize()` accepts attachment IDs, ACF image arrays, Timber images, and already-normalized arrays. It exposes URL, dimensions, alt text, `srcset`, `sizes`, and MIME type. Set `use_placeholder: true` only where showing the Theme Settings fallback is preferable to rendering no media.

Keep the first viewport image eager with `fetchpriority: high`; keep offscreen images lazy. The component emits dimensions to reduce layout shift.

## System states

- `404.twig` uses the shared empty-state component.
- Search and archive empty results use the same component.
- Maintenance mode responds with HTTP 503, `Retry-After`, and no analytics/cookie runtime. Administrators, AJAX, cron, login, and WP-CLI bypass it.
- Services can stop a request with `do_action('boilerplate_render_system_error', $title, $message, $status)`.
- WPML integrations can render a stable missing-translation page with `do_action('boilerplate_render_missing_translation', $returnUrl)` when they know a requested object has no translation.

Do not use the missing-translation action as a blanket 404 replacement: a normal missing URL and a known untranslated object are different states.
