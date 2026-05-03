import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Link } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";
import {
  saveTournamentSetup,
  saveRegistrationSettings,
  publishTournament,
} from "@/app/[locale]/(organizer)/organizer/tournaments/[tournamentId]/setup/actions";
import {
  CheckCircle2,
  Circle,
  ChevronLeft,
  Layout,
  ShieldCheck,
  Rocket,
  Swords,
  Settings2,
  Calendar,
  Zap,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function TournamentSetupPage({
  params,
  searchParams,
}: {
  params: Promise<{ tournamentId: string }>;
  searchParams: Promise<{ step?: string }>;
}) {
  const t = await getTranslations("Setup");
  const tCommon = await getTranslations("Common");

  const { tournamentId } = await params;
  const { step = "1" } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("*, projects(*), games(*)")
    .eq("id", tournamentId)
    .single();

  if (!tournament || tournament.projects.owner_id !== user?.id) {
    notFound();
  }

  const { data: stages } = await supabase
    .from("stages")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("order_index", { ascending: true });

  const steps = [
    {
      id: "1",
      title: t("step_1"),
      description: t("step_1_desc"),
      icon: Layout,
    },
    {
      id: "2",
      title: t("step_2"),
      description: t("step_2_desc"),
      icon: ShieldCheck,
    },
    {
      id: "3",
      title: t("step_3"),
      description: t("step_3_desc"),
      icon: Rocket,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-in fade-in duration-1000">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link href={`/organizer/tournaments/${tournamentId}`}>
            <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all group">
              <ChevronLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
            </div>
          </Link>
          <div>
            <h1 className="font-display text-4xl font-black uppercase tracking-tighter text-white">
              {t("title")}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-1 w-6 bg-brand-primary"></span>
              <p className="text-text-tertiary text-[10px] font-black uppercase tracking-[0.2em]">
                {tournament.name}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Dots for Mobile */}
        <div className="flex md:hidden gap-2">
          {steps.map((s) => (
            <div
              key={s.id}
              className={`h-2 w-8 rounded-full ${step === s.id ? "bg-brand-primary" : "bg-white/10"}`}
            ></div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* SIDEBAR NAVIGATION */}
        <div className="lg:col-span-4 space-y-4">
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isCompleted =
              parseInt(step) > parseInt(s.id) ||
              (s.id === "1" && stages?.length);

            return (
              <Link
                key={s.id}
                href={`/organizer/tournaments/${tournamentId}/setup?step=${s.id}`}
                className={`group block p-6 rounded-[2rem] border transition-all duration-500 relative overflow-hidden ${
                  isActive
                    ? "bg-white/5 border-brand-primary/50 shadow-2xl"
                    : "bg-transparent border-white/5 hover:border-white/10"
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/10 blur-3xl rounded-full -mr-12 -mt-12"></div>
                )}

                <div className="flex items-center gap-5 relative z-10">
                  <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
                      isActive
                        ? "bg-brand-primary text-white scale-110 shadow-lg shadow-brand-primary/20"
                        : isCompleted
                          ? "bg-success/10 text-success"
                          : "bg-white/5 text-text-tertiary"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <h3
                      className={`font-display text-sm font-black uppercase tracking-widest ${isActive ? "text-white" : "text-text-tertiary group-hover:text-text-secondary"}`}
                    >
                      {s.title}
                    </h3>
                    <p className="text-[10px] text-text-tertiary mt-1 font-bold uppercase tracking-wider">
                      {s.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="lg:col-span-8">
          <div className="bg-[#0c0c0e] border border-white/5 rounded-[3.5rem] p-8 md:p-16 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-primary/5 blur-[100px] rounded-full -mr-48 -mt-48 pointer-events-none"></div>

            <div className="relative z-10">
              {/* STEP 1: FORMAT & STAGES */}
              {step === "1" && (
                <form
                  action={async (formData) => {
                    "use server";
                    await saveTournamentSetup(formData);
                  }}
                  className="space-y-10"
                >
                  <input
                    type="hidden"
                    name="tournament_id"
                    value={tournament.id}
                  />

                  <div className="space-y-4">
                    <div className="h-1 w-12 bg-brand-primary"></div>
                    <h2 className="font-display text-4xl font-black uppercase tracking-tighter text-white">
                      {t("stage_config")}
                    </h2>
                    <p className="text-text-tertiary text-sm font-medium">
                      {t("stage_desc")}
                    </p>
                  </div>

                  <div className="space-y-8 p-10 bg-white/2 border border-white/5 rounded-[2.5rem]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label
                          htmlFor="participant_type"
                          className="text-xs font-bold uppercase tracking-[0.2em] text-text-tertiary ml-1"
                        >
                          {t("participant_type")}
                        </Label>
                        <Select
                          name="participant_type"
                          defaultValue={tournament.participant_type}
                        >
                          <SelectTrigger 
                            id="participant_type"
                            aria-label={t("participant_type")}
                            className="h-14 bg-white/5 border-white/10 rounded-xl focus:border-brand-primary transition-all text-white font-bold"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0c0c0e] border-white/10 text-white">
                            <SelectItem value="player">
                              {t("type_player")}
                            </SelectItem>
                            <SelectItem value="team">
                              {t("type_team")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label
                          htmlFor="stage_type"
                          className="text-xs font-bold uppercase tracking-[0.2em] text-text-tertiary ml-1"
                        >
                          {t("format_type")}
                        </Label>
                        <Select
                          name="stage_type"
                          defaultValue={
                            stages?.[0]?.stage_type || "single_elimination"
                          }
                        >
                          <SelectTrigger 
                            id="stage_type"
                            aria-label={t("format_type")}
                            className="h-14 bg-white/5 border-white/10 rounded-xl focus:border-brand-primary transition-all text-white font-bold"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0c0c0e] border-white/10 text-white">
                            <SelectItem value="single_elimination">
                              Single Elimination
                            </SelectItem>
                            <SelectItem value="double_elimination">
                              Double Elimination
                            </SelectItem>
                            <SelectItem value="round_robin">
                              Round Robin
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="stage_name"
                        className="text-xs font-bold uppercase tracking-[0.2em] text-text-tertiary ml-1"
                      >
                        {t("stage_name")}
                      </Label>
                      <Input
                        id="stage_name"
                        name="stage_name"
                        defaultValue={stages?.[0]?.name || "Main Event"}
                        required
                        className="h-14 bg-white/5 border-white/10 rounded-xl focus:border-brand-primary transition-all text-white font-bold"
                      />
                    </div>

                    <div className="pt-6 border-t border-white/5 space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="h-1 w-8 bg-brand-primary"></div>
                        <h3 className="font-display text-sm font-black uppercase tracking-widest text-white">
                          {t("team_size_config")}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <Label
                            htmlFor="team_min_players"
                            className="text-xs font-bold uppercase tracking-[0.2em] text-text-tertiary ml-1"
                          >
                            {t("min_players")}
                          </Label>
                          <Input
                            type="number"
                            id="team_min_players"
                            name="team_min_players"
                            defaultValue={tournament.team_min_players || 1}
                            min={1}
                            required
                            className="h-14 bg-white/5 border-white/10 rounded-xl focus:border-brand-primary transition-all text-white font-bold"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label
                            htmlFor="team_max_players"
                            className="text-xs font-bold uppercase tracking-[0.2em] text-text-tertiary ml-1"
                          >
                            {t("max_players")}
                          </Label>
                          <Input
                            type="number"
                            id="team_max_players"
                            name="team_max_players"
                            defaultValue={tournament.team_max_players || 5}
                            min={1}
                            required
                            className="h-14 bg-white/5 border-white/10 rounded-xl focus:border-brand-primary transition-all text-white font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end">
                    <Button
                      type="submit"
                      className="bg-brand-primary text-white hover:bg-white hover:text-black transition-all font-black uppercase tracking-widest px-10 h-16 rounded-2xl shadow-[0_0_30px_rgba(244,0,9,0.3)]"
                    >
                      {tCommon("save")} & {tCommon("view_all")}
                    </Button>
                  </div>
                </form>
              )}

              {/* STEP 2: REGISTRATION SETTINGS */}
              {step === "2" && (
                <form
                  action={async (formData) => {
                    "use server";
                    await saveRegistrationSettings(formData);
                  }}
                  className="space-y-10"
                >
                  <input
                    type="hidden"
                    name="tournament_id"
                    value={tournament.id}
                  />

                  <div className="space-y-4">
                    <div className="h-1 w-12 bg-brand-primary"></div>
                    <h2 className="font-display text-4xl font-black uppercase tracking-tighter text-white">
                      {t("access_control")}
                    </h2>
                    <p className="text-text-tertiary text-sm font-medium">
                      {t("access_desc")}
                    </p>
                  </div>

                  <div className="space-y-8">
                    <label className="flex items-center justify-between p-8 bg-white/2 border border-white/5 rounded-[2.5rem] group hover:border-brand-primary/30 transition-all cursor-pointer relative overflow-hidden">
                      <div className="space-y-1 relative z-10">
                        <span className="text-lg font-black uppercase tracking-tight text-white block">
                          {t("open_reg")}
                        </span>
                        <p className="text-xs text-text-tertiary font-medium">
                          {t("open_reg_desc")}
                        </p>
                      </div>
                      <div className="relative inline-flex items-center z-10">
                        <input
                          type="checkbox"
                          name="registration_enabled"
                          defaultChecked={tournament.registration_enabled}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-8 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-text-tertiary after:border-white after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:bg-white peer-checked:bg-brand-primary transition-all"></div>
                      </div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-[40px] rounded-full -mr-16 -mt-16"></div>
                    </label>

                    <div className="space-y-4">
                      <Label className="text-xs font-bold uppercase tracking-[0.2em] text-text-tertiary ml-1">
                        {t("approval_mode")}
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="relative cursor-pointer group">
                          <input
                            type="radio"
                            name="registration_mode"
                            value="auto"
                            className="sr-only peer"
                            defaultChecked={
                              tournament.registration_mode === "auto" ||
                              !tournament.registration_mode
                            }
                          />
                          <div className="h-full p-6 rounded-[2.5rem] border border-white/5 bg-white/2 transition-all duration-300 peer-checked:border-brand-primary peer-checked:bg-brand-primary/5 hover:border-white/20 group-hover:translate-y-[-2px] relative overflow-hidden">
                            <div className="flex items-center gap-4 mb-3 relative z-10">
                              <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-text-tertiary peer-checked:text-brand-primary transition-colors">
                                <Zap className="h-6 w-6" />
                              </div>
                              <h3 className="font-display text-sm font-black uppercase tracking-widest text-white">
                                {t("auto_title")}
                              </h3>
                            </div>
                            <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-wider leading-relaxed relative z-10">
                              {t("auto_desc")}
                            </p>
                            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/10 blur-[50px] rounded-full -mr-12 -mt-12 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                          </div>
                        </label>

                        <label className="relative cursor-pointer group">
                          <input
                            type="radio"
                            name="registration_mode"
                            value="manual"
                            className="sr-only peer"
                            defaultChecked={
                              tournament.registration_mode === "manual"
                            }
                          />
                          <div className="h-full p-6 rounded-[2.5rem] border border-white/5 bg-white/2 transition-all duration-300 peer-checked:border-brand-primary peer-checked:bg-brand-primary/5 hover:border-white/20 group-hover:translate-y-[-2px] relative overflow-hidden">
                            <div className="flex items-center gap-4 mb-3 relative z-10">
                              <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-text-tertiary peer-checked:text-brand-primary transition-colors">
                                <ShieldCheck className="h-6 w-6" />
                              </div>
                              <h3 className="font-display text-sm font-black uppercase tracking-widest text-white">
                                {t("manual_title")}
                              </h3>
                            </div>
                            <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-wider leading-relaxed relative z-10">
                              {t("manual_desc")}
                            </p>
                            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/10 blur-[50px] rounded-full -mr-12 -mt-12 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label
                        htmlFor="registration_deadline"
                        className="text-xs font-bold uppercase tracking-[0.2em] text-text-tertiary ml-1"
                      >
                        {t("deadline")}
                      </Label>
                      <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-brand-primary transition-colors">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <Input
                          id="registration_deadline"
                          name="registration_deadline"
                          type="datetime-local"
                          defaultValue={
                            tournament.registration_deadline
                              ? new Date(tournament.registration_deadline)
                                  .toISOString()
                                  .slice(0, 16)
                              : ""
                          }
                          className="h-16 pl-14 bg-white/5 border-white/10 rounded-2xl focus:border-brand-primary transition-all text-white font-bold text-sm"
                        />
                      </div>
                      <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-wider ml-1 italic opacity-60">
                        {t("deadline_hint")}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-between">
                    <Link
                      href={`/organizer/tournaments/${tournamentId}/setup?step=1`}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        className="h-16 px-8 rounded-2xl border-white/10 hover:bg-white/5 font-black uppercase tracking-widest text-xs"
                      >
                        {tCommon("back")}
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      className="bg-brand-primary text-white hover:bg-white hover:text-black transition-all font-black uppercase tracking-widest px-10 h-16 rounded-2xl shadow-[0_0_30px_rgba(244,0,9,0.3)]"
                    >
                      {tCommon("save")} & {tCommon("manage")}
                    </Button>
                  </div>
                </form>
              )}

              {/* STEP 3: PUBLISH */}
              {step === "3" && (
                <form
                  action={async (formData) => {
                    "use server";
                    await publishTournament(formData);
                  }}
                  className="space-y-10"
                >
                  <input
                    type="hidden"
                    name="tournament_id"
                    value={tournament.id}
                  />

                  <div className="space-y-4">
                    <div className="h-1 w-12 bg-brand-primary"></div>
                    <h2 className="font-display text-4xl font-black uppercase tracking-tighter text-white">
                      {t("final_review")}
                    </h2>
                    <p className="text-text-tertiary text-sm font-medium">
                      {t("ready_live")}
                    </p>
                  </div>

                  <div className="space-y-6 bg-white/2 border border-white/5 rounded-[2.5rem] p-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                      <div className="space-y-1">
                        <span className="text-xs text-text-tertiary font-bold uppercase tracking-[0.2em]">
                          Tournament Name
                        </span>
                        <span className="font-black text-xl text-white uppercase tracking-tight block leading-tight">
                          {tournament.name}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-text-tertiary font-bold uppercase tracking-[0.2em]">
                          Game Arena
                        </span>
                        <span className="font-black text-xl text-white uppercase tracking-tight block leading-tight">
                          {tournament.games?.name || "Custom"}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-text-tertiary font-bold uppercase tracking-[0.2em]">
                          Format
                        </span>
                        <span className="font-black text-xl text-white uppercase tracking-tight block leading-tight">
                          {tournament.match_type}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-text-tertiary font-bold uppercase tracking-[0.2em]">
                          Stage Type
                        </span>
                        <span className="font-black text-xl text-white uppercase tracking-tight block leading-tight">
                          {stages?.[0]?.stage_type?.replace("_", " ") ||
                            "Not Configured"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-brand-primary/5 border border-brand-primary/20 rounded-[2rem] flex items-center gap-6">
                    <div className="h-12 w-12 rounded-xl bg-brand-primary/20 flex items-center justify-center text-brand-primary shrink-0">
                      <Settings2 className="h-6 w-6 animate-pulse" />
                    </div>
                    <p className="text-xs text-text-secondary font-medium leading-relaxed italic">
                      {t("double_check")}
                    </p>
                  </div>

                  <div className="pt-6 flex justify-between">
                    <Link
                      href={`/organizer/tournaments/${tournamentId}/setup?step=2`}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        className="h-16 px-8 rounded-2xl border-white/10 hover:bg-white/5 font-black uppercase tracking-widest text-xs"
                      >
                        {tCommon("back")}
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      className="bg-brand-primary text-white hover:bg-white hover:text-black transition-all font-black uppercase tracking-widest px-12 h-16 rounded-2xl shadow-[0_0_40px_rgba(244,0,9,0.4)]"
                    >
                      {t("finish_publish")}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
