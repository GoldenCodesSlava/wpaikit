# Cookie Consent Module

The theme includes a consent manager for an EU/Moldova opt-in baseline. Its legal baseline was reviewed for August 2026, but every production project still requires a service inventory and legal review.

## Runtime Contract

- `necessary` is always enabled.
- `preferences`, `analytics`, `marketing`, and `external_media` start disabled.
- Optional scripts and iframes must not make a network request before consent.
- Consent is versioned and expires after the configured period.
- When receipt logging is enabled, each choice or withdrawal is appended to an anonymous event log without IP addresses or User-Agent values and is removed after the configured retention period.
- Visitors can reopen settings using the persistent control rendered by the theme.
- The first-visit banner uses a visual page overlay. It must disappear after a choice and must not intercept page interaction; the preferences dialog owns its modal backdrop.
- The preferences dialog always offers equally visible Reject all, Save selection, and Accept all actions.
- RU, RO, and EN defaults live in `CookieConsentDefaults.php`; blank admin values fall back to them.
- WPML selects the active frontend and admin content language when available. Cookie copy is edited only under **Settings → Cookies Banner**, not WPML String Translation.
- The settings page renders one language tab at a time. Use the WPML language switcher in the admin toolbar to edit RU, RO, or EN; existing `cookie_{language}_*` option keys remain isolated and backward compatible.
- **Restore standard texts** removes only text overrides for the current language. It does not reset the policy URL, processing countries, global settings, or another language.
- Custom edits are never machine-translated automatically. The boilerplate provides reviewed built-in defaults; project-specific legal copy must be translated and reviewed explicitly.

## Registering A Service

Register every optional service through the typed registry action. The legacy `theme_cookie_consent_services` filter remains compatible, but new project code must use `theme_cookie_consent_register_services`. Do not enqueue a tracking script without adding its handle to a service.

```php
use Boilerplate\Theme\Config\CookieConsentServiceRegistry;

add_action(
    'theme_cookie_consent_register_services',
    static function (CookieConsentServiceRegistry $registry, string $language): void {
        $registry->register([
        'id' => 'project-analytics',
        'category' => 'analytics',
        'name' => 'Project Analytics',
        'provider' => 'Provider name',
        'purpose' => 'Measures anonymous website usage.',
        'duration' => '13 months',
        'cookies' => ['analytics_*'],
        'localStorage' => [],
        'iframes' => [],
        'networkRequests' => ['analytics.provider.example'],
        'handles' => ['project-analytics'],
        'party' => 'third_party',
        'thirdCountryTransfer' => true,
        'transferCountries' => ['United States'],
        'recipientCountries' => ['United States'],
        'transferSafeguards' => 'Provider DPA and applicable Standard Contractual Clauses.',
        'providerPolicyUrl' => 'https://provider.example/privacy',
        ]);
    },
    10,
    2
);
```

The service definition controls disclosure, script deferral, external-source activation, and cleanup of accessible first-party storage. Wildcards are supported for cookie names. Every service must declare its storage/network inventory, `party` (`first_party` or `third_party`), `thirdCountryTransfer`, `recipientCountries`, transfer safeguards when relevant, and the third-party privacy policy. Invalid or duplicate services are omitted and reported under **Tools -> Site Health** and in an admin notice.

Infrastructure shared by more than one optional category may add `categories`, for example `['analytics', 'marketing']`, and an explicit localized `categoryLabel`. Cleanup keeps its storage while any listed category remains allowed. Registered WordPress script handles still require one primary `category` because each individual script must have an unambiguous consent purpose.

Do not attach optional behavior through `wp_add_inline_script()`. WordPress prints attached inline code separately from the external handle, so the registry cannot delay it automatically; the source audit fails when it finds this API. Put the behavior in a registered external handle or a consent-aware provider adapter.

Known tracking domains that appear in an unregistered WordPress script are fail-closed under `marketing`. This is a safety net, not service registration: the project must still disclose the correct purpose and category.

When a visitor rejects or withdraws consent, the browser removes accessible registered cookies/local storage and disables registered external sources. The server also expires visible cookies and invokes cleanup hooks:

```php
add_action('theme_cookie_consent_cleanup_service_project-analytics', static function (
    array $allowedCategories,
    string $consentId,
    string $language
): void {
    // Delete project-owned server state associated with the anonymous consent ID.
}, 10, 3);
```

Use `theme_cookie_consent_cleanup_server` for shared cleanup. JavaScript cannot remove HttpOnly cookies, third-party cookies, or data already sent to a provider; implement provider revocation/deletion APIs when the project requires them and disclose this limitation.

## External Media

Do not put a third-party URL in `src` before consent. Use:

```twig
<iframe
    data-cookie-consent-src="https://external.example/embed/123"
    data-cookie-consent-category="external_media"
    title="External media"
></iframe>
```

## Required Production Check

Before the browser check, switch through every active WPML language and configure Privacy Policy, Cookie Policy, and first-party processing countries. Site Health reports whether each language uses built-in defaults or customized copy and treats missing processing countries as critical in production.

1. Clear browser cookies and storage.
2. Confirm no optional network requests occur before a choice.
3. Reject optional categories and repeat the check.
4. Enable one category at a time and confirm only its services load.
5. Revoke consent and confirm accessible cookies/storage are removed.
6. Verify all services, providers, purposes, names, and durations shown to visitors.
7. Update the policy version after a material service or purpose change.

Run the automated baseline from the theme:

```bash
composer test:cookie-consent
cd frontend
npm run test:consent
npm run test:e2e
```

The PHP source audit rejects known active tracking sources and `wp_add_inline_script()`. Browser tests cover first visit, reject all, one selected category, withdrawal, expiry/configuration change, and absence of a known tracking request before consent. Repeat the manual network audit with every project plugin active because static checks cannot classify unknown providers.

The banner does not make an unknown third-party plugin compliant automatically. Audit plugin output, Tag Manager containers, pixels, embeds, CAPTCHA, chat, maps, and payment integrations on every project.
