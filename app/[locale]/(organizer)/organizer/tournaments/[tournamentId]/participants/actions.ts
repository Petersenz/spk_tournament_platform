"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

interface ActionResult {
  success?: boolean;
  error?: string;
}

export async function approveRegistration(formData: FormData) {
  const supabase = await createClient();
  const registrationId = formData.get("registration_id") as string;
  const tournamentId = formData.get("tournament_id") as string;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized: No session" };
  }

  // 1. Get registration & profile
  const { data: registration, error: fetchError } = await supabase
    .from("registrations")
    .select("*, profiles:user_id(nickname)")
    .eq("id", registrationId)
    .single();

  if (fetchError || !registration) {
    return { error: `Registration not found: ${fetchError?.message}` };
  }

  // 2. Authorization check
  const { data: tournament, error: tError } = await supabase
    .from("tournaments")
    .select("*, projects(owner_id)")
    .eq("id", tournamentId)
    .single();

  if (tError || !tournament) {
    return { error: `Tournament not found: ${tError?.message}` };
  }

  const isOwner = tournament.projects?.owner_id === user.id;

  if (!isOwner) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") {
      return { error: "Unauthorized: Not owner or admin" };
    }
  }

  const profile = Array.isArray(registration.profiles)
    ? registration.profiles[0]
    : registration.profiles;
  const displayName =
    profile?.nickname || `Player #${registration.user_id.slice(0, 5)}`;

  // 3. Update status
  const { error: updateRegError } = await supabase
    .from("registrations")
    .update({ status: "approved" })
    .eq("id", registrationId);

  if (updateRegError) {
    return { error: `DB Update Error: ${updateRegError.message}` };
  }

  // 4. Update existing participant or create if missing
  if (registration.participant_id) {
    const { error: partError } = await supabase
      .from("participants")
      .update({ status: "approved" })
      .eq("id", registration.participant_id);

    if (partError) {
      return { error: `DB Participant Update Error: ${partError.message}` };
    }
  } else {
    const { error: participantError } = await supabase
      .from("participants")
      .insert({
        tournament_id: tournamentId,
        user_id: registration.user_id,
        name: displayName,
        type: tournament.participant_type,
        status: "approved",
      });

    if (participantError) {
      return { error: `DB Insert Error: ${participantError.message}` };
    }
  }

  revalidatePath(`/organizer/tournaments/${tournamentId}/participants`);
  return { success: true };
}

export async function rejectRegistration(formData: FormData) {
  const supabase = await createClient();
  const registrationId = formData.get("registration_id") as string;

  const { error } = await supabase
    .from("registrations")
    .update({ status: "rejected" })
    .eq("id", registrationId);

  if (error) return { error: error.message };

  revalidatePath("/");
  return { success: true };
}

export async function deleteParticipant(formData: FormData) {
  const supabase = await createClient();
  const participantId = formData.get("participant_id") as string;
  const tournamentId = formData.get("tournament_id") as string;

  const { data: participant } = await supabase
    .from("participants")
    .select("user_id")
    .eq("id", participantId)
    .single();

  const { error } = await supabase
    .from("participants")
    .delete()
    .eq("id", participantId);

  if (error) return { error: error.message };

  if (participant?.user_id) {
    await supabase
      .from("registrations")
      .delete()
      .eq("tournament_id", tournamentId)
      .eq("user_id", participant.user_id);
  }

  revalidatePath(`/organizer/tournaments/${tournamentId}/participants`);
  return { success: true };
}

export async function addManualParticipant(formData: FormData) {
  const supabase = await createClient();
  const tournamentId = formData.get("tournament_id") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const type = (formData.get("type") as "player" | "team") || "player";

  const { error } = await supabase.from("participants").insert({
    tournament_id: tournamentId,
    name,
    main_contact_email: email,
    type,
    status: "approved",
  });

  if (error) return { error: error.message };

  revalidatePath(`/organizer/tournaments/${tournamentId}/participants`);
  return { success: true };
}

export async function updateParticipantFull(
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const tournamentId = formData.get("tournament_id") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const status = formData.get("status") as string;
  const seed = parseInt(formData.get("seed") as string);
  const team_identifier = formData.get("team_identifier") as string;
  const logo_url = formData.get("logo_url") as string;
  const type = formData.get("type") as "player" | "team";

  const { error } = await supabase
    .from("participants")
    .update({
      name,
      main_contact_email: email,
      status,
      seed: isNaN(seed) ? null : seed,
      team_identifier,
      logo_url,
      type,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/organizer/tournaments/${tournamentId}/participants`);
  return { success: true };
}

export async function savePlayer(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const participantId = formData.get("participant_id") as string;
  const tournamentId = formData.get("tournament_id") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const custom_user_identifier = formData.get(
    "custom_user_identifier",
  ) as string;
  const image_url = formData.get("image_url") as string;
  const is_captain = formData.get("is_captain") === "true";
  const position = parseInt(formData.get("position") as string);

  if (id) {
    const { error } = await supabase
      .from("players")
      .update({
        name,
        email,
        custom_user_identifier,
        image_url,
        is_captain,
        position: isNaN(position) ? null : position,
      })
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("players").insert({
      participant_id: participantId,
      name,
      email,
      custom_user_identifier,
      image_url,
      is_captain,
      position: isNaN(position) ? null : position,
    });
    if (error) return { error: error.message };
  }

  revalidatePath(`/organizer/tournaments/${tournamentId}/participants`);
  return { success: true };
}

export async function deletePlayer(
  playerId: string,
  tournamentId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("players").delete().eq("id", playerId);
  if (error) return { error: error.message };
  revalidatePath(`/organizer/tournaments/${tournamentId}/participants`);
  return { success: true };
}

export async function randomizeSeeds(formData: FormData) {
  const supabase = await createClient();
  const tournamentId = formData.get("tournament_id") as string;

  const { data: participants } = await supabase
    .from("participants")
    .select("id")
    .eq("tournament_id", tournamentId)
    .eq("status", "approved");

  if (!participants) return { error: "No participants found" };

  const shuffled = [...participants].sort(() => Math.random() - 0.5);

  const updates = shuffled.map((p, index) =>
    supabase
      .from("participants")
      .update({ seed: index + 1 })
      .eq("id", p.id),
  );

  await Promise.all(updates);

  revalidatePath(`/organizer/tournaments/${tournamentId}/participants`);
  return { success: true };
}

export async function deleteMultipleParticipants(formData: FormData) {
  const supabase = await createClient();
  const participantIds = JSON.parse(
    formData.get("participant_ids") as string,
  ) as string[];
  const tournamentId = formData.get("tournament_id") as string;

  if (!participantIds.length) return { error: "No participants selected" };

  const { data: participants } = await supabase
    .from("participants")
    .select("user_id")
    .in("id", participantIds);

  const userIds = participants
    ?.map((p) => p.user_id)
    .filter(Boolean) as string[];

  const { error: deleteError } = await supabase
    .from("participants")
    .delete()
    .in("id", participantIds);

  if (deleteError) return { error: deleteError.message };

  if (userIds.length) {
    await supabase
      .from("registrations")
      .delete()
      .eq("tournament_id", tournamentId)
      .in("user_id", userIds);
  }

  revalidatePath(`/organizer/tournaments/${tournamentId}/participants`);
  return { success: true };
}
