"use client";

import { useState, useRef } from "react";
import { Link } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useTranslations } from "next-intl";
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
  ShieldAlert,
  Loader2,
  Rocket,
  Upload,
  X,
  Image as ImageIcon,
  Check,
  User,
  Briefcase,
  Skull,
  Zap,
  AlignLeft,
  FileText,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Game {
  id: string;
  name: string;
  cover_url?: string;
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
  initialData?: Tournament;
  initialPlatforms?: string[];
  submitAction: (
    formData: FormData,
  ) => Promise<{ error?: string; success?: boolean }>;
  cancelHref: string;
}

export function TournamentForm({
  projectId,
  games,
  platforms,
  initialData,
  initialPlatforms = [],
  submitAction,
  cancelHref,
}: TournamentFormProps) {
  const t = useTranslations("Organizer.forms");
  const common = useTranslations("Common");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [regEnabled, setRegEnabled] = useState(
    initialData?.registration_enabled ?? false,
  );

  // States for enhanced inputs
  const [selectedGame, setSelectedGame] = useState(initialData?.game_id || "");
  const [selectedPlatforms, setSelectedPlatforms] =
    useState<string[]>(initialPlatforms);
  const [participantType, setParticipantType] = useState<"team" | "player">(
    initialData?.participant_type || "team",
  );
  const [matchType, setMatchType] = useState<"duel" | "ffa">(
    initialData?.match_type || "duel",
  );
  const [registrationMode, setRegistrationMode] = useState<"auto" | "manual">(
    initialData?.registration_mode || "auto",
  );

  // Banner Upload State
  const [bannerPreview, setBannerPreview] = useState<string | null>(
    initialData?.banner_url || null,
  );
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBannerPreview(url);
    }
  };

  const clearBanner = () => {
    setBannerPreview(null);
    if (bannerInputRef.current) {
      bannerInputRef.current.value = "";
    }
  };

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  async function handleSubmit(formData: FormData) {
    setPending(true);
    if (!selectedGame) {
      setError(t("error_select_game"));
      setPending(false);
      return;
    }

    formData.append("project_id", projectId);
    formData.append("registration_enabled", String(regEnabled));
    formData.append("game_id", selectedGame);
    formData.append("participant_type", participantType);
    formData.append("match_type", matchType);
    formData.append("registration_mode", registrationMode);

    selectedPlatforms.forEach((p) => formData.append("platforms", p));

    const result = await submitAction(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  // Helper to format date for datetime-local input
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toISOString().slice(0, 16);
  };

  return (
    <form
      action={handleSubmit}
      className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32"
    >
      {error && (
        <div className="p-6 bg-error/10 border border-error/20 rounded-[2rem] flex items-center gap-4 text-error animate-shake sticky top-24 z-50 backdrop-blur-md">
          <ShieldAlert className="h-6 w-6 shrink-0" />
          <div className="text-sm font-black uppercase tracking-widest">
            {error}
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto text-error/60 hover:text-error"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* SECTION 1: IDENTITY & ASSETS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
            <Briefcase className="h-7 w-7" />
          </div>
          <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white">
            {t("brand")}
          </h2>
          <p className="text-text-tertiary text-sm leading-relaxed font-medium">
            {t("brand_desc")}
          </p>
        </div>

        <div className="lg:col-span-2 space-y-8 bg-[#0c0c0e] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label
                  htmlFor="name"
                  className="text-xs font-black uppercase tracking-[0.15em] text-text-tertiary mb-2 block flex items-center gap-2"
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
              <div className="space-y-3">
                <Label
                  htmlFor="status"
                  className="text-xs font-black uppercase tracking-[0.15em] text-text-tertiary mb-2 block"
                >
                  {t("status")}
                </Label>
                <Select
                  name="status"
                  defaultValue={initialData?.status || "draft"}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 h-16 rounded-2xl text-white font-bold px-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-bg-secondary border-white/10 z-50">
                    <SelectItem value="draft">{common("draft")}</SelectItem>
                    <SelectItem value="registration_open">
                      {common("registration_open")}
                    </SelectItem>
                    <SelectItem value="registration_closed">
                      {common("registration_closed")}
                    </SelectItem>
                    <SelectItem value="in_progress">
                      {common("in_progress")}
                    </SelectItem>
                    <SelectItem value="completed">
                      {common("completed")}
                    </SelectItem>
                    <SelectItem value="cancelled">
                      {common("cancelled")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="description"
                className="text-xs font-black uppercase tracking-[0.15em] text-text-tertiary mb-2 block"
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
              <Label className="text-xs font-black uppercase tracking-[0.15em] text-text-tertiary mb-2 block">
                {t("banner")}
              </Label>
              <div className="space-y-4">
                <div className="relative w-full aspect-[21/9] rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center group/banner">
                  {bannerPreview ? (
                    <>
                      <Image
                        src={bannerPreview}
                        alt="Banner Preview"
                        fill
                        sizes="(max-width: 1200px) 100vw, 800px"
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={clearBanner}
                        className="absolute top-4 right-4 h-10 w-10 bg-error/80 backdrop-blur-md text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 hover:bg-error transition-all opacity-0 group-hover/banner:opacity-100"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-text-tertiary opacity-40">
                      <ImageIcon className="h-12 w-12" />
                      <span className="text-xs font-black uppercase tracking-[0.3em]">
                        {t("no_banner")}
                      </span>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  name="banner_file"
                  ref={bannerInputRef}
                  onChange={handleBannerChange}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => bannerInputRef.current?.click()}
                  className="w-full h-14 rounded-xl border-white/10 hover:bg-white/5 font-black uppercase tracking-widest text-xs"
                >
                  <Upload className="mr-2 h-4 w-4" />{" "}
                  {bannerPreview ? t("change_image") : t("select_image")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: GAME SELECTION GRID */}
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
            <Gamepad2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white">
              {t("title")}
            </h2>
            <p className="text-text-tertiary text-xs font-black uppercase tracking-[0.2em]">
              {t("title_desc")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {games.map((game) => (
            <button
              key={game.id}
              type="button"
              onClick={() => {
                setSelectedGame(game.id);
                setError(null);
              }}
              className={cn(
                "group relative aspect-[3/4] rounded-2xl border transition-all overflow-hidden",
                selectedGame === game.id
                  ? "border-brand-primary shadow-[0_0_40px_rgba(244,0,9,0.3)] scale-[1.02]"
                  : "border-white/5 hover:border-white/20",
              )}
            >
              {game.cover_url ? (
                <Image
                  src={game.cover_url}
                  alt={game.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 200px"
                  className={cn(
                    "object-cover transition-all duration-700 group-hover:scale-110",
                    selectedGame !== game.id &&
                      "grayscale opacity-40 hover:grayscale-0 hover:opacity-100",
                  )}
                />
              ) : (
                <div className="h-full w-full bg-white/5 flex items-center justify-center">
                  <Gamepad2 className="h-10 w-10 text-text-tertiary opacity-20" />
                </div>
              )}
              <div
                className={cn(
                  "absolute inset-0 transition-opacity",
                  selectedGame === game.id
                    ? "bg-brand-primary/20"
                    : "bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60",
                )}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-xs font-black uppercase tracking-widest text-white leading-tight drop-shadow-lg">
                  {game.name}
                </p>
              </div>
              {selectedGame === game.id && (
                <div className="absolute top-3 right-3 h-6 w-6 bg-brand-primary text-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 3: LOGISTICS & PARTICIPANTS */}
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

        <div className="lg:col-span-2 space-y-10 bg-[#0c0c0e] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Label className="text-xs font-black uppercase tracking-[0.15em] text-text-tertiary">
                {t("entry_type")}
              </Label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setParticipantType("player")}
                  className={cn(
                    "flex-1 p-4 rounded-xl border transition-all flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px]",
                    participantType === "player"
                      ? "bg-brand-primary border-brand-primary text-white"
                      : "bg-white/2 border-white/5 text-text-tertiary hover:border-white/10",
                  )}
                >
                  <User className="h-4 w-4" />
                  {t("type_player")}
                </button>
                <button
                  type="button"
                  onClick={() => setParticipantType("team")}
                  className={cn(
                    "flex-1 p-4 rounded-xl border transition-all flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs",
                    participantType === "team"
                      ? "bg-brand-primary border-brand-primary text-white"
                      : "bg-white/2 border-white/5 text-text-tertiary hover:border-white/10",
                  )}
                >
                  <UsersIcon className="h-4 w-4" />
                  {t("type_team")}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-xs font-black uppercase tracking-[0.15em] text-text-tertiary">
                {t("format")}
              </Label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setMatchType("duel")}
                  className={cn(
                    "flex-1 p-4 rounded-xl border transition-all flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px]",
                    matchType === "duel"
                      ? "bg-brand-primary border-brand-primary text-white"
                      : "bg-white/2 border-white/5 text-text-tertiary hover:border-white/10",
                  )}
                >
                  <Zap className="h-4 w-4" />
                  {t("format_duel")}
                </button>
                <button
                  type="button"
                  onClick={() => setMatchType("ffa")}
                  className={cn(
                    "flex-1 p-4 rounded-xl border transition-all flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs",
                    matchType === "ffa"
                      ? "bg-brand-primary border-brand-primary text-white"
                      : "bg-white/2 border-white/5 text-text-tertiary hover:border-white/10",
                  )}
                >
                  <Skull className="h-4 w-4" />
                  {t("format_ffa")}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/5">
            <div className="space-y-3">
              <Label
                htmlFor="size"
                className="text-xs font-black uppercase tracking-[0.15em] text-text-tertiary"
              >
                {t("slots")} (2-256)
              </Label>
              <Input
                id="size"
                name="size"
                type="number"
                defaultValue={initialData?.size || "32"}
                required
                className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold"
              />
            </div>
            <div className="space-y-4">
              <Label className="text-xs font-black uppercase tracking-[0.15em] text-text-tertiary">
                {t("platforms")}
              </Label>
              <div className="flex flex-wrap gap-2">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => togglePlatform(platform.id)}
                    className={cn(
                      "px-4 py-2 rounded-lg border text-xs font-black uppercase tracking-widest transition-all",
                      selectedPlatforms.includes(platform.id)
                        ? "bg-brand-primary border-brand-primary text-white shadow-lg"
                        : "bg-white/5 border-white/10 text-text-tertiary hover:border-white/20",
                    )}
                  >
                    {platform.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {participantType === "team" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5 animate-in slide-in-from-top-4 duration-500">
              <div className="space-y-3">
                <Label
                  htmlFor="team_min_players"
                  className="text-xs font-black uppercase tracking-[0.15em] text-text-tertiary"
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
                  className="text-xs font-black uppercase tracking-[0.15em] text-text-tertiary"
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
          )}
        </div>
      </div>

      {/* SECTION 4: SCHEDULING & REGISTRATION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-info/10 flex items-center justify-center text-info border border-info/20">
            <Calendar className="h-7 w-7" />
          </div>
          <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white">
            {t("schedule")}
          </h2>
          <p className="text-text-tertiary text-sm font-medium">
            {t("schedule_desc")}
          </p>
        </div>
        <div className="lg:col-span-2 space-y-10 bg-[#0c0c0e] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label
                htmlFor="start_date"
                className="text-xs font-black uppercase tracking-[0.15em] text-text-tertiary"
              >
                {t("start_date")}
              </Label>
              <Input
                id="start_date"
                name="start_date"
                type="datetime-local"
                defaultValue={formatDate(initialData?.start_date)}
                className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold"
              />
            </div>
            <div className="space-y-3">
              <Label
                htmlFor="end_date"
                className="text-xs font-black uppercase tracking-[0.15em] text-text-tertiary"
              >
                {t("end_date")}
              </Label>
              <Input
                id="end_date"
                name="end_date"
                type="datetime-local"
                defaultValue={formatDate(initialData?.end_date)}
                className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold"
              />
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 space-y-8">
            <div className="flex items-center justify-between p-6 bg-white/2 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4">
                <UsersIcon
                  className={cn(
                    "h-5 w-5",
                    regEnabled ? "text-success" : "text-text-tertiary",
                  )}
                />
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

            {regEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-4 duration-500">
                <div className="space-y-3">
                  <Label
                    htmlFor="registration_deadline"
                    className="text-xs font-black uppercase tracking-[0.15em] text-text-tertiary"
                  >
                    {t("reg_deadline")}
                  </Label>
                  <Input
                    id="registration_deadline"
                    name="registration_deadline"
                    type="datetime-local"
                    defaultValue={formatDate(
                      initialData?.registration_deadline,
                    )}
                    className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-[0.15em] text-text-tertiary">
                    {t("reg_mode")}
                  </Label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setRegistrationMode("auto")}
                      className={cn(
                        "flex-1 p-4 rounded-xl border transition-all flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px]",
                        registrationMode === "auto"
                          ? "bg-brand-primary border-brand-primary text-white"
                          : "bg-white/2 border-white/5 text-text-tertiary hover:border-white/10",
                      )}
                    >
                      <Zap className="h-4 w-4" />
                      {t("mode_auto")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegistrationMode("manual")}
                      className={cn(
                        "flex-1 p-4 rounded-xl border transition-all flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs",
                        registrationMode === "manual"
                          ? "bg-brand-primary border-brand-primary text-white"
                          : "bg-white/2 border-white/5 text-text-tertiary hover:border-white/10",
                      )}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      {t("mode_manual")}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 5: CONTENT (Rules, Prizes) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-warning/10 flex items-center justify-center text-warning border border-warning/20">
            <AlignLeft className="h-7 w-7" />
          </div>
          <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white">
            {t("content")}
          </h2>
          <p className="text-text-tertiary text-sm font-medium">
            {t("content_desc")}
          </p>
        </div>
        <div className="lg:col-span-2 space-y-8 bg-[#0c0c0e] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl">
          <div className="space-y-3">
            <Label
              htmlFor="rules"
              className="text-xs font-black uppercase tracking-[0.15em] text-text-tertiary flex items-center gap-2"
            >
              <FileText className="h-3 w-3" /> {t("rules")}
            </Label>
            <Textarea
              id="rules"
              name="rules"
              placeholder={t("placeholder_rules")}
              defaultValue={initialData?.rules}
              className="bg-white/5 border-white/10 min-h-[150px] rounded-2xl p-6 text-white font-medium focus:ring-brand-primary"
            />
          </div>
          <div className="space-y-3">
            <Label
              htmlFor="prize_info"
              className="text-xs font-black uppercase tracking-[0.15em] text-text-tertiary flex items-center gap-2"
            >
              <Trophy className="h-3 w-3" /> {t("prizes")}
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

      <div className="fixed bottom-0 left-0 md:left-[280px] right-0 p-8 bg-[#050505]/80 backdrop-blur-3xl border-t border-white/5 z-[60] flex justify-center md:justify-end gap-6 rounded-t-[3rem]">
        <Link href={cancelHref}>
          <Button
            type="button"
            variant="ghost"
            className="text-xs font-black uppercase tracking-widest text-text-tertiary h-16 px-10"
          >
            {common("cancel")}
          </Button>
        </Link>
        <Button
          type="submit"
          disabled={pending}
          className="bg-brand-primary text-white h-16 px-16 rounded-2xl font-black uppercase tracking-widest shadow-[0_0_50px_rgba(244,0,9,0.5)] group"
        >
          {pending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <div className="flex items-center gap-3">
              <span>{t("init_arena")}</span>
              <Rocket className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
            </div>
          )}
        </Button>
      </div>
    </form>
  );
}
