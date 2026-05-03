import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Link } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  UserPlus,
  Trash2,
  Shuffle,
  Save,
  ShieldCheck,
} from "lucide-react";
import {
  approveRegistration,
  rejectRegistration,
  deleteParticipant,
  randomizeSeeds,
  updateSeed,
} from "@/app/[locale]/(organizer)/organizer/tournaments/[tournamentId]/participants/actions";
import { ApproveButton } from "@/app/[locale]/(organizer)/organizer/tournaments/[tournamentId]/participants/ApproveButton";
import { DeleteParticipantButton } from "@/app/[locale]/(organizer)/organizer/tournaments/[tournamentId]/participants/DeleteParticipantButton";
import { Input } from "@/components/ui/input";

export default async function TournamentParticipantsPage({
  params,
}: {
  params: Promise<{ tournamentId: string }>;
}) {
  const { tournamentId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  // Fetch user role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  // Fetch Tournament with Project info
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("*, projects(*)")
    .eq("id", tournamentId)
    .single();

  // Permission Check: Owner or Admin
  if (!tournament || (!isAdmin && tournament.projects.owner_id !== user.id)) {
    notFound();
  }

  // Fetch Pending Registrations (Waitlist)
  const { data: registrations } = await supabase
    .from("registrations")
    .select(
      `
      *,
      profiles:user_id (
        nickname,
        avatar_url
      ),
      participants:participant_id (
        name
      )
    `,
    )
    .eq("tournament_id", tournamentId)
    .eq("status", "pending");

  // Fetch Current Participants
  const { data: participants } = await supabase
    .from("participants")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("seed", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  // Fetch Leave Requests
  const { data: leaveRequests } = await supabase
    .from("registrations")
    .select("user_id")
    .eq("tournament_id", tournamentId)
    .eq("message", "leave_request");

  const leaveRequestUserIds = new Set(
    leaveRequests?.map((r) => r.user_id) || [],
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <Link
            href={`/organizer/tournaments/${tournamentId}`}
            className="text-[10px] font-black uppercase tracking-[0.3em] text-text-tertiary hover:text-brand-primary flex items-center transition-colors mb-4"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="font-display text-5xl font-black uppercase tracking-tighter text-white">
              Participant Center
            </h1>
            {isAdmin && (
              <span className="bg-brand-primary/20 text-brand-primary text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-brand-primary/20 flex items-center gap-2">
                <ShieldCheck className="h-3 w-3" /> Admin View
              </span>
            )}
          </div>
          <p className="text-text-secondary mt-2 font-medium">
            Managing entries for{" "}
            <span className="text-white font-bold">{tournament.name}</span>
          </p>
        </div>
        <Link href={`/organizer/tournaments/${tournamentId}/participants/new`}>
          <Button className="bg-brand-primary text-white hover:bg-white hover:text-black h-16 px-8 rounded-2xl font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(244,0,9,0.3)]">
            <UserPlus className="mr-2 h-5 w-5" /> Add Participant
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT: PENDING REGISTRATIONS */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              Waitlist
              <span className="text-xs bg-white/10 text-text-tertiary px-3 py-1 rounded-full font-black">
                {registrations?.length || 0}
              </span>
            </h2>
          </div>

          <div className="space-y-4">
            {registrations?.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] bg-white/2 text-text-tertiary">
                <p className="text-[10px] font-black uppercase tracking-widest">
                  No pending requests
                </p>
              </div>
            ) : (
              registrations?.map((reg) => {
                const participantName = reg.participants?.name;
                const profile = Array.isArray(reg.profiles)
                  ? reg.profiles[0]
                  : reg.profiles;
                const displayName =
                  participantName ||
                  profile?.nickname ||
                  `Player #${reg.user_id.slice(0, 5)}`;

                return (
                  <div
                    key={reg.id}
                    className="bg-[#0c0c0e] border border-white/5 rounded-[2rem] p-6 flex items-center justify-between group hover:border-brand-primary/30 transition-all shadow-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-brand-primary/10 flex items-center justify-center font-black text-brand-primary border border-brand-primary/20 text-lg shrink-0">
                        {displayName[0]?.toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className="font-black text-white uppercase tracking-tight truncate">
                          {displayName}
                        </div>
                        <div className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest">
                          {participantName && profile
                            ? `${profile.nickname} • `
                            : ""}
                          {new Date(reg.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <ApproveButton
                        registrationId={reg.id}
                        tournamentId={tournamentId}
                      />
                      <form
                        action={async (formData) => {
                          "use server";
                          await rejectRegistration(formData);
                        }}
                      >
                        <input
                          type="hidden"
                          name="registration_id"
                          value={reg.id}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-10 w-10 text-destructive hover:bg-destructive/10 rounded-xl"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </form>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT: CURRENT PARTICIPANTS LIST */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              Confirmed Arena
              <span className="text-xs bg-white/10 text-text-tertiary px-3 py-1 rounded-full font-black">
                {participants?.length || 0} / {tournament.size}
              </span>
            </h2>
            {participants && participants.length > 0 && (
              <form
                action={async (formData) => {
                  "use server";
                  await randomizeSeeds(formData);
                }}
              >
                <input
                  type="hidden"
                  name="tournament_id"
                  value={tournamentId}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:text-brand-primary transition-colors"
                >
                  <Shuffle className="mr-2 h-4 w-4" /> Randomize Seeds
                </Button>
              </form>
            )}
          </div>

          <div className="bg-[#0c0c0e] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/2 border-b border-white/5">
                  <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary w-32">
                    Seed
                  </th>
                  <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">
                    Competitor
                  </th>
                  <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">
                    Status
                  </th>
                  <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {participants?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-10 py-20 text-center text-text-tertiary uppercase font-black tracking-widest text-xs"
                    >
                      The arena is empty. Start approving players or add them
                      manually.
                    </td>
                  </tr>
                ) : (
                  participants?.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-white/2 transition-all group"
                    >
                      <td className="px-10 py-6 w-32">
                        <form
                          action={async (formData) => {
                            "use server";
                            await updateSeed(formData);
                          }}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="hidden"
                            name="participant_id"
                            value={p.id}
                          />
                          <input
                            type="hidden"
                            name="tournament_id"
                            value={tournamentId}
                          />
                          <Input
                            name="seed"
                            type="number"
                            defaultValue={p.seed || ""}
                            className="h-10 w-16 bg-white/5 border-white/10 text-center px-1 rounded-lg text-white font-black"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-text-tertiary hover:text-brand-primary"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        </form>
                      </td>
                      <td className="px-10 py-6">
                        <div className="font-black text-white uppercase tracking-tight text-lg">
                          {p.name}
                        </div>
                        <div className="text-[9px] text-text-tertiary uppercase font-bold tracking-widest">
                          ID: {p.id.slice(0, 8)}
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] px-3 py-1 rounded-full bg-success/10 text-success uppercase font-black border border-success/20 tracking-wider">
                            {p.status}
                          </span>
                          {leaveRequestUserIds.has(p.user_id) && (
                            <span className="text-[9px] px-3 py-1 rounded-full bg-destructive/10 text-destructive uppercase font-black border border-destructive/20 tracking-wider animate-pulse">
                              Requests Leave
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <DeleteParticipantButton
                          participantId={p.id}
                          tournamentId={tournamentId}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
