import { type NextRequest, type NextFetchEvent, NextResponse } from 'next/server';
import middleware from 'lib/middleware';

// eslint-disable-next-line
export default async function (req: NextRequest, ev: NextFetchEvent) {
  try{
    return middleware(req, ev);
    }catch(e){
      console.log('Something went wrong - ', e);
      const response = NextResponse.next();
      return response;
    }
}

export const config = {
  /*
   * Match all paths except for:
   * 1. /api routes
   * 2. /_next (Next.js internals)
   * 3. /sitecore/api (Sitecore API routes)
   * 4. /- (Sitecore media)
   * 5. /healthz (Health check)
   * 6. /feaas-render (FEaaS render)
   * 7. all root files inside /public
   */
  matcher: [
    '/',
    '/((?!api/|_next/|feaas-render|healthz|sitecore/api/|-/|favicon.ico|sc_logo.svg).*)',
  ],
  runtime: "experimental-edge",
  unstable_allowDynamic: [
    './../../../node_modules/lodash.unescape/index.js',
    '**/lodash.unescape/index.js',
    '**/lodash.unescape/**',
  ],
};
