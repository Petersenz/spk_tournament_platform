"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { Player, Participant } from "./types";

interface ActionResult {
  success?: boolean;
  error?: string;
}

interface SeedAssignment {
  participantId: string;
  seed: number;
}

function isSeedAssignmentArray(value: unknown): value is SeedAssignment[] {
  if (!Array.isArray(value)) return false;

  return value.every((item) => {
    if (!item || typeof item !== "object") return false;
    const record = item as Record<string, unknown>;
    const seed = record.seed;
    return (
      typeof record.participantId === "string" &&
      typeof seed === "number" &&
      Number.isInteger(seed) &&
      seed > 0
    );
  });
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized: No session" };
  }

  // 1. Load the registration (to find its tournament)
  const { data: registration, error: fetchError } = await supabase
    .from("registrations")
    .select("id, tournament_id")
    .eq("id", registrationId)
    .single();

  if (fetchError || !registration) {
    return { error: `Registration not found: ${fetchError?.message}` };
  }

  // 2. Authorization: tournament owner or admin only
  const { data: tournament, error: tError } = await supabase
    .from("tournaments")
    .select("id, projects(owner_id)")
    .eq("id", registration.tournament_id)
    .single();

  if (tError || !tournament) {
    return { error: `Tournament not found: ${tError?.message}` };
  }

  const project = Array.isArray(tournament.projects)
    ? tournament.projects[0]
    : tournament.projects;
  const isOwner = project?.owner_id === user.id;

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

  // 3. Reject
  const { error } = await supabase
    .from("registrations")
    .update({ status: "rejected" })
    .eq("id", registrationId);

  if (error) return { error: error.message };

  revalidatePath(
    `/organizer/tournaments/${registration.tournament_id}/participants`,
  );
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
  const participant_id = formData.get("participant_id") as string;
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
      participant_id,
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

export async function syncRoster(
  participantId: string,
  tournamentId: string,
  participantData: Partial<Participant>,
  playersData: Partial<Player>[],
): Promise<ActionResult> {
  const supabase = await createClient();

  // 1. Update Participant
  const { error: partError } = await supabase
    .from("participants")
    .update(participantData)
    .eq("id", participantId);

  if (partError) return { error: partError.message };

  // 2. Sync Players
  // We'll do this in a simple way: update existing by ID, or insert new ones
  for (const playerData of playersData) {
    if (playerData.id) {
      const { id, ...updateData } = playerData;
      await supabase.from("players").update(updateData).eq("id", id);
    } else if (playerData.name) {
      await supabase.from("players").insert({
        ...playerData,
        participant_id: participantId,
      });
    }
  }

  revalidatePath(`/organizer/tournaments/${tournamentId}/participants`);
  return { success: true };
}

export async function addManualParticipantFull(
  tournamentId: string,
  participantData: Partial<Participant>,
  playersData: Partial<Player>[],
): Promise<ActionResult> {
  const supabase = await createClient();

  // 1. Insert Participant
  const { data: part, error: partError } = await supabase
    .from("participants")
    .insert({
      ...participantData,
      tournament_id: tournamentId,
      status: "approved", // Manual additions are approved by default
    })
    .select()
    .single();

  if (partError) return { error: partError.message };

  // 2. Insert Players
  if (playersData.length > 0) {
    const playersToInsert = playersData.map((p) => ({
      ...p,
      participant_id: part.id,
    }));
    const { error: playersError } = await supabase
      .from("players")
      .insert(playersToInsert);
    if (playersError) return { error: playersError.message };
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

export async function applyParticipantSeeds(
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const tournamentId = formData.get("tournament_id") as string;
  const assignmentsRaw = formData.get("assignments") as string;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized: No session" };

  let assignments: SeedAssignment[];
  try {
    const parsed: unknown = JSON.parse(assignmentsRaw);
    if (!isSeedAssignmentArray(parsed)) {
      return { error: "Invalid seed assignment payload" };
    }
    assignments = parsed;
  } catch {
    return { error: "Invalid seed assignment payload" };
  }

  if (assignments.length < 2) {
    return { error: "Need at least 2 participants to draw seeds" };
  }

  const seedSet = new Set(assignments.map((assignment) => assignment.seed));
  const participantIdSet = new Set(
    assignments.map((assignment) => assignment.participantId),
  );

  if (
    seedSet.size !== assignments.length ||
    participantIdSet.size !== assignments.length
  ) {
    return { error: "Seed assignments must be unique" };
  }

  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("id, projects(owner_id)")
    .eq("id", tournamentId)
    .single();

  if (tournamentError || !tournament) {
    return { error: "Tournament not found" };
  }

  const project = Array.isArray(tournament.projects)
    ? tournament.projects[0]
    : tournament.projects;
  const isOwner = project?.owner_id === user.id;

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

  const { data: matches, error: matchesError } = await supabase
    .from("matches")
    .select("id, status, stages!inner(tournament_id)")
    .eq("stages.tournament_id", tournamentId);

  if (matchesError) {
    return { error: matchesError.message };
  }

  if ((matches || []).length > 0) {
    return {
      error:
        "Bracket matches already exist. Regenerate or reset the bracket before changing seeds.",
    };
  }

  const { data: participants, error: participantsError } = await supabase
    .from("participants")
    .select("id")
    .eq("tournament_id", tournamentId)
    .eq("status", "approved");

  if (participantsError || !participants) {
    return { error: participantsError?.message || "Participants not found" };
  }

  const approvedIds = new Set(
    participants.map((participant) => participant.id),
  );
  const coversApprovedParticipants =
    assignments.length === participants.length &&
    assignments.every((assignment) =>
      approvedIds.has(assignment.participantId),
    );

  if (!coversApprovedParticipants) {
    return {
      error:
        "Seed assignments must include every approved participant exactly once",
    };
  }

  const updates = assignments.map((assignment) =>
    supabase
      .from("participants")
      .update({ seed: assignment.seed })
      .eq("id", assignment.participantId)
      .eq("tournament_id", tournamentId)
      .eq("status", "approved"),
  );

  const results = await Promise.all(updates);
  const failed = results.find((result) => result.error);

  if (failed?.error) {
    return { error: failed.error.message };
  }

  revalidatePath(`/organizer/tournaments/${tournamentId}/participants`);
  revalidatePath(`/organizer/tournaments/${tournamentId}`);
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
