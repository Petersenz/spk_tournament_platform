import { type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./lib/i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // First, handle locales
  const response = intlMiddleware(request);

  // If next-intl is redirecting (e.g. / -> /en), return immediately
  if (response.status === 307 || response.status === 308) {
    return response;
  }

  // Then, handle Supabase session
  return await updateSession(request, response);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
