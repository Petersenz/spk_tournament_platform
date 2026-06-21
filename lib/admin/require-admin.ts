import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface AdminProfile {
  role: string | null;
}

export async function requireAdmin(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const adminProfile = profile as AdminProfile | null;

  if (adminProfile?.role !== "admin") {
    redirect("/player/dashboard");
  }

  return user.id;
}
