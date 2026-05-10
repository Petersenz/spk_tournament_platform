"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface ActionResult {
  success?: boolean;
  error?: string;
}

export async function saveTournamentSetup(
  formData: FormData,
): Promise<ActionResult | void> {
  const supabase = await createClient();
  const tournament_id = formData.get("tournament_id") as string;
  const stage_name = formData.get("stage_name") as string;
  const stage_type = formData.get("stage_type") as string;
  const participant_type = formData.get("participant_type") as string;
  const team_min_players =
    parseInt(formData.get("team_min_players") as string) || 1;
  const team_max_players =
    parseInt(formData.get("team_max_players") as string) || 5;

  try {
    // 1. Update Tournament Basic Settings
    const { error: tournamentError } = await supabase
      .from("tournaments")
      .update({
        participant_type: participant_type as "player" | "team",
        team_min_players,
        team_max_players,
      })
      .eq("id", tournament_id);

    if (tournamentError) {
      console.error("Error saving tournament settings:", tournamentError);
      return { error: tournamentError.message };
    }

    // 2. Manage Stage
    const { data: existingStages } = await supabase
      .from("stages")
      .select("id")
      .eq("tournament_id", tournament_id)
      .limit(1);

    let error;
    if (existingStages?.length) {
      const { error: updateError } = await supabase
        .from("stages")
        .update({
          name: stage_name,
          stage_type: stage_type as
            | "single_elimination"
            | "double_elimination"
            | "round_robin",
        })
        .eq("id", existingStages[0].id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from("stages").insert({
        tournament_id,
        name: stage_name,
        stage_type: stage_type as
          | "single_elimination"
          | "double_elimination"
          | "round_robin",
        order_index: 1,
      });
      error = insertError;
    }

    if (error) {
      console.error("Error saving stage:", error);
      return { error: error.message };
    }

    revalidatePath(`/organizer/tournaments/${tournament_id}/setup`);
    redirect(`/organizer/tournaments/${tournament_id}/setup?step=2`);
  } catch (e: unknown) {
    const error = e as Error;
    if (error.message === "NEXT_REDIRECT") throw e;
    return { error: error.message || "An unexpected error occurred" };
  }
}

export async function saveRegistrationSettings(
  formData: FormData,
): Promise<ActionResult | void> {
  const supabase = await createClient();
  const tournament_id = formData.get("tournament_id") as string;
  const registration_enabled = formData.get("registration_enabled") === "on";
  const registration_mode =
    (formData.get("registration_mode") as string) || "auto";
  const registration_deadline = formData.get("registration_deadline") as string;

  try {
    const { error } = await supabase
      .from("tournaments")
      .update({
        registration_enabled,
        registration_mode: registration_mode as "auto" | "manual",
        registration_deadline: registration_deadline || null,
        status: registration_enabled ? "registration_open" : "draft",
      })
      .eq("id", tournament_id);

    if (error) {
      console.error("Error saving registration:", error);
      return { error: error.message };
    }

    revalidatePath(`/organizer/tournaments/${tournament_id}/setup`);
    redirect(`/organizer/tournaments/${tournament_id}/setup?step=3`);
  } catch (e: unknown) {
    const error = e as Error;
    if (error.message === "NEXT_REDIRECT") throw e;
    return { error: error.message || "An unexpected error occurred" };
  }
}

export async function publishTournament(
  formData: FormData,
): Promise<ActionResult | void> {
  const supabase = await createClient();
  const tournament_id = formData.get("tournament_id") as string;

  try {
    // Double check if stage exists before publishing
    const { data: stages } = await supabase
      .from("stages")
      .select("id")
      .eq("tournament_id", tournament_id);

    if (!stages || stages.length === 0) {
      // Create a default stage if somehow missing
      await supabase.from("stages").insert({
        tournament_id,
        name: "Main Event",
        stage_type: "single_elimination",
        order_index: 1,
      });
    }

    const { error } = await supabase
      .from("tournaments")
      .update({ status: "registration_open" })
      .eq("id", tournament_id);

    if (error) {
      console.error("Error publishing tournament:", error);
      return { error: error.message };
    }

    revalidatePath(`/organizer/tournaments/${tournament_id}`);
    redirect(`/organizer/tournaments/${tournament_id}`);
  } catch (e: unknown) {
    const error = e as Error;
    if (error.message === "NEXT_REDIRECT") throw e;
    return { error: error.message || "An unexpected error occurred" };
  }
}
