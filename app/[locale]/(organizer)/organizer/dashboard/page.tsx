import { createClient } from "@/lib/supabase/server";
import { Link } from "@/lib/i18n/routing";
import { Trophy, Folder, Users, Swords, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return { title: t("organizer_dashboard") };
}

export default async function OrganizerDashboard() {
  const t = await getTranslations("Organizer.dashboard");
  const common = await getTranslations("Common");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch Stats
  const { count: projectCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", user?.id);

  const { count: tournamentCount } = await supabase
    .from("tournaments")
    .select("*, projects!inner(owner_id)", { count: "exact", head: true })
    .eq("projects.owner_id", user?.id);

  const { count: participantCount } = await supabase
    .from("participants")
    .select("*, tournaments!inner(projects!inner(owner_id))", {
      count: "exact",
      head: true,
    })
    .eq("tournaments.projects.owner_id", user?.id);

  const { data: recentTournaments } = await supabase
    .from("tournaments")
    .select(
      "*, projects!inner(name, owner_id), games(name), participants(count)",
    )
    .eq("projects.owner_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(5);

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
        <Link href="/organizer/projects/new">
          <Button className="bg-brand-primary text-white hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all font-bold uppercase tracking-widest px-8">
            <Plus className="mr-2 h-4 w-4" /> {common("manage")}
          </Button>
        </Link>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: t("stats.projects"),
            value: projectCount || 0,
            icon: Folder,
            color: "text-brand-primary",
          },
          {
            label: t("stats.tournaments"),
            value: tournamentCount || 0,
            icon: Trophy,
            color: "text-warning",
          },
          {
            label: t("stats.players"),
            value: participantCount || 0,
            icon: Users,
            color: "text-success",
          },
          {
            label: t("stats.matches"),
            value: 0,
            icon: Swords,
            color: "text-info",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-bg-secondary border border-white/5 rounded-[2rem] p-8 hover:border-brand-primary/30 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon className="h-20 w-20" />
            </div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-[10px] text-text-tertiary font-black uppercase tracking-[0.2em]">
                {stat.label}
              </span>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div className="font-display text-4xl font-black text-white relative z-10">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-bg-secondary border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="px-10 py-6 border-b border-white/5 flex justify-between items-center bg-white/2">
          <h2 className="font-display text-xl font-black uppercase tracking-tight text-white">
            {t("recent")}
          </h2>
          <Link
            href="/organizer/tournaments"
            className="text-[10px] text-brand-primary font-black uppercase tracking-[0.2em] hover:text-white transition-colors"
          >
            {common("view_all")}
          </Link>
        </div>
        <div className="divide-y divide-white/5">
          {recentTournaments?.length === 0 ? (
            <div className="p-20 text-center text-text-tertiary">
              <Trophy className="mx-auto h-16 w-16 opacity-10 mb-6" />
              <p className="font-bold uppercase tracking-widest text-xs">
                {t("empty") || "No tournaments found"}
              </p>
            </div>
          ) : (
            recentTournaments?.map((tournament) => (
              <Link
                key={tournament.id}
                href={`/organizer/tournaments/${tournament.id}`}
                className="block p-8 hover:bg-white/2 transition-all group"
              >
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="text-[10px] text-brand-primary font-black uppercase tracking-[0.2em]">
                      {tournament.projects?.name}
                    </div>
                    <div className="font-black text-xl text-white group-hover:text-brand-primary transition-colors uppercase tracking-tight">
                      {tournament.name}
                    </div>
                    <div className="text-[10px] text-text-tertiary uppercase font-bold tracking-widest mt-1">
                      {tournament.games?.name} • {tournament.status}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-white">
                      {(
                        tournament.participants as unknown as {
                          count: number;
                        }[]
                      )?.[0]?.count || 0}{" "}
                      / {tournament.size}
                    </div>
                    <div className="text-[10px] text-text-tertiary uppercase font-black tracking-[0.2em]">
                      {t("slots_filled")}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
