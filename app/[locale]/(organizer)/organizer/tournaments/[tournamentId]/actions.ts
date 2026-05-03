"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";
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

    const locale = await getLocale();
    revalidatePath(`/organizer/tournaments/${tournamentId}`);
    redirect(`/${locale}/organizer/tournaments/${tournamentId}`);
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
  const description = formData.get("description") as string;
  const status = formData.get("status") as string;

  if (!name) return { error: "Name is required" };

  const { error } = await supabase
    .from("tournaments")
    .update({ name, description, status })
    .eq("id", tournamentId);

  if (error) return { error: error.message };

  const locale = await getLocale();
  revalidatePath("/organizer/tournaments");
  revalidatePath(`/organizer/tournaments/${tournamentId}`);
  redirect(`/${locale}/organizer/tournaments/${tournamentId}`);
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

  const locale = await getLocale();
  revalidatePath("/organizer/tournaments");
  redirect(`/${locale}/organizer/tournaments`);
}
