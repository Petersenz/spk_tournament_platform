"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";

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
    // Fallback if participant_id was somehow not linked (should not happen with new logic)
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

  revalidatePath("/"); // Trigger global revalidate
  return { success: true };
}

export async function deleteParticipant(formData: FormData) {
  const supabase = await createClient();
  const participantId = formData.get("participant_id") as string;
  const tournamentId = formData.get("tournament_id") as string;

  // First get the user_id from the participant to delete their registration too
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

  // Delete the associated registration if user_id exists
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

  const { error } = await supabase.from("participants").insert({
    tournament_id: tournamentId,
    name,
    main_contact_email: email,
    type: "player", // Default for MVP
    status: "approved",
  });

  if (error) return { error: error.message };

  const locale = await getLocale();
  revalidatePath(`/organizer/tournaments/${tournamentId}/participants`);
  redirect(`/${locale}/organizer/tournaments/${tournamentId}/participants`);
}

export async function updateSeed(formData: FormData) {
  const supabase = await createClient();
  const participantId = formData.get("participant_id") as string;
  const tournamentId = formData.get("tournament_id") as string;
  const seed = parseInt(formData.get("seed") as string);

  const { error } = await supabase
    .from("participants")
    .update({ seed: isNaN(seed) ? null : seed })
    .eq("id", participantId);

  if (error) return { error: error.message };

  revalidatePath(`/organizer/tournaments/${tournamentId}/participants`);
  return { success: true };
}

export async function randomizeSeeds(formData: FormData) {
  const supabase = await createClient();
  const tournamentId = formData.get("tournament_id") as string;

  // 1. Fetch all confirmed participants
  const { data: participants } = await supabase
    .from("participants")
    .select("id")
    .eq("tournament_id", tournamentId)
    .eq("status", "approved");

  if (!participants) return { error: "No participants found" };

  // 2. Shuffle them
  const shuffled = [...participants].sort(() => Math.random() - 0.5);

  // 3. Update each one with a new seed
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
