"use client";

import { useState, useTransition } from "react";
import {
  Save,
  Loader2,
  ShieldCheck,
  Settings,
  Trophy,
  User,
  Mail,
  Fingerprint,
  Info,
  ArrowLeft,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useRouter } from "@/lib/i18n/routing";
import { useTranslations } from "next-intl";
import { addManualParticipantFull } from "../actions"; // We'll need to create this action
import { toast } from "sonner";
import { Player } from "../types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/ui/ImageUpload";

export function ManualParticipantForm({
  tournamentId,
  teamMaxPlayers = 5,
  participantType = "team",
}: {
  tournamentId: string;
  teamMaxPlayers?: number;
  participantType?: "player" | "team";
}) {
  const t = useTranslations("Organizer.participants.edit_modal");
  const commonT = useTranslations("Organizer.participants");
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Local state for participant info
  const [participantInfo, setParticipantInfo] = useState({
    name: "",
    main_contact_email: "",
    seed: "",
    status: "approved",
    team_identifier: "",
    type: participantType,
    logo_url: "",
  });

  const isPlayerMode = participantType === "player";
  const effectiveMaxPlayers = isPlayerMode ? 1 : teamMaxPlayers;

  // Local state for players
  const [players, setPlayers] = useState<Partial<Player>[]>(() => {
    const initialPlayers = [];
    for (let i = 0; i < effectiveMaxPlayers; i++) {
      initialPlayers.push({
        name: "",
        email: "",
        custom_user_identifier: "",
        position: i + 1,
        is_captain: i === 0,
      });
    }
    return initialPlayers;
  });

  const router = useRouter();

  const handlePlayerChange = (
    index: number,
    field: keyof Player,
    value: Player[keyof Player],
  ) => {
    const newPlayers = [...players];

    if (field === "is_captain" && value === true) {
      newPlayers.forEach((p, i) => {
        if (i !== index) p.is_captain = false;
      });
    }

    newPlayers[index] = { ...newPlayers[index], [field]: value };
    setPlayers(newPlayers);
  };

  const handleAddParticipant = async () => {
    if (!participantInfo.name.trim()) {
      toast.error("Participant name is required");
      setActiveTab("basic");
      return;
    }

    setError(null);

    const participantData = {
      ...participantInfo,
      seed:
        participantInfo.seed === ""
          ? null
          : parseInt(participantInfo.seed as string),
    };

    const playersToSync = players.filter((p) => p.name?.trim());

    startTransition(async () => {
      // We need a full action for this
      const result = await addManualParticipantFull(
        tournamentId,
        participantData,
        playersToSync,
      );
      if (result.success) {
        toast.success("Participant added successfully");
        router.push(`/organizer/tournaments/${tournamentId}/participants`);
        router.refresh();
      } else {
        setError(result.error || "Failed to add participant");
        toast.error(result.error || "Failed to add participant");
      }
    });
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <Link
            href={`/organizer/tournaments/${tournamentId}/participants`}
            className="text-[11px] font-black uppercase tracking-[0.3em] text-text-tertiary hover:text-brand-primary transition-all flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> {commonT("back_to_dashboard")}
          </Link>
          <h1 className="font-display text-5xl font-black uppercase tracking-tighter text-white">
            {commonT("add_button")}
          </h1>
          <p className="text-text-tertiary text-sm font-bold uppercase tracking-widest">
            {t("description")}
          </p>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <Link
            href={`/organizer/tournaments/${tournamentId}/participants`}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "h-14 px-8 rounded-2xl text-sm font-black uppercase tracking-widest text-text-tertiary hover:text-white hover:bg-white/5 flex items-center justify-center",
            )}
          >
            {t("cancel_btn")}
          </Link>
          <Button
            onClick={handleAddParticipant}
            disabled={isPending}
            className="flex-1 md:flex-none h-14 px-10 bg-brand-primary text-white hover:bg-white hover:text-black font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_30px_rgba(var(--brand-primary-rgb),0.2)]"
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" /> {t("save_all")}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="bg-[#0c0c0e] border border-white/5 rounded-[3rem] p-10 md:p-16 shadow-2xl relative overflow-hidden">
        {/* TABS - Only show if not in player mode or if more than 1 player */}
        {!isPlayerMode && (
          <div className="flex flex-wrap gap-3 p-2 bg-white/[0.03] border border-white/5 rounded-[1.5rem] mb-16">
            <button
              onClick={() => setActiveTab("basic")}
              className={`flex items-center gap-2.5 px-8 h-14 rounded-xl text-[13px] font-black uppercase tracking-widest transition-all ${
                activeTab === "basic"
                  ? "bg-brand-primary text-white shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.3)]"
                  : "text-text-tertiary hover:text-white hover:bg-white/5"
              }`}
            >
              <Settings className="h-4 w-4" /> {t("tab_general")}
            </button>

            {Array.from({ length: effectiveMaxPlayers }).map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(`player-${i}`)}
                className={`flex items-center gap-2.5 px-8 h-14 rounded-xl text-[13px] font-black uppercase tracking-widest transition-all ${
                  activeTab === `player-${i}`
                    ? "bg-brand-primary text-white shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.3)]"
                    : "text-text-tertiary hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="relative">
                  <User className="h-4 w-4" />
                  {players[i]?.is_captain && (
                    <ShieldCheck className="h-2.5 w-2.5 text-brand-primary absolute -top-1 -right-1 bg-white rounded-full" />
                  )}
                </div>
                {t("tab_player", { number: i + 1 })}
                {players[i]?.name && (
                  <span className="ml-1 opacity-40 font-bold normal-case truncate max-w-[100px]">
                    ({players[i].name})
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* CONTENT */}
        <div className="min-h-[400px]">
          {error && (
            <div className="mb-8 p-6 bg-error/10 border border-error/20 rounded-[2rem] text-error text-sm font-black uppercase tracking-widest flex items-center gap-4 animate-in shake duration-500">
              <Info className="h-5 w-5" /> {error}
            </div>
          )}

          {activeTab === "basic" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-4">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-text-tertiary flex items-center gap-2">
                  <User className="h-4 w-4 text-brand-primary" />
                  {isPlayerMode ? t("player_name") : t("name_label")}
                </Label>
                <Input
                  value={participantInfo.name || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setParticipantInfo({ ...participantInfo, name: val });
                    if (isPlayerMode) {
                      handlePlayerChange(0, "name", val);
                    }
                  }}
                  placeholder={
                    isPlayerMode ? "e.g. John Doe" : "e.g. TEAM PHANTOM"
                  }
                  className="bg-white/[0.03] border-white/5 h-16 rounded-2xl text-lg font-bold px-8 focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-text-tertiary flex items-center gap-2">
                  <Mail className="h-4 w-4 text-brand-primary" />
                  {isPlayerMode ? t("player_email") : t("email_label")}
                </Label>
                <Input
                  value={
                    isPlayerMode
                      ? players[0]?.email || ""
                      : participantInfo.main_contact_email || ""
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (isPlayerMode) {
                      handlePlayerChange(0, "email", val);
                      setParticipantInfo({
                        ...participantInfo,
                        main_contact_email: val,
                      });
                    } else {
                      setParticipantInfo({
                        ...participantInfo,
                        main_contact_email: val,
                      });
                    }
                  }}
                  placeholder="manager@team.com"
                  className="bg-white/[0.03] border-white/5 h-16 rounded-2xl text-lg font-bold px-8 focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-text-tertiary flex items-center gap-2">
                  <Fingerprint className="h-4 w-4 text-brand-primary" />
                  {isPlayerMode ? t("player_custom_id") : t("team_id_label")}
                </Label>
                <Input
                  value={
                    isPlayerMode
                      ? players[0]?.custom_user_identifier || ""
                      : participantInfo.team_identifier || ""
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (isPlayerMode) {
                      handlePlayerChange(0, "custom_user_identifier", val);
                    } else {
                      setParticipantInfo({
                        ...participantInfo,
                        team_identifier: val,
                      });
                    }
                  }}
                  placeholder={isPlayerMode ? "e.g. USER-123" : "e.g. PHM-01"}
                  className="bg-white/[0.03] border-white/5 h-16 rounded-2xl text-lg font-bold px-8 focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-text-tertiary flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-brand-primary" />{" "}
                  {t("seed_label")}
                </Label>
                <Input
                  type="number"
                  value={participantInfo.seed || ""}
                  onChange={(e) =>
                    setParticipantInfo({
                      ...participantInfo,
                      seed: e.target.value,
                    })
                  }
                  placeholder="e.g. 1"
                  className="bg-white/[0.03] border-white/5 h-16 rounded-2xl text-lg font-bold px-8 focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>

              <div className="space-y-4 md:col-span-2">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-text-tertiary flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-brand-primary" />
                  {isPlayerMode ? "Player Photo / Avatar" : t("logo_label")}
                </Label>
                <ImageUpload
                  value={participantInfo.logo_url || ""}
                  onChange={(url) =>
                    setParticipantInfo({ ...participantInfo, logo_url: url })
                  }
                  bucket="participant-logos"
                  label={isPlayerMode ? "Upload Photo" : "Team Logo"}
                />
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {(() => {
                const index = parseInt(activeTab.split("-")[1]);
                const player = players[index];
                return (
                  <div className="space-y-12">
                    <div className="flex items-center gap-8 p-8 bg-white/[0.01] border border-white/5 rounded-[2rem]">
                      <div className="h-28 w-28 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-center shrink-0 relative overflow-hidden group">
                        <User className="h-12 w-12 text-text-tertiary group-hover:scale-110 transition-transform opacity-30" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-3xl font-black text-white uppercase tracking-tight">
                          {player.name ||
                            t("tab_player", { number: index + 1 })}
                        </h3>
                        <div className="flex items-center gap-3">
                          <span className="px-4 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-widest border border-brand-primary/20">
                            {player.is_captain ? "TEAM CAPTAIN" : "TEAM MEMBER"}
                          </span>
                          <span className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest">
                            POSITION #{index + 1}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                      <div className="space-y-4">
                        <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-text-tertiary">
                          {t("player_name")}
                        </Label>
                        <Input
                          value={player.name || ""}
                          onChange={(e) =>
                            handlePlayerChange(index, "name", e.target.value)
                          }
                          placeholder="Real name or In-game name"
                          className="bg-white/[0.03] border-white/5 h-16 rounded-2xl text-lg font-bold px-8 focus:ring-2 focus:ring-brand-primary/20"
                        />
                      </div>
                      <div className="space-y-4">
                        <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-text-tertiary">
                          {t("player_email")}
                        </Label>
                        <Input
                          value={player.email || ""}
                          onChange={(e) =>
                            handlePlayerChange(index, "email", e.target.value)
                          }
                          placeholder="player@email.com"
                          className="bg-white/[0.03] border-white/5 h-16 rounded-2xl text-lg font-bold px-8 focus:ring-2 focus:ring-brand-primary/20"
                        />
                      </div>
                      <div className="space-y-4">
                        <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-text-tertiary">
                          {t("player_custom_id")}
                        </Label>
                        <Input
                          value={player.custom_user_identifier || ""}
                          onChange={(e) =>
                            handlePlayerChange(
                              index,
                              "custom_user_identifier",
                              e.target.value,
                            )
                          }
                          placeholder="Discord#0000 or PSN ID"
                          className="bg-white/[0.03] border-white/5 h-16 rounded-2xl text-lg font-bold px-8 focus:ring-2 focus:ring-brand-primary/20"
                        />
                      </div>

                      <div className="space-y-4">
                        <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-text-tertiary">
                          {t("player_position")}
                        </Label>
                        <Input
                          type="number"
                          value={player.position ?? ""}
                          onChange={(e) =>
                            handlePlayerChange(
                              index,
                              "position",
                              parseInt(e.target.value),
                            )
                          }
                          className="bg-white/[0.03] border-white/5 h-16 rounded-2xl text-lg font-bold px-8 focus:ring-2 focus:ring-brand-primary/20"
                        />
                      </div>

                      <div className="flex items-center justify-between p-8 bg-white/[0.02] rounded-3xl border border-white/5 group hover:border-brand-primary/30 transition-all mt-auto">
                        <div className="flex items-center gap-5">
                          <div
                            className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all ${player.is_captain ? "bg-brand-primary/20 text-brand-primary shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.2)]" : "bg-white/5 text-text-tertiary"}`}
                          >
                            <ShieldCheck className="h-8 w-8" />
                          </div>
                          <div>
                            <span className="text-sm font-black uppercase tracking-widest text-white block mb-1">
                              {t("player_captain")}
                            </span>
                            <span className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest">
                              DESIGNATE AS SQUAD LEADER
                            </span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={player.is_captain}
                          onChange={(e) =>
                            handlePlayerChange(
                              index,
                              "is_captain",
                              e.target.checked,
                            )
                          }
                          className="h-7 w-7 rounded-lg accent-brand-primary cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
