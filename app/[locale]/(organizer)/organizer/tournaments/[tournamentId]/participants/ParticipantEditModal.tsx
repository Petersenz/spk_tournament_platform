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
  Layers,
  ChevronRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PremiumModal } from "@/components/ui/PremiumModal";
import { syncRoster } from "./actions";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Player, Participant } from "./types";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/ImageUpload";

export function ParticipantEditModal({
  participant,
  tournamentId,
  isOpen,
  onClose,
  teamMaxPlayers = 5,
}: {
  participant: Participant;
  tournamentId: string;
  isOpen: boolean;
  onClose: () => void;
  teamMaxPlayers?: number;
}) {
  const t = useTranslations("Organizer.participants.edit_modal");
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Local state for participant info
  const [participantInfo, setParticipantInfo] = useState({
    name: participant.name,
    main_contact_email: participant.main_contact_email || "",
    seed: participant.seed || "",
    status: participant.status,
    team_identifier: participant.team_identifier || "",
    type: participant.type,
    logo_url: participant.logo_url || "",
  });

  // Local state for players
  const [players, setPlayers] = useState<Partial<Player>[]>(() => {
    const existingPlayers = [...(participant.players || [])].sort(
      (a, b) => (a.position || 99) - (b.position || 99),
    );
    const initialPlayers = [];
    for (let i = 0; i < teamMaxPlayers; i++) {
      initialPlayers.push(
        existingPlayers[i] || {
          name: "",
          email: "",
          custom_user_identifier: "",
          position: i + 1,
          is_captain: false,
        },
      );
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

    // Captain Logic: Only one captain allowed
    if (field === "is_captain" && value === true) {
      newPlayers.forEach((p, i) => {
        if (i !== index) p.is_captain = false;
      });
      if (newPlayers[index].name) {
        toast.info(t("captain_switched", { name: newPlayers[index].name }));
      }
    }

    newPlayers[index] = { ...newPlayers[index], [field]: value };
    setPlayers(newPlayers);
  };

  const handleSaveRoster = async () => {
    setError(null);

    // Prepare data for sync
    const participantData = {
      ...participantInfo,
      seed:
        participantInfo.seed === ""
          ? null
          : parseInt(participantInfo.seed as string),
    };

    // Filter out empty players (except those that already exist in DB)
    const playersToSync = players.filter((p) => p.id || p.name?.trim());

    startTransition(async () => {
      const result = await syncRoster(
        participant.id,
        tournamentId,
        participantData,
        playersToSync,
      );
      if (result.success) {
        toast.success(t("save_general"));
        router.refresh();
        onClose();
      } else {
        setError(result.error || "Failed to update roster");
        toast.error(result.error || "Failed to update roster");
      }
    });
  };

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      title={participant.name}
      description={t("description")}
      variant="default"
      size="xl"
    >
      <div className="flex flex-col h-[75vh]">
        {/* TABS - FLEX WRAP */}
        <div className="flex flex-wrap gap-2 p-2 bg-white/[0.03] border border-white/5 rounded-[1.5rem] mb-10">
          <button
            onClick={() => setActiveTab("basic")}
            className={`flex items-center gap-2.5 px-8 h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === "basic"
                ? "bg-brand-primary text-white shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.3)]"
                : "text-text-tertiary hover:text-white hover:bg-white/5"
            }`}
          >
            <Settings className="h-4 w-4" /> {t("tab_general")}
          </button>

          {Array.from({ length: teamMaxPlayers }).map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(`player-${i}`)}
              className={`flex items-center gap-2.5 px-8 h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
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
                <span className="ml-1 opacity-40 font-bold normal-case truncate max-w-[80px]">
                  ({players[i].name})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-8">
          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-2xl text-error text-xs font-black uppercase tracking-widest flex items-center gap-3">
              <Info className="h-4 w-4" /> {error}
            </div>
          )}

          {activeTab === "basic" ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-sm font-black uppercase tracking-widest text-text-tertiary flex items-center gap-2">
                    <User className="h-3.5 w-3.5" /> {t("name_label")}
                  </Label>
                  <Input
                    value={participantInfo.name || ""}
                    onChange={(e) =>
                      setParticipantInfo({
                        ...participantInfo,
                        name: e.target.value,
                      })
                    }
                    className="bg-white/[0.03] border-white/10 h-14 rounded-2xl text-base font-bold px-6 focus:ring-brand-primary/20"
                  />
                </div>
                <div className="space-y-4">
                  <Label className="text-sm font-black uppercase tracking-widest text-text-tertiary flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" /> {t("email_label")}
                  </Label>
                  <Input
                    value={participantInfo.main_contact_email || ""}
                    onChange={(e) =>
                      setParticipantInfo({
                        ...participantInfo,
                        main_contact_email: e.target.value,
                      })
                    }
                    className="bg-white/[0.03] border-white/10 h-14 rounded-2xl text-base font-bold px-6"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-sm font-black uppercase tracking-widest text-text-tertiary flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5" /> {t("seed_label")}
                  </Label>
                  <Input
                    type="number"
                    value={participantInfo.seed ?? ""}
                    onChange={(e) =>
                      setParticipantInfo({
                        ...participantInfo,
                        seed: e.target.value,
                      })
                    }
                    className="bg-white/[0.03] border-white/10 h-14 rounded-2xl text-base font-bold px-6"
                  />
                </div>
                <div className="space-y-4">
                  <Label className="text-sm font-black uppercase tracking-widest text-text-tertiary flex items-center gap-2">
                    <ChevronRight className="h-3.5 w-3.5" /> {t("status_label")}
                  </Label>
                  <Select
                    value={participantInfo.status}
                    onValueChange={(val: Participant["status"]) =>
                      setParticipantInfo({ ...participantInfo, status: val })
                    }
                  >
                    <SelectTrigger className="bg-white/[0.03] border-white/10 h-14 rounded-2xl text-base font-bold px-6">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-bg-secondary border-white/10">
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="checked_in">Checked In</SelectItem>
                      <SelectItem value="eliminated">Eliminated</SelectItem>
                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-sm font-black uppercase tracking-widest text-text-tertiary flex items-center gap-2">
                    <Fingerprint className="h-3.5 w-3.5" /> {t("team_id_label")}
                  </Label>
                  <Input
                    value={participantInfo.team_identifier || ""}
                    onChange={(e) =>
                      setParticipantInfo({
                        ...participantInfo,
                        team_identifier: e.target.value,
                      })
                    }
                    placeholder="e.g. TEAM-01"
                    className="bg-white/[0.03] border-white/10 h-14 rounded-2xl text-base font-bold px-6"
                  />
                </div>
                <div className="space-y-4">
                  <Label className="text-sm font-black uppercase tracking-widest text-text-tertiary flex items-center gap-2">
                    <Trophy className="h-3.5 w-3.5" /> {t("logo_label")}
                  </Label>
                  <ImageUpload
                    value={participantInfo.logo_url || ""}
                    onChange={(url) =>
                      setParticipantInfo({ ...participantInfo, logo_url: url })
                    }
                    bucket="participant-logos"
                    label="Team Logo"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {(() => {
                const index = parseInt(activeTab.split("-")[1]);
                const player = players[index];
                return (
                  <div className="space-y-10">
                    <div className="flex items-center gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                      <div className="h-24 w-24 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 relative overflow-hidden group">
                        {player.image_url ? (
                          <Image
                            src={player.image_url}
                            alt="Avatar"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <User className="h-10 w-10 text-text-tertiary group-hover:scale-110 transition-transform" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">
                          {player.name ||
                            t("tab_player", { number: index + 1 })}
                        </h3>
                        <p className="text-sm text-text-tertiary font-bold uppercase tracking-widest">
                          {player.is_captain ? "TEAM CAPTAIN" : "TEAM MEMBER"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <Label className="text-sm font-black uppercase tracking-widest text-text-tertiary">
                          {t("player_name")}
                        </Label>
                        <Input
                          value={player.name || ""}
                          onChange={(e) =>
                            handlePlayerChange(index, "name", e.target.value)
                          }
                          className="bg-white/[0.03] border-white/10 h-14 rounded-2xl text-base font-bold px-6"
                        />
                      </div>
                      <div className="space-y-4">
                        <Label className="text-sm font-black uppercase tracking-widest text-text-tertiary">
                          {t("player_email")}
                        </Label>
                        <Input
                          value={player.email || ""}
                          onChange={(e) =>
                            handlePlayerChange(index, "email", e.target.value)
                          }
                          className="bg-white/[0.03] border-white/10 h-14 rounded-2xl text-base font-bold px-6"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <Label className="text-sm font-black uppercase tracking-widest text-text-tertiary">
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
                          className="bg-white/[0.03] border-white/10 h-14 rounded-2xl text-base font-bold px-6"
                        />
                      </div>
                      <div className="space-y-4">
                        <Label className="text-sm font-black uppercase tracking-widest text-text-tertiary">
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
                          className="bg-white/[0.03] border-white/10 h-14 rounded-2xl text-base font-bold px-6"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-white/[0.03] rounded-2xl border border-white/5 group hover:border-brand-primary/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div
                          className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all ${player.is_captain ? "bg-brand-primary/20 text-brand-primary" : "bg-white/5 text-text-tertiary"}`}
                        >
                          <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                          <span className="text-sm font-black uppercase tracking-widest text-white block">
                            {t("player_captain")}
                          </span>
                          <span className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest">
                            One captain per roster
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
                        className="h-6 w-6 rounded-lg accent-brand-primary cursor-pointer"
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="pt-6 border-t border-white/5 flex gap-4">
          <Button
            variant="ghost"
            onClick={onClose}
            className="h-14 px-8 rounded-2xl text-sm font-black uppercase tracking-widest text-text-tertiary hover:text-white hover:bg-white/5"
          >
            {t("cancel_btn")}
          </Button>
          <Button
            onClick={handleSaveRoster}
            disabled={isPending}
            className="flex-1 h-14 bg-brand-primary text-white hover:bg-white hover:text-black font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_30px_rgba(var(--brand-primary-rgb),0.2)]"
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
    </PremiumModal>
  );
}
