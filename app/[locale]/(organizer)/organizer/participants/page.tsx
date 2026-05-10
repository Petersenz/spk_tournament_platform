import { createClient } from "@/lib/supabase/server";
import { Link } from "@/lib/i18n/routing";
import { Users, Mail, Trophy } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return { title: t("admin_users") };
}

export default async function OrganizerParticipantsPage() {
  const t = await getTranslations("Organizer.participants");
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
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-display text-4xl font-black uppercase tracking-tighter text-white">
            {t("title")}
          </h1>
          <p className="text-text-secondary mt-1 font-medium">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <div className="bg-bg-secondary border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/2">
                <th className="px-10 py-6 text-xs font-black uppercase tracking-[0.2em] text-text-tertiary">
                  {t("table.player")}
                </th>
                <th className="px-10 py-6 text-xs font-black uppercase tracking-[0.2em] text-text-tertiary">
                  {t("table.tournament")}
                </th>
                <th className="px-10 py-6 text-xs font-black uppercase tracking-[0.2em] text-text-tertiary">
                  {t("table.status")}
                </th>
                <th className="px-10 py-6 text-xs font-black uppercase tracking-[0.2em] text-text-tertiary text-right">
                  {t("table.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {participants?.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-10 py-24 text-center text-text-tertiary"
                  >
                    <Users className="mx-auto h-16 w-16 mb-6 opacity-10" />
                    <p className="font-bold uppercase tracking-widest text-xs">
                      {t("empty")}
                    </p>
                  </td>
                </tr>
              ) : (
                participants?.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-white/2 transition-all group"
                  >
                    <td className="px-10 py-8">
                      <div className="font-black text-white uppercase tracking-tight group-hover:text-brand-primary transition-colors">
                        {p.name}
                      </div>
                      <div className="text-xs text-text-tertiary font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                        <Mail className="h-3.5 w-3.5 text-brand-primary" />{" "}
                        {p.email || "---"}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="text-sm font-bold text-text-secondary flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-brand-primary group-hover:border-brand-primary/50 transition-all">
                          <Trophy className="h-4 w-4" />
                        </div>
                        {p.tournaments?.name}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className="text-xs px-3 py-1 rounded-full font-black uppercase tracking-widest bg-success/10 text-success border border-success/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                        Active
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <Link href={`/organizer/tournaments/${p.tournament_id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs font-black uppercase tracking-widest text-brand-primary hover:text-white hover:bg-brand-primary/10 transition-all h-10 px-6 rounded-xl"
                        >
                          {t("manage_tournament")}
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
