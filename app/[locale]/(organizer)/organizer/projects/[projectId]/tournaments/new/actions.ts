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

  if (!name || !size) {
    return { error: "Name and size are required" };
  }

  if (size < 2 || size > 256) {
    return { error: "Size must be between 2 and 256" };
  }

  const { data, error } = await supabase
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
        status: "draft",
      },
    ])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  const locale = await getLocale();
  revalidatePath(`/organizer/projects/${project_id}`);
  revalidatePath("/organizer/tournaments");
  // Redirect to the newly created tournament settings/wizard
  redirect(`/${locale}/organizer/tournaments/${data.id}/setup`);
}
