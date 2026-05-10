"use client";

import { useState } from "react";
import { Link } from "@/lib/i18n/routing";
import { createTournament } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Gamepad2,
  Swords,
  Calendar,
  Trophy,
  Users as UsersIcon,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface Game {
  id: string;
  name: string;
}

interface Platform {
  id: string;
  name: string;
}

interface Tournament {
  id?: string;
  name?: string;
  description?: string;
  status?: string;
  banner_url?: string;
  game_id?: string;
  participant_type?: "team" | "player";
  match_type?: "duel" | "ffa";
  registration_enabled?: boolean;
  registration_mode?: "auto" | "manual";
  registration_deadline?: string;
  start_date?: string;
  end_date?: string;
  size?: number;
  team_min_players?: number;
  team_max_players?: number;
  rules?: string;
  prize_info?: string;
}

interface TournamentFormProps {
  projectId: string;
  games: Game[];
  platforms: Platform[];
  initialData?: Tournament; // For future edit support
}

export function TournamentForm({
  projectId,
  games,
  platforms,
  initialData,
}: TournamentFormProps) {
  const t = useTranslations("Organizer.forms");
  const common = useTranslations("Common");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [regEnabled, setRegEnabled] = useState(
    initialData?.registration_enabled ?? false,
  );

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    formData.append("project_id", projectId);
    formData.append("registration_enabled", String(regEnabled));

    if (formData.get("game_id") === "none") {
      setError(t("error_select_game"));
      setPending(false);
      return;
    }

    const result = await createTournament(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <form
      action={handleSubmit}
      className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32"
    >
      {error && (
        <div className="p-6 bg-error/10 border border-error/20 rounded-[2rem] flex items-center gap-4 text-error animate-shake">
          <ShieldAlert className="h-6 w-6 shrink-0" />
          <div className="text-sm font-black uppercase tracking-widest">
            {error}
          </div>
        </div>
      )}

      {/* SECTION 1: CORE IDENTITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
            <Gamepad2 className="h-7 w-7" />
          </div>
          <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white">
            {t("identity")}
          </h2>
          <p className="text-text-tertiary text-sm leading-relaxed font-medium">
            {t("identity_desc")}
          </p>
        </div>

        <div className="lg:col-span-2 space-y-8 bg-[#0c0c0e] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-brand-primary/10 transition-all duration-700"></div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label
                htmlFor="name"
                className="text-sm font-black uppercase tracking-[0.2em] text-text-tertiary flex items-center gap-2"
              >
                {t("name")} <span className="text-brand-primary">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder={t("placeholder_name")}
                required
                defaultValue={initialData?.name}
                className="bg-white/5 border-white/10 h-16 rounded-2xl text-white font-bold text-lg focus:ring-brand-primary transition-all px-8"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label
                  htmlFor="game_id"
                  className="text-sm font-black uppercase tracking-[0.2em] text-text-tertiary"
                >
                  {t("title")}
                </Label>
                <Select
                  name="game_id"
                  defaultValue={initialData?.game_id || "none"}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 h-16 rounded-2xl text-white font-bold px-8">
                    <SelectValue placeholder={t("placeholder_game")} />
                  </SelectTrigger>
                  <SelectContent className="bg-bg-secondary border-white/10 z-50">
                    <SelectItem value="none">{t("cat_other")}</SelectItem>
                    {games.map((game) => (
                      <SelectItem key={game.id} value={game.id}>
                        {game.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="banner_url"
                  className="text-sm font-black uppercase tracking-[0.2em] text-text-tertiary"
                >
                  {t("banner")}
                </Label>
                <Input
                  id="banner_url"
                  name="banner_url"
                  placeholder={t("placeholder_url")}
                  defaultValue={initialData?.banner_url}
                  className="bg-white/5 border-white/10 h-16 rounded-2xl text-white font-bold px-8"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: FORMAT & LOGISTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-success/10 flex items-center justify-center text-success border border-success/20">
            <Swords className="h-7 w-7" />
          </div>
          <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white">
            {t("logistics")}
          </h2>
          <p className="text-text-tertiary text-sm leading-relaxed font-medium">
            {t("logistics_desc")}
          </p>
        </div>

        <div className="lg:col-span-2 space-y-8 bg-[#0c0c0e] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label
                htmlFor="match_type"
                className="text-sm font-black uppercase tracking-[0.2em] text-text-tertiary"
              >
                {t("format")}
              </Label>
              <Select
                name="match_type"
                defaultValue={initialData?.match_type || "duel"}
              >
                <SelectTrigger className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-bg-secondary border-white/10 z-50">
                  <SelectItem value="duel">{t("format_duel")}</SelectItem>
                  <SelectItem value="ffa">{t("format_ffa")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="size"
                className="text-sm font-black uppercase tracking-[0.2em] text-text-tertiary"
              >
                {t("slots")} (2-256)
              </Label>
              <Input
                id="size"
                name="size"
                type="number"
                min="2"
                max="256"
                defaultValue={initialData?.size || "32"}
                required
                className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold"
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="participant_type"
                className="text-sm font-black uppercase tracking-[0.2em] text-text-tertiary"
              >
                {t("entry_type")}
              </Label>
              <Select
                name="participant_type"
                defaultValue={initialData?.participant_type || "team"}
              >
                <SelectTrigger className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-bg-secondary border-white/10 z-50">
                  <SelectItem value="team">{t("type_team")}</SelectItem>
                  <SelectItem value="player">{t("type_player")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-black uppercase tracking-[0.2em] text-text-tertiary mb-3 block">
                {t("platforms")}
              </Label>
              <div className="flex flex-wrap gap-4">
                {platforms.map((platform) => (
                  <label
                    key={platform.id}
                    className="flex items-center gap-3 bg-white/2 hover:bg-white/5 border border-white/5 hover:border-brand-primary/50 px-4 py-2 rounded-xl cursor-pointer transition-all group"
                  >
                    <input
                      type="checkbox"
                      name="platforms"
                      value={platform.id}
                      className="accent-brand-primary"
                    />
                    <span className="text-xs font-bold text-text-secondary group-hover:text-white">
                      {platform.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: REGISTRATION & SCHEDULING */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-info/10 flex items-center justify-center text-info border border-info/20">
            <Calendar className="h-7 w-7" />
          </div>
          <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white">
            {t("schedule")}
          </h2>
          <p className="text-text-tertiary text-sm leading-relaxed font-medium">
            {t("schedule_desc")}
          </p>
        </div>

        <div className="lg:col-span-2 space-y-8 bg-[#0c0c0e] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl">
          <div className="flex items-center justify-between p-6 bg-white/2 rounded-2xl border border-white/5">
            <div className="flex items-center gap-4">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${regEnabled ? "bg-success/20 text-success" : "bg-white/5 text-text-tertiary"}`}
              >
                <UsersIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-black text-white uppercase tracking-tight">
                  {t("enable_reg")}
                </div>
                <div className="text-xs text-text-tertiary font-bold uppercase tracking-widest">
                  {t("enable_reg_desc")}
                </div>
              </div>
            </div>
            <Switch checked={regEnabled} onCheckedChange={setRegEnabled} />
          </div>

          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-8 transition-all duration-500 ${regEnabled ? "opacity-100" : "opacity-40 pointer-events-none grayscale"}`}
          >
            <div className="space-y-3">
              <Label
                htmlFor="registration_mode"
                className="text-sm font-black uppercase tracking-[0.2em] text-text-tertiary"
              >
                {t("reg_mode")}
              </Label>
              <Select
                name="registration_mode"
                defaultValue={initialData?.registration_mode || "auto"}
              >
                <SelectTrigger className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-bg-secondary border-white/10 z-50">
                  <SelectItem value="auto">{t("mode_auto")}</SelectItem>
                  <SelectItem value="manual">{t("mode_manual")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label
                htmlFor="registration_deadline"
                className="text-sm font-black uppercase tracking-[0.2em] text-text-tertiary"
              >
                {t("reg_deadline")}
              </Label>
              <Input
                id="registration_deadline"
                name="registration_deadline"
                type="datetime-local"
                defaultValue={initialData?.registration_deadline?.split(".")[0]}
                className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label
                htmlFor="start_date"
                className="text-sm font-black uppercase tracking-[0.2em] text-text-tertiary"
              >
                {t("start_date")}
              </Label>
              <Input
                id="start_date"
                name="start_date"
                type="datetime-local"
                defaultValue={initialData?.start_date?.split(".")[0]}
                className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold"
              />
            </div>
            <div className="space-y-3">
              <Label
                htmlFor="end_date"
                className="text-sm font-black uppercase tracking-[0.2em] text-text-tertiary"
              >
                {t("end_date")}
              </Label>
              <Input
                id="end_date"
                name="end_date"
                type="datetime-local"
                defaultValue={initialData?.end_date?.split(".")[0]}
                className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/5">
            <div className="space-y-3">
              <Label
                htmlFor="team_min_players"
                className="text-sm font-black uppercase tracking-[0.2em] text-text-tertiary"
              >
                {t("team_min")}
              </Label>
              <Input
                id="team_min_players"
                name="team_min_players"
                type="number"
                min="1"
                defaultValue={initialData?.team_min_players || "1"}
                className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold"
              />
            </div>
            <div className="space-y-3">
              <Label
                htmlFor="team_max_players"
                className="text-sm font-black uppercase tracking-[0.2em] text-text-tertiary"
              >
                {t("team_max")}
              </Label>
              <Input
                id="team_max_players"
                name="team_max_players"
                type="number"
                min="1"
                defaultValue={initialData?.team_max_players || "5"}
                className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: CONTENT & INFORMATION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-warning/10 flex items-center justify-center text-warning border border-warning/20">
            <Trophy className="h-7 w-7" />
          </div>
          <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white">
            {t("content")}
          </h2>
          <p className="text-text-tertiary text-sm leading-relaxed font-medium">
            {t("content_desc")}
          </p>
        </div>

        <div className="lg:col-span-2 space-y-8 bg-[#0c0c0e] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl">
          <div className="space-y-3">
            <Label
              htmlFor="description"
              className="text-sm font-black uppercase tracking-[0.2em] text-text-tertiary"
            >
              {t("description")}
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder={t("placeholder_desc")}
              defaultValue={initialData?.description}
              className="bg-white/5 border-white/10 min-h-[120px] rounded-2xl p-6 text-white font-medium focus:ring-brand-primary"
            />
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="rules"
              className="text-sm font-black uppercase tracking-[0.2em] text-text-tertiary"
            >
              {t("rules")}
            </Label>
            <Textarea
              id="rules"
              name="rules"
              placeholder={t("placeholder_rules")}
              defaultValue={initialData?.rules}
              className="bg-white/5 border-white/10 min-h-[120px] rounded-2xl p-6 text-white font-medium focus:ring-brand-primary"
            />
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="prize_info"
              className="text-sm font-black uppercase tracking-[0.2em] text-text-tertiary"
            >
              {t("prizes")}
            </Label>
            <Textarea
              id="prize_info"
              name="prize_info"
              placeholder={t("placeholder_prizes")}
              defaultValue={initialData?.prize_info}
              className="bg-white/5 border-white/10 min-h-[120px] rounded-2xl p-6 text-white font-medium focus:ring-brand-primary"
            />
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="fixed bottom-0 left-0 right-0 p-8 bg-[#050505]/80 backdrop-blur-3xl border-t border-white/5 z-[60] flex justify-center md:justify-end gap-6 max-w-7xl mx-auto rounded-t-[3rem]">
        <Link href={`/organizer/projects/${projectId}`}>
          <Button
            type="button"
            variant="ghost"
            className="text-xs font-black uppercase tracking-widest text-text-tertiary hover:text-white h-16 px-10"
          >
            {common("cancel")}
          </Button>
        </Link>
        <Button
          type="submit"
          disabled={pending}
          className="bg-brand-primary text-white hover:bg-white hover:text-black h-16 px-16 rounded-2xl font-black uppercase tracking-widest shadow-[0_0_50px_rgba(244,0,9,0.5)] transition-all group"
        >
          {pending ? (
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>{common("loading")}</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span>
                {initialData ? t("update_tournament") : t("init_arena")}
              </span>
              <ChevronRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
            </div>
          )}
        </Button>
      </div>
    </form>
  );
}
