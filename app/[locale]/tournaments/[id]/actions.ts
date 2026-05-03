"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function joinTournament(tournamentId: string, teamName?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to join a tournament" };
  }

  // 1. Check tournament settings and current capacity
  const { data: tournament, error: tError } = await supabase
    .from("tournaments")
    .select("status, registration_mode, size, participant_type")
    .eq("id", tournamentId)
    .single();

  if (tError || !tournament) return { error: "Tournament not found" };

  if (tournament.status !== "registration_open") {
    return { error: "Registration is not open for this tournament" };
  }

  // 2. Check current participant count (approved only)
  const { count } = await supabase
    .from("participants")
    .select("id", { count: "exact", head: true })
    .eq("tournament_id", tournamentId)
    .eq("status", "approved");

  if (count !== null && count >= tournament.size) {
    return { error: "Tournament is already full" };
  }

  // 3. Check if already registered
  const { data: existingReg } = await supabase
    .from("registrations")
    .select("id, status")
    .eq("tournament_id", tournamentId)
    .eq("user_id", user.id)
    .single();

  if (existingReg) {
    return { error: "You are already registered for this tournament" };
  }

  const isAuto = tournament.registration_mode === "auto";
  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", user.id)
    .single();

  // 4. Create participant record first (pending or approved)
  const participantName =
    tournament.participant_type === "team" && teamName
      ? teamName
      : profile?.nickname || user.email?.split("@")[0] || "Unknown Player";

  const { data: participant, error: partError } = await supabase
    .from("participants")
    .insert({
      tournament_id: tournamentId,
      user_id: user.id,
      name: participantName,
      main_contact_email: user.email,
      status: isAuto ? "approved" : "pending",
      type: tournament.participant_type,
    })
    .select()
    .single();

  if (partError) {
    console.error("Participant creation error:", partError);
    return { error: "Failed to complete registration due to system error." };
  }

  // 5. Insert registration record linked to participant
  const { error: regError } = await supabase.from("registrations").insert({
    tournament_id: tournamentId,
    user_id: user.id,
    participant_id: participant.id,
    status: isAuto ? "approved" : "pending",
  });

  if (regError) {
    console.error("Registration error:", regError);
    // Cleanup participant if registration fails
    await supabase.from("participants").delete().eq("id", participant.id);
    return { error: regError.message };
  }

  // 6. Revalidate ALL relevant paths
  revalidatePath(`/tournaments/${tournamentId}`);
  revalidatePath(`/organizer/tournaments/${tournamentId}/participants`);
  revalidatePath("/player/dashboard");

  return { success: true };
}

export async function leaveTournament(tournamentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to leave a tournament" };
  }

  // 1. Get tournament settings and user registration
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("registration_mode")
    .eq("id", tournamentId)
    .single();

  const { data: registration, error: regError } = await supabase
    .from("registrations")
    .select("id, status, message")
    .eq("tournament_id", tournamentId)
    .eq("user_id", user.id)
    .single();

  if (regError || !registration) {
    return { error: "Registration not found" };
  }

  // 2. Logic for leaving
  const isAuto = tournament?.registration_mode === "auto";

  if (isAuto || registration.status === "pending") {
    // Direct Leave: Delete participant (if exists) and registration
    await supabase
      .from("participants")
      .delete()
      .eq("tournament_id", tournamentId)
      .eq("user_id", user.id);
    const { error: delError } = await supabase
      .from("registrations")
      .delete()
      .eq("id", registration.id);

    if (delError) {
      console.error("Delete Registration Error:", delError);
      return {
        error:
          "Failed to leave tournament. Make sure the RLS policies are applied in Supabase.",
      };
    }
  } else {
    // Request Leave: Organizer has already approved in manual mode
    const { error: upError } = await supabase
      .from("registrations")
      .update({ message: "leave_request" })
      .eq("id", registration.id);

    if (upError) {
      console.error("Update Registration Error:", upError);
      return {
        error:
          "Failed to request leave. Make sure the RLS policies are applied in Supabase.",
      };
    }
  }

  revalidatePath(`/tournaments/${tournamentId}`);
  revalidatePath(`/organizer/tournaments/${tournamentId}/participants`);
  return { success: true };
}
