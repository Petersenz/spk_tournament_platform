import { createClient } from "@/lib/supabase/server";
import { Link } from "@/lib/i18n/routing";
import { Trophy, Clock, Swords } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

export async function generateMetadata({ params }: any) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return { title: t("player_dashboard") };
}

export default async function PlayerDashboardPage() {
  const t = await getTranslations("Player.dashboard");
  const common = await getTranslations("Common");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Fetch registrations
  const { data: registrations } = await supabase
    .from("registrations")
    .select("*, tournaments(*, games(name))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // 2. Fetch upcoming matches
  const { data: userParticipants } = await supabase
    .from("participants")
    .select("id")
    .eq("user_id", user.id);

  const pIds = userParticipants?.map((p) => p.id) || [];

  let matches = [];
  if (pIds.length > 0) {
    const { data } = await supabase
      .from("matches")
      .select(
        "*, stages(name, tournament_id, tournaments(name)), p1:participants!participant1_id(name), p2:participants!participant2_id(name)",
      )
      .or(
        `participant1_id.in.(${pIds.map((id) => `"${id}"`).join(",")}),participant2_id.in.(${pIds.map((id) => `"${id}"`).join(",")})`,
      )
      .eq("status", "pending")
      .limit(5);
    matches = data || [];
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: t("stats.joined"),
            value: registrations?.length || 0,
            icon: Trophy,
            color: "text-brand-primary",
            bg: "bg-brand-subtle/50",
          },
          {
            label: t("stats.pending"),
            value: matches.length,
            icon: Swords,
            color: "text-success",
            bg: "bg-success/5",
          },
          {
            label: t("stats.rank"),
            value: "1st Rank",
            icon: Clock,
            color: "text-warning",
            bg: "bg-warning/5",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-bg-secondary border border-white/5 p-8 rounded-[2rem] flex items-center gap-6 shadow-xl hover:border-white/10 transition-all group"
          >
            <div
              className={`h-16 w-16 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}
            >
              <stat.icon className="h-8 w-8" />
            </div>
            <div>
              <div className="text-3xl font-black text-white">{stat.value}</div>
              <div className="text-[10px] text-text-tertiary uppercase font-black tracking-[0.2em] mt-1">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* LEFT: UPCOMING MATCHES */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="font-display text-2xl font-black uppercase tracking-tighter text-white">
            Your Next Matches
          </h2>
          <div className="space-y-4">
            {matches.length === 0 ? (
              <div className="p-12 text-center bg-bg-secondary/50 border border-dashed border-white/5 rounded-[2rem] text-text-tertiary">
                <p className="text-xs font-bold uppercase tracking-widest">
                  No scheduled matches
                </p>
              </div>
            ) : (
              matches.map((m) => (
                <div
                  key={m.id}
                  className="bg-bg-secondary border border-white/5 rounded-2xl p-6 space-y-4 shadow-lg hover:border-brand-primary/30 transition-all group"
                >
                  <div className="text-[10px] text-brand-primary font-black uppercase tracking-[0.3em]">
                    {m.stages?.tournaments?.name}
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 text-sm font-black truncate text-white">
                      {m.p1?.name || "TBD"}
                    </div>
                    <div className="text-[10px] text-brand-primary font-black px-2 py-1 bg-brand-subtle rounded border border-brand-primary/20">
                      VS
                    </div>
                    <div className="flex-1 text-sm font-black truncate text-right text-white">
                      {m.p2?.name || "TBD"}
                    </div>
                  </div>
                  <div className="text-[10px] text-text-tertiary text-center border-t border-white/5 pt-4 font-bold uppercase tracking-widest">
                    {m.stages?.name} • Round {m.round}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: REGISTERED TOURNAMENTS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="font-display text-2xl font-black uppercase tracking-tighter text-white">
              Recent Registrations
            </h2>
            <Link
              href="/tournaments"
              className="text-[10px] text-brand-primary font-black uppercase tracking-[0.2em] hover:text-white transition-all"
            >
              {common("view_all")}
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {registrations?.length === 0 ? (
              <div className="col-span-full p-20 text-center bg-bg-secondary/50 border border-dashed border-white/5 rounded-[2rem]">
                <p className="text-text-tertiary mb-6 font-bold uppercase tracking-widest text-xs">
                  You haven't joined any arenas yet.
                </p>
                <Link href="/tournaments">
                  <Button className="bg-brand-primary text-white hover:bg-white hover:text-black font-bold uppercase tracking-widest px-8">
                    Find a Tournament
                  </Button>
                </Link>
              </div>
            ) : (
              registrations?.slice(0, 4).map((reg) => (
                <Link key={reg.id} href={`/tournaments/${reg.tournament_id}`}>
                  <div className="bg-bg-secondary border border-white/5 rounded-[2rem] p-8 hover:border-brand-primary/30 transition-all flex flex-col h-full group shadow-lg relative overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="font-display text-xl font-black text-white group-hover:text-brand-primary transition-colors uppercase tracking-tight leading-tight">
                        {reg.tournaments?.name}
                      </h3>
                      <span
                        className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider ${
                          reg.status === "approved"
                            ? "bg-success/10 text-success border border-success/20"
                            : "bg-warning/10 text-warning border border-warning/20"
                        }`}
                      >
                        {reg.status}
                      </span>
                    </div>
                    <div className="mt-auto flex justify-between items-center text-[10px] text-text-tertiary border-t border-white/5 pt-6 font-bold uppercase tracking-widest">
                      <span>{reg.tournaments?.games?.name}</span>
                      <span>
                        {new Date(reg.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
