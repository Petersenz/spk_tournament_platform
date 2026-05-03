import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Link } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";
import { generateBracket } from "./actions";
import { BracketView } from "@/components/BracketView";
import {
  Gamepad2,
  Users,
  Swords,
  Trophy,
  Settings,
  ChevronLeft,
  Calendar,
  ShieldCheck,
  LayoutDashboard,
  Share2,
  Trash2,
  Edit3,
} from "lucide-react";
import Image from "next/image";
import { deleteTournament } from "./actions";
import { DeleteTournamentButton } from "./DeleteTournamentButton";
import { GenerateBracketButton } from "./GenerateBracketButton";
import { getTranslations } from "next-intl/server";

export default async function TournamentDashboardPage({
  params,
}: {
  params: Promise<{ tournamentId: string }>;
}) {
  const t = await getTranslations("Tournament");
  const { tournamentId } = await params;
  const supabase = await createClient();

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("*, projects(*), games(*)") // Get everything from games
    .eq("id", tournamentId)
    .single();

  if (!tournament) {
    notFound();
  }

  const { data: stages } = await supabase
    .from("stages")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("order_index", { ascending: true });

  const currentStage = stages?.[0];

  const { count: participantCount } = await supabase
    .from("participants")
    .select("id", { count: "exact", head: true })
    .eq("tournament_id", tournamentId)
    .eq("status", "approved");

  const { count: registrationCount } = await supabase
    .from("registrations")
    .select("id", { count: "exact", head: true })
    .eq("tournament_id", tournamentId)
    .eq("status", "pending");

  const { data: matches } = await supabase
    .from("matches")
    .select(
      "*, p1:participants!participant1_id(name), p2:participants!participant2_id(name), rounds(number, name)",
    )
    .eq("stage_id", currentStage?.id || "")
    .order("match_number", { ascending: true });

  const gameCover = tournament.games?.cover_url;
  const gameLogo = tournament.games?.logo_url;

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary pb-20 space-y-12 animate-in fade-in duration-1000">
      {/* CINEMATIC HERO HEADER */}
      <div className="relative overflow-hidden rounded-[3rem] border border-white/5 bg-[#0c0c0e] shadow-2xl">
        {/* Ambient Background Cover */}
        {gameCover && (
          <div className="absolute inset-0 opacity-20 grayscale-[0.5] blur-sm scale-105">
            <Image
              src={
                gameCover.startsWith("http")
                  ? gameCover
                  : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/game-assets/${gameCover}`
              }
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-[#0c0c0e]/80 to-transparent"></div>
          </div>
        )}

        <div className="relative z-10 p-8 lg:p-14">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
            <div className="flex items-center gap-8">
              {/* Game Branding */}
              <div className="relative h-32 w-32 shrink-0 group">
                <div className="absolute inset-0 bg-brand-primary rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative h-full w-full rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl backdrop-blur-xl">
                  {gameLogo ? (
                    <Image
                      src={
                        gameLogo.startsWith("http")
                          ? gameLogo
                          : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/game-assets/${gameLogo}`
                      }
                      alt={tournament.games?.name}
                      width={80}
                      height={80}
                      className="object-contain"
                    />
                  ) : (
                    <Gamepad2 className="h-12 w-12 text-brand-primary" />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`text-xs px-5 py-2 rounded-full font-bold uppercase tracking-[0.2em] shadow-lg ${
                      tournament.status === "registration_open"
                        ? "bg-success text-white"
                        : tournament.status === "completed"
                          ? "bg-brand-primary text-white shadow-[0_0_20px_rgba(244,0,9,0.4)]"
                          : "bg-white/10 text-text-tertiary"
                    }`}
                  >
                    {t(`status_${tournament.status}`, { ns: "Tournament" })}
                  </span>
                  <span className="text-brand-primary font-bold uppercase tracking-[0.3em] text-xs flex items-center gap-2">
                    <span className="h-1 w-8 bg-brand-primary/30"></span>
                    {tournament.games?.name || t("custom_arena")}
                  </span>
                </div>
                <h1 className="font-display text-5xl lg:text-7xl font-black uppercase tracking-tighter text-white drop-shadow-2xl">
                  {tournament.name}
                </h1>
                <div className="flex flex-wrap items-center gap-6 text-text-tertiary text-xs font-bold uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                    <Users className="h-4 w-4 text-brand-primary" />
                    {t("slots", { count: tournament.size })}
                  </span>
                  <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                    <Swords className="h-4 w-4 text-brand-primary" />
                    {tournament.match_type.toUpperCase()}
                  </span>
                  <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                    <ShieldCheck className="h-4 w-4 text-brand-primary" />
                    {tournament.participant_type.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 w-full lg:w-auto">
              <Link href={`/organizer/tournaments/${tournament.id}/setup`}>
                <Button
                  variant="outline"
                  className="h-16 px-8 rounded-2xl border-white/10 hover:bg-white/5 font-bold uppercase tracking-widest text-xs group transition-all"
                >
                  <Settings className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />{" "}
                  {t("config")}
                </Button>
              </Link>
              <Link href={`/tournaments/${tournament.id}`} target="_blank">
                <Button
                  variant="outline"
                  className="h-16 px-8 rounded-2xl border-white/10 hover:bg-white/5 font-bold uppercase tracking-widest text-xs"
                >
                  <Share2 className="mr-2 h-4 w-4" /> {t("live_page")}
                </Button>
              </Link>
              <DeleteTournamentButton tournamentId={tournamentId} />
              <Link href={`/organizer/tournaments/${tournament.id}/edit`}>
                <Button
                  variant="outline"
                  className="h-16 px-8 rounded-2xl border-white/10 hover:bg-white/5 font-bold uppercase tracking-widest text-xs"
                >
                  <Edit3 className="mr-2 h-4 w-4" /> {t("edit_info")}
                </Button>
              </Link>
              <Link
                href={`/organizer/tournaments/${tournament.id}/participants`}
              >
                <Button className="h-16 px-10 rounded-2xl bg-brand-primary text-white hover:bg-white hover:text-black font-bold uppercase tracking-widest text-xs shadow-[0_0_30px_rgba(244,0,9,0.4)] relative group transition-all">
                  {t("manage_entries")}
                  {registrationCount ? (
                    <span className="absolute -top-3 -right-3 h-8 w-8 bg-white text-brand-primary rounded-full flex items-center justify-center font-bold text-xs shadow-2xl animate-bounce">
                      {registrationCount}
                    </span>
                  ) : null}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK STATS & TABS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="bg-[#0c0c0e] border border-white/5 rounded-[2.5rem] p-2 flex gap-2 backdrop-blur-3xl shadow-xl">
            <Link
              href={`/organizer/tournaments/${tournament.id}`}
              className="flex-1 flex items-center justify-center gap-3 py-5 rounded-[1.8rem] bg-brand-primary text-white font-black uppercase tracking-widest text-[11px] shadow-[0_0_20px_rgba(244,0,9,0.3)] transition-all"
            >
              <LayoutDashboard className="h-4 w-4" /> {t("live_brackets")}
            </Link>
            <Link
              href={`/organizer/tournaments/${tournament.id}/participants`}
              className="flex-1 flex items-center justify-center gap-3 py-5 rounded-[1.8rem] text-text-tertiary hover:text-white hover:bg-white/5 font-bold uppercase tracking-widest text-xs transition-all group"
            >
              <Users className="h-4 w-4 group-hover:text-brand-primary transition-colors" />{" "}
              {t("manage_entries")} ({participantCount || 0})
            </Link>
            <button
              disabled
              className="flex-1 flex items-center justify-center gap-3 py-5 rounded-[1.8rem] text-text-tertiary/20 font-bold uppercase tracking-widest text-xs cursor-not-allowed"
            >
              <Calendar className="h-4 w-4" /> {t("match_recorded")}
            </button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="h-full bg-[#0c0c0e] border border-white/5 rounded-[2.5rem] p-8 flex items-center justify-between shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="text-xs font-bold text-text-tertiary uppercase tracking-[0.3em] mb-2">
                {t("total_confirmed")}
              </div>
              <div className="text-4xl font-black text-white uppercase tracking-tighter flex items-baseline gap-2">
                {participantCount || 0}{" "}
                <span className="text-sm text-text-tertiary font-bold tracking-widest">
                  / {tournament.size}
                </span>
              </div>
            </div>
            <Trophy className="h-12 w-12 text-brand-primary/20 group-hover:scale-125 transition-transform duration-500" />
            <div
              className="absolute bottom-0 left-0 h-1 bg-brand-primary"
              style={{
                width: `${((participantCount || 0) / tournament.size) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* BRACKET AREA */}
      <div className="bg-[#0c0c0e] border border-white/5 rounded-[4rem] p-12 lg:p-20 shadow-2xl relative overflow-hidden min-h-[700px]">
        {/* Decor */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 blur-[120px] rounded-full -mr-64 -mt-64"></div>

        <div className="flex flex-col md:flex-row items-center justify-between mb-20 gap-10 relative z-10">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="h-1 w-12 bg-brand-primary"></div>
              <h2 className="font-display text-4xl lg:text-5xl font-black uppercase tracking-tighter text-white">
                {currentStage ? currentStage.name : t("flow")}
              </h2>
            </div>
            <p className="text-text-tertiary text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-3">
              {t("realtime")}{" "}
              <span className="h-1 w-1 bg-white/20 rounded-full"></span>
              <span className="text-brand-primary">
                {t("competitors_ready", { count: participantCount || 0 })}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            {currentStage ? (
              <GenerateBracketButton
                tournamentId={tournamentId}
                stageId={currentStage.id}
                hasMatches={!!(matches && matches.length > 0)}
              />
            ) : (
              <Link href={`/organizer/tournaments/${tournamentId}/setup`}>
                <Button className="h-16 px-10 rounded-2xl bg-white text-black hover:bg-brand-primary hover:text-white font-bold uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  {t("finish_setup_first")}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* REALTIME BRACKET VISUALIZATION */}
        <div className="relative w-full overflow-x-auto pb-10 scrollbar-hide">
          <div className="min-w-[1000px]">
            {currentStage && matches?.length ? (
              <BracketView
                initialMatches={matches || []}
                tournamentId={tournamentId}
                isOrganizer={true}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-40 text-center border border-white/5 bg-white/2 rounded-[3rem] backdrop-blur-sm border-dashed">
                <Swords className="h-20 w-20 text-white/5 mb-8" />
                <h3 className="font-display text-2xl font-black uppercase tracking-tight text-white mb-3">
                  {currentStage ? t("no_matches") : t("not_configured")}
                </h3>
                <p className="text-text-tertiary max-w-sm font-medium leading-relaxed mb-10">
                  {currentStage ? t("init_bracket_desc") : t("setup_required")}
                </p>
                {currentStage && (
                  <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-[0.3em] text-text-tertiary">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-brand-primary" />{" "}
                      {t("manage_entries")} ({participantCount || 0})
                    </span>
                    <span className="h-1 w-1 bg-white/20 rounded-full"></span>
                    <span>{t("min_required", { count: 2 })}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
