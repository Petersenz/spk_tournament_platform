"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateSingleElimination } from "@/lib/bracket-engine/single-elimination";
import { generateRoundRobin } from "@/lib/bracket-engine/round-robin";

interface ActionResult {
  success?: boolean;
  error?: string;
}

export async function generateBracket(
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const tournamentId = formData.get("tournament_id") as string;
  const stageId = formData.get("stage_id") as string;

  try {
    // 1. Fetch participants
    const { data: participants } = await supabase
      .from("participants")
      .select("*")
      .eq("tournament_id", tournamentId)
      .eq("status", "approved");

    if (!participants || participants.length < 2) {
      return {
        error: "Need at least 2 approved participants to generate a bracket",
      };
    }

    // 2. Fetch stage info
    const { data: stage } = await supabase
      .from("stages")
      .select("*")
      .eq("id", stageId)
      .single();

    if (!stage) return { error: "Tournament stage not found" };

    // 3. Generate matches
    if (stage.stage_type === "single_elimination") {
      await generateSingleElimination(stageId, participants);
    } else if (stage.stage_type === "round_robin") {
      await generateRoundRobin(stageId, participants);
    } else {
      return {
        error: `Format ${stage.stage_type} is not yet supported for auto-generation`,
      };
    }

    // 6. Update tournament status
    await supabase
      .from("tournaments")
      .update({ status: "in_progress" })
      .eq("id", tournamentId);

    revalidatePath(`/organizer/tournaments/${tournamentId}`);
    redirect(`/organizer/tournaments/${tournamentId}`);
  } catch (e: unknown) {
    const error = e as Error;
    if (error.message === "NEXT_REDIRECT") throw e;
    return { error: error.message || "An unexpected error occurred" };
  }
}

export async function updateTournament(
  tournamentId: string,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const name = formData.get("name") as string;
  const game_id = formData.get("game_id") as string;
  const size = parseInt(formData.get("size") as string);
  const participant_type = formData.get("participant_type") as
    | "team"
    | "player";
  const match_type = formData.get("match_type") as "duel" | "ffa";
  const status = formData.get("status") as string;

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

  const platformIds = formData.getAll("platforms") as string[];

  if (!name) return { error: "Name is required" };

  const updateData: Record<string, unknown> = {
    name,
    game_id: game_id === "none" || !game_id ? null : game_id,
    size,
    participant_type,
    match_type,
    status,
    description,
    rules,
    prize_info,
    start_date: start_date || null,
    end_date: end_date || null,
    registration_enabled,
    registration_mode,
    registration_deadline: registration_deadline || null,
    team_min_players,
    team_max_players,
  };

  // Handle Banner Upload if new file exists
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

    updateData.banner_url = publicUrl;
  }

  const { error } = await supabase
    .from("tournaments")
    .update(updateData)
    .eq("id", tournamentId);

  if (error) return { error: error.message };

  // Sync platforms (delete old, insert new)
  await supabase
    .from("tournament_platforms")
    .delete()
    .eq("tournament_id", tournamentId);
  if (platformIds.length > 0) {
    const platformInserts = platformIds.map((pid) => ({
      tournament_id: tournamentId,
      platform_id: pid,
    }));
    await supabase.from("tournament_platforms").insert(platformInserts);
  }

  revalidatePath("/organizer/tournaments");
  revalidatePath(`/organizer/tournaments/${tournamentId}`);
  redirect(`/organizer/tournaments/${tournamentId}`);
}

export async function deleteTournament(
  tournamentId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("tournaments")
    .delete()
    .eq("id", tournamentId);

  if (error) return { error: error.message };

  revalidatePath("/organizer/tournaments");
  redirect("/organizer/tournaments");
}
