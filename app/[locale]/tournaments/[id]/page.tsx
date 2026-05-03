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
  Calendar,
  Users,
  Swords,
  ShieldCheck,
  Info,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
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
  params: Promise<{ id: string }>;
}) {
  const tCommon = await getTranslations("Common");
  const t = await getTranslations("Tournament");
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("*, projects(name, description), games(name)")
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
      "*, p1:participants!participant1_id(name), p2:participants!participant2_id(name), rounds(number, name)",
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

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <Navbar />

      {/* HERO BANNER */}
      <div className="relative h-96 bg-[#050505] flex items-center justify-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent z-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-primary/10 via-transparent to-transparent opacity-50"></div>

        <div className="relative z-20 text-center max-w-5xl mx-auto px-4 animate-in fade-in zoom-in-95 duration-1000">
          <div className="flex justify-center mb-6">
            <span
              className={`text-xs px-5 py-2 rounded-full font-bold uppercase tracking-[0.2em] shadow-lg ${
                tournament.status === "registration_open"
                  ? "bg-success text-white"
                  : tournament.status === "completed"
                    ? "bg-brand-primary text-white shadow-[0_0_20px_rgba(244,0,9,0.4)]"
                    : "bg-white/10 text-text-tertiary"
              }`}
            >
              {t(`status_${tournament.status}`)}
            </span>
          </div>
          <h1 className="font-display text-5xl md:text-8xl font-black uppercase tracking-tighter text-white drop-shadow-[0_0_30px_rgba(244,0,9,0.3)] mb-4">
            {tournament.name}
          </h1>
          <p className="text-brand-primary font-bold uppercase tracking-[0.4em] text-sm flex items-center justify-center gap-3">
            <span className="h-[1px] w-8 bg-brand-primary/50"></span>
            {t("hosted_by")} {tournament.projects?.name}
            <span className="h-[1px] w-8 bg-brand-primary/50"></span>
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* LEFT: DETAILS & BRACKET */}
          <div className="lg:col-span-3 space-y-20">
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-xl bg-brand-subtle flex items-center justify-center text-brand-primary border border-brand-primary/20">
                  <Info className="h-5 w-5" />
                </div>
                <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white">
                  {t("overview")}
                </h2>
              </div>
              <div className="bg-bg-secondary border border-white/5 rounded-[2.5rem] p-10 leading-relaxed text-text-secondary shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                  <Trophy className="h-40 w-40" />
                </div>
                <p className="relative z-10 text-lg leading-relaxed">
                  {tournament.projects?.description ||
                    "Join this exciting tournament and compete for glory. Make sure to read the rules and check-in on time."}
                </p>
              </div>
            </section>

            {/* LIVE BRACKET SECTION (Realtime) */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
                  <Swords className="h-5 w-5" />
                </div>
                <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white">
                  {t("live_brackets")}
                </h2>
              </div>
              <div className="bg-[#0c0c0e] border border-white/5 rounded-[2.5rem] p-8 md:p-12 overflow-x-auto shadow-2xl min-h-[400px] flex items-center justify-center">
                <BracketView
                  initialMatches={matches || []}
                  tournamentId={id}
                  isOrganizer={false}
                />
              </div>
            </section>

            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center text-warning border border-warning/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white">
                  {t("tech_specs")}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  {
                    icon: Users,
                    label: t("capacity"),
                    value: `${tournament.size} ${t("slots_unit")}`,
                  },
                  {
                    icon: Trophy,
                    label: t("mode"),
                    value: tournament.participant_type.toUpperCase(),
                  },
                  {
                    icon: Swords,
                    label: t("format"),
                    value: tournament.match_type.toUpperCase(),
                  },
                  {
                    icon: Calendar,
                    label: t("status"),
                    value: t(`status_${tournament.status}`).toUpperCase(),
                  },
                ].map((spec, i) => (
                  <div
                    key={i}
                    className="p-8 bg-bg-secondary border border-white/5 rounded-[2rem] hover:border-brand-primary/30 transition-all group"
                  >
                    <spec.icon className="h-6 w-6 text-brand-primary mb-4 group-hover:scale-110 transition-transform" />
                    <div className="text-xs text-text-tertiary font-bold uppercase tracking-[0.2em] mb-2 leading-none">
                      {spec.label}
                    </div>
                    <div className="font-bold text-white uppercase tracking-tight text-lg">
                      {spec.value}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT: ACTION CARD */}
          <div className="lg:col-span-1">
            <div className="bg-bg-secondary border border-white/5 rounded-[2.5rem] p-10 sticky top-32 shadow-2xl space-y-8">
              <div>
                <h3 className="font-display text-2xl font-black uppercase tracking-tight text-white mb-2">
                  {t("join_arena")}
                </h3>
                <p className="text-xs text-text-tertiary font-bold uppercase tracking-widest leading-relaxed">
                  {t("entry_open")}
                </p>
              </div>

              <div className="py-8 border-y border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-text-secondary text-xs font-bold uppercase tracking-widest">
                    {t("slots_occupied")}
                  </span>
                  <span className="font-bold text-white text-lg tracking-tight">
                    {participantCount || 0} / {tournament.size}
                  </span>
                </div>
                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div
                    className="h-full bg-brand-primary rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(244,0,9,0.5)]"
                    style={{
                      width: `${Math.min(100, ((participantCount || 0) / tournament.size) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              {isRegistered ? (
                <div className="text-center p-8 bg-brand-subtle/50 border border-brand-primary/20 rounded-[2rem] space-y-4">
                  <div className="text-brand-primary font-black uppercase tracking-tighter text-xl leading-none">
                    {t("registered")}
                  </div>
                  <div className="text-xs text-text-tertiary font-bold uppercase tracking-widest leading-relaxed">
                    {t("status")}:{" "}
                    <span className="text-white ml-1">
                      {isPending ? t("pending") : t("confirmed")}
                    </span>
                  </div>
                  <Link
                    href="/player/dashboard"
                    className="block text-xs font-bold text-white hover:text-brand-primary transition-colors uppercase tracking-[0.2em]"
                  >
                    {t("go_to_dashboard")} →
                  </Link>
                  <LeaveButton
                    tournamentId={id}
                    isLeaveRequest={
                      !isPending && tournament.registration_mode === "manual"
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
                    <Button className="w-full bg-white text-black hover:bg-brand-primary hover:text-white transition-all py-8 font-display font-black text-xl uppercase tracking-tighter rounded-2xl">
                      {t("login_to_join")}
                    </Button>
                  </Link>
                )
              ) : (
                <Button
                  disabled
                  className="w-full bg-white/5 text-text-disabled py-8 font-display font-black text-xl uppercase tracking-tighter rounded-2xl cursor-not-allowed"
                >
                  {t("closed")}
                </Button>
              )}

              <div className="text-center">
                <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-[0.15em] leading-relaxed">
                  {t("rules_agreement")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
