import { createClient } from "@/lib/supabase/server";
import { Link } from "@/lib/i18n/routing";
import { Users, Mail, Trophy } from "lucide-react";

export default async function OrganizerParticipantsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch participants across all tournaments owned by the user
  const { data: participants } = await supabase
    .from("participants")
    .select("*, tournaments!inner(name, projects!inner(owner_id))")
    .eq("tournaments.projects.owner_id", user?.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">All Participants</h1>
        <p className="text-text-secondary mt-1">
          Unified view of every player in your competitions.
        </p>
      </div>

      <div className="bg-bg-secondary border border-border-primary rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border-secondary bg-bg-tertiary">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-tertiary">
                Player
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-tertiary">
                Tournament
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-tertiary">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-tertiary text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-secondary">
            {participants?.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-20 text-center text-text-tertiary"
                >
                  <Users className="mx-auto h-8 w-8 mb-2 opacity-20" />
                  No participants found.
                </td>
              </tr>
            ) : (
              participants?.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-bg-tertiary transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-text-primary">
                      {p.name}
                    </div>
                    <div className="text-xs text-text-tertiary flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {p.email || "No email"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium flex items-center gap-2">
                      <Trophy className="h-3 w-3 text-brand-primary" />
                      {p.tournaments?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/organizer/tournaments/${p.tournament_id}`}>
                      <span className="text-xs text-brand-primary font-bold hover:underline">
                        Manage Tournament
                      </span>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
