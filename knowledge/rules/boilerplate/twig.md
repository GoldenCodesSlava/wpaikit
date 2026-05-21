# Twig Rules

## Autoescape

`Timber::$autoescape = true` — all `{{ value }}` is auto-encoded.

| Data type | PHP | Twig |
|---|---|---|
| Plain text | pass raw (no `esc_html()`) | `{{ value }}` |
| HTML content | `wp_kses_post()` or Timber Post properties | `{{ value\|raw }}` |
| Pre-sanitized URL | `esc_url()` | `{{ url\|raw }}` |
| Raw URL | pass raw | `{{ url }}` |
| WP hook output (`wp_head`, etc.) | — | `{{ function("wp_head")\|raw }}` |
| HTML attribute string built in PHP | pass raw | `{{ value\|raw }}` |
| Inline conditional attribute | — | `{% if cond %}rel="noopener noreferrer"{% endif %}` |

## Key Rules

- Do not call `esc_html()` or `esc_attr()` in PHP before passing plain text to Twig — Twig encodes `{{ value }}` automatically and double-encoding will occur.
- Use `{{ url|raw }}` after `esc_url()` — `esc_url()` already HTML-encodes and Twig would double-encode the `&`.
- No queries or data formatting in Twig templates — keep logic in Controllers and Services.
