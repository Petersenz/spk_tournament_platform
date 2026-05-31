"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function syncGamePlatforms(
  supabase: Awaited<ReturnType<typeof createClient>>,
  gameId: string,
  platformIds: string[],
) {
  const uniquePlatformIds = [...new Set(platformIds.filter(Boolean))];

  const { error: deleteError } = await supabase
    .from("game_platforms")
    .delete()
    .eq("game_id", gameId);

  if (deleteError) {
    return deleteError.message;
  }

  if (uniquePlatformIds.length === 0) {
    return null;
  }

  const { error: insertError } = await supabase.from("game_platforms").insert(
    uniquePlatformIds.map((platformId) => ({
      game_id: gameId,
      platform_id: platformId,
    })),
  );

  return insertError?.message || null;
}

export async function saveGameAction(
  id: string | undefined,
  formData: FormData,
) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const developer = formData.get("developer") as string;
  const release_year = parseInt(formData.get("release_year") as string);
  const is_active = formData.get("is_active") === "true";
  const platformIds = formData.getAll("platforms") as string[];

  // URLs (if manual entry or hidden fields)
  const logo_url = formData.get("logo_url") as string;
  const cover_url = formData.get("cover_url") as string;

  const gameData = {
    name,
    slug,
    description,
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

    const platformError = await syncGamePlatforms(supabase, id, platformIds);
    if (platformError) return { error: platformError };
  } else {
    const { data, error } = await supabase
      .from("games")
      .insert(gameData)
      .select("id")
      .single();
    if (error) return { error: error.message };

    if (data?.id) {
      const platformError = await syncGamePlatforms(
        supabase,
        data.id,
        platformIds,
      );
      if (platformError) return { error: platformError };
    }
  }

  revalidatePath("/admin/games");
  revalidatePath("/en/admin/games");
  revalidatePath("/th/admin/games");
  return { success: true };
}
