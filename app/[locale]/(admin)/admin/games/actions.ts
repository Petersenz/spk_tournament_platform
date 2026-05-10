"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveGameAction(
  id: string | undefined,
  formData: FormData,
) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const developer = formData.get("developer") as string;
  const release_year = parseInt(formData.get("release_year") as string);
  const is_active = formData.get("is_active") === "true";

  // URLs (if manual entry or hidden fields)
  const logo_url = formData.get("logo_url") as string;
  const cover_url = formData.get("cover_url") as string;

  const gameData = {
    name,
    slug,
    description,
    category,
    developer,
    release_year: isNaN(release_year) ? null : release_year,
    is_active,
    logo_url,
    cover_url,
  };

  if (id) {
    const { error } = await supabase
      .from("games")
      .update(gameData)
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("games").insert(gameData);
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/games");
  return { success: true };
}
