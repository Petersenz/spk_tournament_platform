import { createClient } from "@/lib/supabase/server";
import { Link } from "@/lib/i18n/routing";
import { Trophy, Clock, Swords, Calendar, ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return { title: t("player_dashboard") };
}

export default async function PlayerDashboardPage() {
  const t = await getTranslations("Player.dashboard");
  const common = await getTranslations("Common");
  const tourT = await getTranslations("Tournament");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Fetch registrations
  const { data: registrations } = await supabase
    .from("registrations")
    .select("*, tournaments(*, banner_url, games(name))")
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
        "*, stages(name, tournament_id, tournaments(name, banner_url)), p1:participants!participant1_id(name, logo_url), p2:participants!participant2_id(name, logo_url)",
      )
      .or(
        `participant1_id.in.(${pIds.map((id) => `"${id}"`).join(",")}),participant2_id.in.(${pIds.map((id) => `"${id}"`).join(",")})`,
      )
      .eq("status", "pending")
      .order("scheduled_at", { ascending: true })
      .limit(5);
    matches = data || [];
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* LEFT: UPCOMING MATCHES */}
        <div className="xl:col-span-4 space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-8 w-1 bg-brand-primary rounded-full"></div>
            <h2 className="font-display text-2xl font-black uppercase tracking-tighter text-white">
              {t("next_matches")}
            </h2>
          </div>

          <div className="space-y-4">
            {matches.length === 0 ? (
              <div className="p-12 text-center bg-white/2 border-2 border-dashed border-white/5 rounded-[2.5rem] text-text-tertiary flex flex-col items-center justify-center min-h-[200px]">
                <Clock className="h-8 w-8 mb-4 opacity-10" />
                <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">
                  {t("no_scheduled")}
                </p>
              </div>
            ) : (
              matches.map((m) => (
                <div
                  key={m.id}
                  className="relative bg-bg-secondary border border-white/5 rounded-[2rem] p-5 shadow-2xl hover:border-brand-primary/40 transition-all group overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="text-[9px] text-brand-primary font-black uppercase tracking-[0.2em] truncate pr-2">
                      {m.stages?.tournaments?.name}
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/5 text-[8px] font-black text-text-tertiary uppercase shrink-0">
                      <Calendar className="h-2.5 w-2.5 text-brand-primary" />
                      {m.scheduled_at
                        ? new Date(m.scheduled_at).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : tourT("tbd")}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 relative z-10">
                    <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                      <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden relative shadow-inner shrink-0">
                        {m.p1?.logo_url ? (
                          <Image
                            src={m.p1.logo_url}
                            alt={m.p1.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-sm font-black text-white/20">
                            {m.p1?.name?.[0]}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-black text-white uppercase truncate w-full text-center">
                        {m.p1?.name || "TBD"}
                      </div>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="h-7 w-7 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-[9px] font-black text-brand-primary shadow-lg">
                        VS
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                      <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden relative shadow-inner shrink-0">
                        {m.p2?.logo_url ? (
                          <Image
                            src={m.p2.logo_url}
                            alt={m.p2.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-sm font-black text-white/20">
                            {m.p2?.name?.[0]}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-black text-white uppercase truncate w-full text-center">
                        {m.p2?.name || "TBD"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex justify-center">
                    <div className="px-3 py-1 bg-white/2 rounded-full border border-white/5 text-[8px] font-black text-text-tertiary uppercase tracking-[0.2em]">
                      {m.stages?.name}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: REGISTERED TOURNAMENTS */}
        <div className="xl:col-span-8 space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="h-8 w-1 bg-success rounded-full"></div>
              <h2 className="font-display text-2xl font-black uppercase tracking-tighter text-white">
                {t("registrations")}
              </h2>
            </div>
            <Link
              href="/tournaments"
              className="group flex items-center gap-2 text-[9px] text-brand-primary font-black uppercase tracking-[0.2em] hover:text-white transition-all"
            >
              {common("view_all")}
              <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {registrations?.length === 0 ? (
              <div className="col-span-full p-20 text-center bg-white/2 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center min-h-[300px]">
                <Trophy className="h-12 w-12 mb-6 opacity-10" />
                <p className="text-text-tertiary mb-8 font-bold uppercase tracking-[0.2em] text-xs opacity-50">
                  {t("empty_joined")}
                </p>
                <Link href="/tournaments">
                  <Button className="bg-brand-primary text-white hover:bg-white hover:text-black h-12 rounded-xl font-black uppercase tracking-widest px-10 transition-all shadow-xl">
                    {t("find_tour")}
                  </Button>
                </Link>
              </div>
            ) : (
              registrations?.slice(0, 4).map((reg) => (
                <Link
                  key={reg.id}
                  href={`/tournaments/${reg.tournament_id}`}
                  className="group"
                >
                  <div className="bg-bg-secondary border border-white/5 rounded-[2rem] p-6 hover:border-brand-primary/40 transition-all flex flex-col h-full shadow-2xl relative overflow-hidden group">
                    {/* Background Banner */}
                    <div className="absolute top-0 right-0 w-2/3 h-full opacity-5 group-hover:opacity-10 transition-opacity">
                      {reg.tournaments?.banner_url && (
                        <Image
                          src={reg.tournaments.banner_url}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-l from-transparent via-bg-secondary/80 to-bg-secondary"></div>
                    </div>

                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-6 gap-4">
                        <h3 className="font-display text-xl font-black text-white group-hover:text-brand-primary transition-colors uppercase tracking-tight leading-tight max-w-[70%]">
                          {reg.tournaments?.name}
                        </h3>
                        <div
                          className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-black text-[8px] uppercase tracking-wider border transition-all ${
                            reg.status === "approved"
                              ? "bg-success/5 text-success border-success/20 group-hover:bg-success group-hover:text-black"
                              : "bg-warning/5 text-warning border-warning/20 group-hover:bg-warning group-hover:text-black"
                          }`}
                        >
                          <div
                            className={`h-1 w-1 rounded-full ${reg.status === "approved" ? "bg-success" : "bg-warning"} group-hover:bg-current`}
                          ></div>
                          {reg.status}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[9px] text-text-tertiary font-bold uppercase tracking-[0.15em] mb-8">
                        <div className="flex items-center gap-1.5">
                          <Swords className="h-3 w-3 text-brand-primary/60" />
                          {reg.tournaments?.games?.name}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3 opacity-60" />
                          {new Date(reg.created_at).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-between">
                        <div className="text-[8px] font-black uppercase text-brand-primary/40 group-hover:text-brand-primary transition-colors">
                          View Tournament Brackets
                        </div>
                        <div className="h-9 w-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-text-tertiary group-hover:bg-brand-primary group-hover:text-white transition-all shadow-lg">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </div>
                      </div>
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
