"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";

export async function createTournament(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const project_id = formData.get("project_id") as string;
  const name = formData.get("name") as string;
  const game_id = formData.get("game_id") as string;
  const size = parseInt(formData.get("size") as string);
  const participant_type = formData.get("participant_type") as
    | "team"
    | "player";
  const match_type = formData.get("match_type") as "duel" | "ffa";

  const description = formData.get("description") as string;
  const rules = formData.get("rules") as string;
  const prize_info = formData.get("prize_info") as string;
  const banner_file = formData.get("banner_file") as File;
  const start_date = formData.get("start_date") as string;
  const end_date = formData.get("end_date") as string;
  const registration_enabled = formData.get("registration_enabled") === "true";
  const registration_mode = formData.get("registration_mode") as
    | "auto"
    | "manual";
  const registration_deadline = formData.get("registration_deadline") as string;
  const team_min_players =
    parseInt(formData.get("team_min_players") as string) || 1;
  const team_max_players =
    parseInt(formData.get("team_max_players") as string) || 5;
  const status = formData.get("status") as string;
  const platformIds = formData.getAll("platforms") as string[];

  if (!name || !size) {
    return { error: "Name and size are required" };
  }

  let banner_url = "";

  // Handle Banner Upload
  if (banner_file && banner_file.size > 0) {
    const fileExt = banner_file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("banners")
      .upload(fileName, banner_file);

    if (uploadError) {
      return { error: `Banner upload failed: ${uploadError.message}` };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("banners").getPublicUrl(fileName);

    banner_url = publicUrl;
  }

  // Insert tournament
  const { data: tournament, error } = await supabase
    .from("tournaments")
    .insert([
      {
        project_id,
        created_by: user.id,
        name,
        game_id: game_id === "none" || !game_id ? null : game_id,
        size,
        participant_type,
        match_type,
        status: status || "draft",
        description,
        rules,
        prize_info,
        banner_url: banner_url || null,
        start_date: start_date || null,
        end_date: end_date || null,
        registration_enabled,
        registration_mode,
        registration_deadline: registration_deadline || null,
        team_min_players,
        team_max_players,
      },
    ])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Insert platforms
  if (platformIds.length > 0) {
    const platformInserts = platformIds.map((pid) => ({
      tournament_id: tournament.id,
      platform_id: pid,
    }));
    await supabase.from("tournament_platforms").insert(platformInserts);
  }

  const locale = await getLocale();
  revalidatePath(`/organizer/projects/${project_id}`);
  revalidatePath("/organizer/tournaments");

  redirect(`/${locale}/organizer/tournaments/${tournament.id}`);
}
