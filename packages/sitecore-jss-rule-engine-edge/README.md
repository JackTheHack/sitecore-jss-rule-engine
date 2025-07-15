# Using `@jss-rule-engine/edge` in a Next.js App

## Overview

The `@jss-rule-engine/edge` package provides middleware and utilities for enabling Sitecore Experience Edge personalization in Next.js applications. It is primarily used to:
- Personalize pages at the edge using Next.js Middleware.
- Integrate with Sitecore Experience Edge and CDP for dynamic page variants.
- Support advanced routing and personalization scenarios.

---

## 1. Edge Middleware Personalization

**File:** `src/lib/middleware/plugins/scpersonalize.ts`

The `ScPersonalizeMiddleware` is used in a custom Next.js middleware plugin to enable Sitecore personalization at the edge.

**Example:**
```ts
import { ScPersonalizeMiddleware } from '@jss-rule-engine/edge';

class ScPersonalizePlugin implements MiddlewarePlugin {
  private personalizeMiddleware?: ScPersonalizeMiddleware;
  order = 1;

  async exec(req: NextRequest, res?: NextResponse): Promise<NextResponse> {
    this.personalizeMiddleware = new ScPersonalizeMiddleware({
      edgeConfig: {
        endpoint: config.graphQLEndpoint,
        apiKey: config.sitecoreApiKey,
        timeout: 2000,
        scope: process.env.NEXT_PUBLIC_PERSONALIZE_SCOPE,
      },
      disabled: () => false,
      excludeRoute: () => false,
      siteResolver,
    });
    return this.personalizeMiddleware.getHandler()(req, res);
  }
}
```
- **Purpose:**  
  - Calls Sitecore Experience Edge to get personalization info for the page.
  - Calls Sitecore CDP to determine the correct page variant for the user.
  - Rewrites the response to serve the personalized variant.

---

## 2. Configuration

- **Edge Config:**  
  - `endpoint`: Sitecore Experience Edge GraphQL endpoint.
  - `apiKey`: Sitecore API key.
  - `timeout`: (optional) Timeout for Edge requests.
  - `scope`: (optional) Personalization scope.

- **CDP Integration:**  
  - The middleware can be configured to enable/disable personalization and exclude certain routes for performance or privacy reasons.

- **Site Resolver:**  
  - Used to resolve the current site and language for personalization.

---

## 3. Usage Notes

- Place the middleware plugin in your Next.js middleware pipeline to enable edge personalization.
- You may want to customize the `disabled` and `excludeRoute` functions to fit your privacy, consent, or performance requirements.
- The middleware runs on every request, so be mindful of performance and only enable for routes that require personalization.

---

## Summary

- **ScPersonalizeMiddleware:** Use in Next.js middleware to enable Sitecore Experience Edge personalization.
- **Configuration:** Set up with your Sitecore endpoints, API keys, and any custom logic for enabling/disabling or excluding routes.
- **Integration:** Allows dynamic, personalized page variants to be served at the edge, improving user experience and performance. 