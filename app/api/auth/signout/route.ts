import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");

  // Get the origin for the redirect
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;

  // We redirect to /login. Middleware will handle the locale if needed,
  // or we can try to detect it from the referer.
  const referer = request.headers.get("referer");
  let redirectPath = "/login";

  if (referer) {
    const refererUrl = new URL(referer);
    const parts = refererUrl.pathname.split("/");
    if (parts.length > 1 && (parts[1] === "th" || parts[1] === "en")) {
      redirectPath = `/${parts[1]}/login`;
    }
  }

  return NextResponse.redirect(`${origin}${redirectPath}`, {
    status: 302,
  });
}
