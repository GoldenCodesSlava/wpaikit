# Analytics Module

The theme owns analytics loading. Do not paste tracking code into Twig, ACF fields, `wp_head`, `wp_footer`, or a third-party snippets plugin.

## Configuration

Configure providers under **Settings -> Analytics**. The supported installation modes are mutually exclusive:

- **Google Tag Manager**: the site loads one GTM container. Configure GA4, Google Ads, Meta, and other tags inside that container.
- **Direct providers**: the site can load Google Tag (GA4 / Google Ads) and Facebook / Meta Pixel without GTM.

Valid IDs can also be supplied from `wp-config.php`:

```php
define('THEME_GTM_ID', 'GTM-ABC1234');
define('THEME_GA4_ID', 'G-ABC1234567');
define('THEME_GOOGLE_ADS_ID', 'AW-123456789');
define('THEME_META_PIXEL_ID', '123456789012345');
```

`THEME_FACEBOOK_PIXEL_ID` is supported as an alternative name for teams that still use the Facebook Pixel terminology:

```php
define('THEME_FACEBOOK_PIXEL_ID', '123456789012345');
```

Use only one Pixel constant. If both are defined, `THEME_META_PIXEL_ID` takes precedence.

IDs are not secrets, but constants are useful when environments require different destinations. Analytics is enabled only in the environments selected on the settings page and excludes administrators by default.

For direct Google Ads, map each Event API name to its Google Ads conversion label on the same settings page. The runtime sends that event as `conversion` with the validated `AW-ID/label` destination. Do not configure the same conversion in GTM and direct mode.

## Consent Contract

- Basic Consent Mode is enforced.
- No provider request may occur before the relevant `analytics` or `marketing` consent.
- Google consent defaults are denied and include `analytics_storage`, `ad_storage`, `ad_user_data`, and `ad_personalization`.
- A consent change updates active providers immediately.
- GTM containers must use built-in consent checks. Never use a Custom HTML tag to override consent.
- The GTM container must not duplicate a provider that is installed directly.

## Mandatory GTM Audit

GTM is fail-closed. A configured container does not load until **Settings -> Analytics -> GTM consent audit completed** is checked and both the published container version and audit date are saved.

For every published container version:

1. Inventory every tag, template, trigger, variable and destination.
2. Assign required consent (`analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization`) to every optional tag.
3. Remove Custom HTML or custom-template code that sends requests before consent or overrides consent state.
4. Verify Initialization and Consent Initialization triggers do not load optional providers.
5. Test default denied, analytics-only, marketing-only, accept-all, reject-all and withdrawal in Tag Assistant.
6. Publish the audited version, update its version/date in Theme Analytics, then recheck Site Health.

Any later GTM publish invalidates the recorded evidence operationally. Update the admin fields only after repeating the audit; the boilerplate cannot inspect a remote container's unpublished or changed internals automatically.

## Event API

All theme code uses the stable runtime API:

```js
window.themeAnalytics.track('generate_lead', {
  form_name: 'Contact',
});
```

Event names must use lowercase letters, digits, and underscores. The runtime removes common PII keys such as email, phone, address, user, and customer identifiers. Do not attempt to bypass this sanitization.

Do not call `gtag`, `fbq`, or `dataLayer.push` directly from feature components. Add a provider adapter or use GTM when a destination needs custom behavior.

In direct mode, the Facebook / Meta Pixel adapter sends `PageView` on activation and maps the shared Event API as follows:

| Event API | Facebook / Meta Pixel |
|---|---|
| `view_search_results` | `Search` |
| `view_item` | `ViewContent` |
| `add_to_cart` | `AddToCart` |
| `add_to_wishlist` | `AddToWishlist` |
| `begin_checkout` | `InitiateCheckout` |
| `add_payment_info` | `AddPaymentInfo` |
| `purchase` | `Purchase` |
| `generate_lead` | `Lead` |
| `sign_up` | `CompleteRegistration` |

## Provider Extension

Provider adapters live in `frontend/src/js/analytics/providers.js`. A provider must expose:

- a stable `id`;
- `isAllowed(categories)`;
- `setConsent(categories)`;
- `activate(categories)`;
- `track(name, params, categories)`.

Activation must be idempotent. A provider must return `false` when it does not send or queue an event.

## Production Verification

1. Confirm the provider is disabled for administrators and non-selected environments.
2. Clear cookies and storage, then confirm there are no GTM, Google, Meta, or analytics requests before a choice.
3. Test analytics-only, marketing-only, accept-all, reject-all, and consent revocation.
4. Verify GTM consent state and triggers with Tag Assistant Preview.
5. Verify GA4 events in DebugView and Facebook / Meta events with Meta Pixel Helper.
6. Confirm page views and custom events are not duplicated.
7. Review GTM container tags, triggers, variables, templates, and destination access before publishing.
8. Run `npm run test:consent` and `npm run test:e2e` from `frontend/`.

Advanced Consent Mode, server-side GTM, Enhanced Conversions, Conversion API, and automatic PII hashing are outside the boilerplate baseline and require a project-specific privacy and security review.
