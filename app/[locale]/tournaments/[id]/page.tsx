import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Link } from "@/lib/i18n/routing";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { JoinButton } from "./JoinButton";
import { LeaveButton } from "./LeaveButton";
import { BracketView } from "@/components/BracketView";
import {
  Trophy,
  Users,
  Swords,
  Clock,
  FileText,
  Monitor,
  AlignLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
import { ParticipantListTable } from "@/components/tournament/ParticipantListTable";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("name")
    .eq("id", id)
    .single();

  if (!tournament) return { title: "Tournament Not Found" };

  return { title: tournament.name };
}

export default async function PublicTournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const t = await getTranslations("Tournament");
  const { id, locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: tournament } = await supabase
    .from("tournaments")
    .select(
      "*, projects(name, logo_url), games(name, logo_url, cover_url), tournament_platforms(platforms(name))",
    )
    .eq("id", id)
    .single();

  if (!tournament) {
    notFound();
  }

  // Fetch stages and matches
  const { data: stages } = await supabase
    .from("stages")
    .select("*")
    .eq("tournament_id", id)
    .order("order_index", { ascending: true });

  const currentStage = stages?.[0];

  const { data: matches } = await supabase
    .from("matches")
    .select(
      "*, p1:participants!participant1_id(name, logo_url), p2:participants!participant2_id(name, logo_url), rounds(number, name)",
    )
    .eq("stage_id", currentStage?.id || "")
    .order("match_number", { ascending: true });

  const { count: participantCount } = await supabase
    .from("participants")
    .select("id", { count: "exact", head: true })
    .eq("tournament_id", id)
    .eq("status", "approved");

  // Check if user is already registered
  let isRegistered = false;
  let isPending = false;
  if (user) {
    const { data: registration } = await supabase
      .from("registrations")
      .select("status")
      .eq("tournament_id", id)
      .eq("user_id", user.id)
      .single();

    if (registration) {
      isRegistered = true;
      isPending = registration.status === "pending";
    }
  }

  const fDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary pb-20">
      <Navbar />

      {/* CINEMATIC HERO SECTION */}
      <div className="relative min-h-[50vh] flex items-center justify-center overflow-hidden border-b border-white/5">
        {/* Background Cover */}
        {tournament.games?.cover_url && (
          <div className="absolute inset-0 opacity-25 grayscale-[0.1] scale-105">
            <Image
              src={
                tournament.games.cover_url.startsWith("http")
                  ? tournament.games.cover_url
                  : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/game-assets/${tournament.games.cover_url}`
              }
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-[center_30%]"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/80 to-transparent"></div>
          </div>
        )}

        <div className="relative z-20 text-center max-w-[1600px] mx-auto px-6 lg:px-12 animate-in fade-in zoom-in-95 duration-1000 py-20">
          <div className="flex flex-col items-center gap-4">
            {/* Metadata Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
              {/* Game Badge with larger logo for clarity */}
              <div className="flex items-center gap-4 bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl shadow-2xl hover:border-brand-primary/50 transition-all group/game">
                <div className="h-10 w-24 relative flex items-center justify-center">
                  {tournament.games?.logo_url ? (
                    <Image
                      src={
                        tournament.games.logo_url.startsWith("http")
                          ? tournament.games.logo_url
                          : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/game-assets/${tournament.games.logo_url}`
                      }
                      alt={tournament.games.name}
                      fill
                      className="object-contain"
                      quality={100}
                    />
                  ) : (
                    <Zap className="h-5 w-5 text-brand-primary" />
                  )}
                </div>
                <div className="w-[1px] h-6 bg-white/20"></div>
                <span className="text-xs text-white font-black uppercase tracking-[0.2em]">
                  {tournament.games?.name}
                </span>
              </div>
            </div>

            <div className="flex justify-center mb-2">
              <span
                className={`text-[10px] px-6 py-2 rounded-full font-black uppercase tracking-[0.3em] shadow-2xl border ${
                  tournament.status === "registration_open"
                    ? "bg-success/10 text-success border-success/20"
                    : tournament.status === "completed"
                      ? "bg-brand-primary text-white border-brand-primary shadow-[0_0_30px_rgba(244,0,9,0.5)]"
                      : "bg-white/5 text-text-tertiary border-white/10"
                }`}
              >
                {t(`status_${tournament.status}`)}
              </span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter text-white drop-shadow-[0_0_40px_rgba(244,0,9,0.2)] leading-[0.9] max-w-5xl break-words">
              {tournament.name}
            </h1>
          </div>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-6 lg:px-12 mt-12 lg:mt-20 relative z-30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT: CONTENT (Overview, Brackets, Rules, Prizes) */}
          <div className="lg:col-span-8 space-y-10">
            {/* OVERVIEW CARD */}
            <section className="bg-[#0c0c0e] border border-white/5 rounded-[3rem] p-10 lg:p-14 shadow-2xl animate-in slide-in-from-bottom-6 duration-700">
              <div className="flex items-center gap-4 mb-10">
                <div className="h-12 w-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
                  <AlignLeft className="h-6 w-6" />
                </div>
                <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white">
                  {t("overview")}
                </h2>
              </div>
              <p className="text-text-secondary text-lg leading-relaxed whitespace-pre-wrap font-medium">
                {tournament.description || t("no_description")}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-16 pt-16 border-t border-white/5">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-warning">
                    <FileText className="h-5 w-5" />
                    <h3 className="text-sm font-black uppercase tracking-widest">
                      {t("rules")}
                    </h3>
                  </div>
                  <p className="text-sm text-text-tertiary leading-relaxed whitespace-pre-wrap font-medium">
                    {tournament.rules || t("no_rules")}
                  </p>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-success">
                    <Trophy className="h-5 w-5" />
                    <h3 className="text-sm font-black uppercase tracking-widest">
                      {t("prizes")}
                    </h3>
                  </div>
                  <p className="text-sm text-text-tertiary leading-relaxed whitespace-pre-wrap font-medium">
                    {tournament.prize_info || t("no_prizes")}
                  </p>
                </div>
              </div>
            </section>

            {/* LIVE BRACKETS */}
            <section className="bg-[#0c0c0e] border border-white/5 rounded-[3rem] p-10 lg:p-14 shadow-2xl animate-in slide-in-from-bottom-6 duration-700 delay-150">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
                    <Swords className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white">
                      {t("live_brackets")}
                    </h2>
                    <p className="text-md font-bold text-text-tertiary uppercase tracking-[0.2em] mt-1">
                      {t("realtime")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto scrollbar-hide min-h-[500px] flex items-center justify-center bg-white/[0.01] rounded-[2rem] border border-white/5 border-dashed">
                <BracketView
                  initialMatches={matches || []}
                  tournamentId={id}
                  isOrganizer={false}
                />
              </div>
            </section>

            {/* PARTICIPANTS TABLE */}
            <ParticipantListTable
              tournamentId={id}
              isOrganizer={false}
              participantType={tournament.participant_type}
            />
          </div>

          {/* RIGHT: SIDEBAR (Join, Schedule, Platforms, Specs) */}
          <div className="lg:col-span-4 space-y-10">
            {/* ACTION CARD */}
            <section className="bg-[#0c0c0e] border border-white/5 rounded-[3rem] p-10 shadow-2xl sticky top-28 animate-in slide-in-from-right-6 duration-700">
              <div className="space-y-10">
                <div>
                  <h3 className="font-display text-2xl font-black uppercase tracking-tight text-white mb-3">
                    {t("join_arena")}
                  </h3>
                  <p className="text-md font-bold text-text-tertiary uppercase tracking-widest leading-relaxed">
                    {t("entry_open")}
                  </p>
                </div>

                <div className="py-10 border-y border-white/5 space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary text-md font-black uppercase tracking-widest">
                      {t("slots_occupied")}
                    </span>
                    <span className="font-black text-white text-2xl tracking-tighter tabular-nums">
                      {participantCount || 0} / {tournament.size}
                    </span>
                  </div>
                  <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/5">
                    <div
                      className="h-full bg-brand-primary rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(244,0,9,0.4)]"
                      style={{
                        width: `${Math.min(100, ((participantCount || 0) / tournament.size) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-6">
                  {isRegistered ? (
                    <div className="text-center p-8 bg-brand-primary/5 border border-brand-primary/20 rounded-[2.5rem] space-y-6">
                      <div className="text-brand-primary font-black uppercase tracking-tight text-2xl leading-none">
                        {t("registered")}
                      </div>
                      <div className="text-md text-text-tertiary font-black uppercase tracking-widest flex items-center justify-center gap-3">
                        {t("status")}:{" "}
                        <span
                          className={cn(
                            "px-4 py-1.5 rounded-full border",
                            isPending
                              ? "bg-warning/10 text-warning border-warning/20"
                              : "bg-success/10 text-success border-success/20",
                          )}
                        >
                          {isPending
                            ? t("pending").toUpperCase()
                            : t("confirmed").toUpperCase()}
                        </span>
                      </div>
                      <div className="pt-4 border-t border-white/5">
                        <Link
                          href="/player/dashboard"
                          className="inline-flex items-center gap-2 text-md font-black text-white hover:text-brand-primary transition-all uppercase tracking-[0.2em]"
                        >
                          Go to Player Hub <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                      <LeaveButton
                        tournamentId={id}
                        isLeaveRequest={
                          !isPending &&
                          tournament.registration_mode === "manual"
                        }
                      />
                    </div>
                  ) : tournament.status === "registration_open" ? (
                    user ? (
                      <JoinButton
                        tournamentId={id}
                        participantType={tournament.participant_type}
                      />
                    ) : (
                      <Link href="/login">
                        <Button className="w-full bg-white text-black hover:bg-brand-primary hover:text-white transition-all py-8 font-display font-black text-xl uppercase tracking-tighter rounded-2xl shadow-xl">
                          {t("login_to_join")}
                        </Button>
                      </Link>
                    )
                  ) : (
                    <Button
                      disabled
                      className="w-full bg-white/5 text-text-disabled py-8 font-display font-black text-xl uppercase tracking-tighter rounded-2xl cursor-not-allowed border border-white/5"
                    >
                      {t("closed")}
                    </Button>
                  )}
                </div>

                {/* SCHEDULE & PLATFORMS */}
                <div className="space-y-8 pt-6 border-t border-white/5">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-info">
                      <Clock className="h-4 w-4" />
                      <h4 className="text-md font-black uppercase tracking-widest">
                        {t("schedule")}
                      </h4>
                    </div>
                    <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
                      {[
                        {
                          label: t("reg_deadline"),
                          value: tournament.registration_deadline,
                          icon: <Users className="h-3 w-3" />,
                          color: "text-warning",
                        },
                        {
                          label: t("start_date"),
                          value: tournament.start_date,
                          icon: <Zap className="h-3 w-3" />,
                          color: "text-brand-primary",
                        },
                        {
                          label: t("end_date"),
                          value: tournament.end_date,
                          icon: <Trophy className="h-3 w-3" />,
                          color: "text-success",
                        },
                      ].map((item, idx) => (
                        <div key={idx} className="relative pl-10 group">
                          <div
                            className={cn(
                              "absolute left-0 h-6 w-6 rounded-full flex items-center justify-center border border-white/10 bg-[#0c0c0e] z-10 group-hover:scale-110 transition-transform",
                              item.color,
                            )}
                          >
                            {item.icon}
                          </div>
                          <div className="text-md font-black text-text-tertiary uppercase tracking-widest mb-1">
                            {item.label}
                          </div>
                          <div className="text-sm font-bold text-white uppercase tabular-nums">
                            {fDate(item.value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-8 border-t border-white/5">
                    <div className="flex items-center gap-3 text-text-tertiary">
                      <Monitor className="h-4 w-4" />
                      <h4 className="text-md font-black uppercase tracking-widest">
                        {t("platforms")}
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tournament.tournament_platforms?.map(
                        (tp: { platforms: { name: string } }) => (
                          <span
                            key={tp.platforms.name}
                            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-md font-black uppercase tracking-widest text-white"
                          >
                            {tp.platforms.name}
                          </span>
                        ),
                      ) || (
                        <span className="text-md text-text-tertiary italic">
                          N/A
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-center pt-6 border-t border-white/5">
                  <p className="text-md text-text-tertiary font-bold uppercase tracking-widest leading-relaxed opacity-60">
                    {t("rules_agreement")}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
