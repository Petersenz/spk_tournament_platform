import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Link } from "@/lib/i18n/routing";
import { Users, ShieldCheck, Clock, UserCheck } from "lucide-react";
import { AddParticipantModal } from "@/app/[locale]/(organizer)/organizer/tournaments/[tournamentId]/participants/AddParticipantModal";
import { ParticipantsTable } from "@/app/[locale]/(organizer)/organizer/tournaments/[tournamentId]/participants/ParticipantsTable";
import { RegistrationsList } from "@/app/[locale]/(organizer)/organizer/tournaments/[tournamentId]/participants/RegistrationsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTranslations } from "next-intl/server";

export default async function TournamentParticipantsPage({
  params,
  searchParams,
}: {
  params: Promise<{ tournamentId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tournamentId } = await params;
  const { tab = "approved" } = await searchParams;
  const t = await getTranslations("Organizer.participants");
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

  // Permission Check
  if (!tournament || (!isAdmin && tournament.projects.owner_id !== user.id)) {
    notFound();
  }

  // Fetch Current Participants with Players
  const { data: participants } = await supabase
    .from("participants")
    .select("*, players(*)")
    .eq("tournament_id", tournamentId)
    .order("created_at", { ascending: false });

  // Fetch Pending registrations with profile info
  const { data: registrations } = await supabase
    .from("registrations")
    .select("*, profiles:user_id(nickname, avatar_url)")
    .eq("tournament_id", tournamentId)
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const pendingCount = registrations?.length || 0;
  const approvedCount = participants?.length || 0;

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
      {/* TOP HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col gap-1">
          <Link
            href={`/organizer/tournaments/${tournamentId}`}
            className="text-[11px] font-black uppercase tracking-[0.3em] text-text-tertiary hover:text-brand-primary transition-all flex items-center gap-2 mb-4"
          >
            <span className="text-lg">←</span> {t("back_to_dashboard")}
          </Link>
          <div className="flex items-center gap-6">
            <h1 className="font-display text-5xl lg:text-7xl font-black uppercase tracking-tighter text-white">
              {t("tournament_title")}
            </h1>
            {isAdmin && (
              <span className="bg-brand-primary/10 text-brand-primary text-[10px] px-4 py-2 rounded-full font-black uppercase tracking-widest border border-brand-primary/20 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> {t("admin_mode")}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <AddParticipantModal
            tournamentId={tournamentId}
            participantType={tournament.participant_type}
          />
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-[#0c0c0e] border border-white/5 rounded-[2.5rem] p-10 flex items-center justify-between shadow-2xl relative overflow-hidden group hover:border-success/50 transition-all duration-500">
          <div className="relative z-10">
            <div className="text-xs font-black text-text-tertiary uppercase tracking-[0.3em] mb-3">
              {t("confirmed")}
            </div>
            <div className="text-5xl font-black text-white uppercase tracking-tighter">
              {approvedCount}
            </div>
          </div>
          <UserCheck className="h-14 w-14 text-success/10 group-hover:text-success/20 group-hover:scale-110 transition-all duration-700" />
          <div className="absolute bottom-0 left-0 h-1 bg-success w-full opacity-10 group-hover:opacity-100 transition-opacity"></div>
        </div>

        <div className="bg-[#0c0c0e] border border-white/5 rounded-[2.5rem] p-10 flex items-center justify-between shadow-2xl relative overflow-hidden group hover:border-warning/50 transition-all duration-500">
          <div className="relative z-10">
            <div className="text-xs font-black text-text-tertiary uppercase tracking-[0.3em] mb-3">
              {t("pending")}
            </div>
            <div className="text-5xl font-black text-white uppercase tracking-tighter">
              {pendingCount}
            </div>
          </div>
          <Clock className="h-14 w-14 text-warning/10 group-hover:text-warning/20 group-hover:scale-110 transition-all duration-700" />
          {pendingCount > 0 && (
            <div className="absolute top-6 right-6 h-3 w-3 bg-warning rounded-full animate-ping"></div>
          )}
          <div className="absolute bottom-0 left-0 h-1 bg-warning w-full opacity-10 group-hover:opacity-100 transition-opacity"></div>
        </div>

        <div className="bg-[#0c0c0e] border border-white/5 rounded-[2.5rem] p-10 flex items-center justify-between shadow-2xl relative overflow-hidden group hover:border-brand-primary/50 transition-all duration-500">
          <div className="relative z-10">
            <div className="text-xs font-black text-text-tertiary uppercase tracking-[0.3em] mb-3">
              {t("capacity")}
            </div>
            <div className="text-5xl font-black text-white uppercase tracking-tighter">
              {tournament.size}
            </div>
          </div>
          <Users className="h-14 w-14 text-brand-primary/10 group-hover:text-brand-primary/20 group-hover:scale-110 transition-all duration-700" />
          <div className="absolute bottom-0 left-0 h-1 bg-brand-primary w-full opacity-10 group-hover:opacity-100 transition-opacity"></div>
        </div>
      </div>

      {/* MAIN CONTENT AREA WITH TABS */}
      <Tabs defaultValue={tab} className="w-full space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <TabsList className="bg-[#0c0c0e] border border-white/5 p-2 rounded-[2rem] h-auto backdrop-blur-3xl shadow-xl">
            <TabsTrigger
              value="approved"
              className="px-10 py-5 rounded-[1.5rem] data-[state=active]:bg-brand-primary data-[state=active]:text-white font-black uppercase tracking-widest text-[11px] transition-all"
            >
              {t("tab_confirmed")} ({approvedCount})
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="px-10 py-5 rounded-[1.5rem] data-[state=active]:bg-brand-primary data-[state=active]:text-white font-black uppercase tracking-widest text-[11px] transition-all relative"
            >
              {t("tab_requests")} ({pendingCount})
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-white text-brand-primary rounded-full flex items-center justify-center text-[9px] shadow-lg">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-text-tertiary">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
            {t("realtime_status")}
          </div>
        </div>

        <TabsContent
          value="approved"
          className="mt-0 focus-visible:outline-none"
        >
          <div className="bg-[#0c0c0e] border border-white/5 rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <ParticipantsTable
              participants={participants || []}
              tournamentId={tournamentId}
              tournamentSize={tournament.size}
              pendingCount={pendingCount}
            />
          </div>
        </TabsContent>

        <TabsContent
          value="pending"
          className="mt-0 focus-visible:outline-none"
        >
          <div className="bg-[#0c0c0e] border border-white/5 rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] min-h-[400px]">
            <div className="p-10 border-b border-white/5 flex items-center justify-between">
              <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white">
                {t("tab_requests")}
              </h2>
              <div className="text-[10px] font-black uppercase tracking-widest text-text-tertiary bg-white/5 px-4 py-2 rounded-xl">
                {t("manual_review")}
              </div>
            </div>
            <RegistrationsList
              registrations={registrations || []}
              tournamentId={tournamentId}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
