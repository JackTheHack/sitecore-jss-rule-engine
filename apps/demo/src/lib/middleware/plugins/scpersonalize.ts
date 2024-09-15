import { NextRequest, NextResponse } from 'next/server';
import { MiddlewarePlugin } from '..';
import config from 'temp/config';
import { siteResolver } from 'lib/site-resolver';
import { ScPersonalizeMiddleware } from '@jss-rule-engine/nextjs/dist/middleware';

/**
 * This is the personalize middleware plugin for Next.js.
 * It is used to enable Sitecore personalization of pages in Next.js.
 *
 * The `PersonalizeMiddleware` will
 *  1. Make a call to the Sitecore Experience Edge to get the personalization information about the page.
 *  2. Based on the response, make a call to the Sitecore CDP (with request/user context) to determine the page variant.
 *  3. Rewrite the response to the specific page variant.
 */
class ScPersonalizePlugin implements MiddlewarePlugin {
  private personalizeMiddleware?: ScPersonalizeMiddleware;

  // Using 1 to leave room for things like redirects to occur first
  order = 1;

  async exec(req: NextRequest, res?: NextResponse): Promise<NextResponse> {

    console.log('Middleware personalize - ', req.url, this.personalizeMiddleware?.constructor.name);

    this.personalizeMiddleware = new ScPersonalizeMiddleware({
      // Configuration for your Sitecore Experience Edge endpoint
      edgeConfig: {
        endpoint: config.graphQLEndpoint,
        apiKey: config.sitecoreApiKey,
        timeout:
          (process.env.PERSONALIZE_MIDDLEWARE_EDGE_TIMEOUT &&
            parseInt(process.env.PERSONALIZE_MIDDLEWARE_EDGE_TIMEOUT as string)) ||
          2000,
        scope: process.env.NEXT_PUBLIC_PERSONALIZE_SCOPE,
      },
      // Configuration for your Sitecore CDP endpoint     
      // This function determines if the middleware should be turned off.
      // IMPORTANT: You should implement based on your cookie consent management solution of choice.
      // You may wish to keep it disabled while in development mode.
      disabled: () => false,
      // This function determines if a route should be excluded from personalization.
      // Certain paths are ignored by default (e.g. files and Next.js API routes), but you may wish to exclude more.
      // This is an important performance consideration since Next.js Edge middleware runs on every request.
      excludeRoute: () => false,
      // Site resolver implementation
      siteResolver,
      // Personalize middleware will use PosResolver.resolve(site, language) (same as CdpPageView) by default to get point of sale.
      // You can also pass a custom point of sale resolver into middleware to override it like so:
      // getPointOfSale: (site, language) => { ... }
    });
    return this.personalizeMiddleware.getHandler()(req, res);
  }
}

export const scpersonalizePlugin = new ScPersonalizePlugin();
