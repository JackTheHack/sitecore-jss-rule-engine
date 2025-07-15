# Using `@jss-rule-engine/nextjs` in a Next.js App

## Overview

The `@jss-rule-engine/nextjs` package provides advanced personalization and rule-based rendering utilities for Sitecore JSS Next.js applications. It enables:
- Personalized placeholders for dynamic component rendering.
- Plugins for path extraction, sitemap generation, and page props personalization.
- Integration with Sitecore personalization and rule engine features.

---

## 1. Personalized Placeholders

**File:** `src/Layout.tsx`

The `PersonalizedPlaceholder` component is used to render dynamic, personalized content in your app layout.

**Example:**
```tsx
import { PersonalizedPlaceholder } from '@jss-rule-engine/nextjs';

<PersonalizedPlaceholder
  name="headless-main"
  rendering={route}
  endpointUrl={config.edgeQLEndpoint}
  ruleEngine={ruleEngineInstance}
  sitecoreApiKey={config.sitecoreApiKey}
  componentFactory={componentBuilder.getComponentFactory({ isEditing })}
  suppressHydrationWarning
/>
```
- **Purpose:** Renders a placeholder that supports personalization and rule-based rendering.

---

## 2. Path Extraction Personalization

**File:** `src/lib/extract-path/plugins/scpersonalize.ts`

The `ScPersonalizePlugin` is used to process and personalize URL paths.

**Example:**
```ts
import { ScPersonalizePlugin } from '@jss-rule-engine/nextjs';

const plugin = new ScPersonalizePlugin();
plugin.exec(path);
```
- **Purpose:** Removes or rewrites personalization segments from paths.

---

## 3. Sitemap Personalization

**File:** `src/lib/sitemap-fetcher/plugins/graphql-sitemap-service.ts`

The `MultisitePersonalizeGraphQLSitemapService` is used to fetch personalized sitemaps for multiple sites.

**Example:**
```ts
import { MultisitePersonalizeGraphQLSitemapService } from '@jss-rule-engine/nextjs';

const service = new MultisitePersonalizeGraphQLSitemapService({
  endpoint: config.graphQLEndpoint,
  apiKey: config.sitecoreApiKey,
  sites: [...new Set(siteResolver.sites.map(site => site.name))],
});
service.fetchSSGSitemap(locales);
```
- **Purpose:** Fetches sitemaps that support personalization for static site generation or export.

---

## 4. Page Props Personalization Plugins

**Files:**  
- `src/lib/page-props-factory/plugins/scRuleResolvePersonalization.ts`
- `src/lib/page-props-factory/plugins/scRulePersonalization.ts`

These plugins use `ResolvePersonalizationPathPlugin`, `RulesSSGPersonalizationPlugin`, and `RulesSSRPersonalizationPlugin` to resolve and apply personalization to page props during SSG/SSR.

**Example:**
```ts
import { ResolvePersonalizationPathPlugin, RulesSSGPersonalizationPlugin, RulesSSRPersonalizationPlugin } from '@jss-rule-engine/nextjs';

const resolvePlugin = new ResolvePersonalizationPathPlugin();
await resolvePlugin.exec(props, context);

const ssgPlugin = new RulesSSGPersonalizationPlugin(endpoint, apiKey, ruleEngine);
const ssrPlugin = new RulesSSRPersonalizationPlugin(endpoint, apiKey, ruleEngine);

if (isServerSidePropsContext(context)) {
  await ssrPlugin.exec(props, context);
} else {
  await ssgPlugin.exec(props, context);
}
```
- **Purpose:** Applies rule-based and Sitecore personalization to page props for both static and server-side rendering.

---

## Summary

- **PersonalizedPlaceholder:** Use in your layout to enable dynamic, rule-based rendering of components.
- **Plugins:** Use provided plugins for path extraction, sitemap fetching, and page props personalization to integrate Sitecore personalization and rules into your Next.js app.
- **Integration:** These utilities are typically used in custom plugins, API routes, and layout components to provide a personalized, dynamic user experience. 