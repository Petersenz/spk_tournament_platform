"use client";

import { useState, useTransition } from "react";
import {
  X,
  Save,
  Loader2,
  UserPlus,
  Trash2,
  ShieldCheck,
  Shield,
  Users as UsersIcon,
  Settings,
  Trophy,
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
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { updateParticipantFull, savePlayer, deletePlayer } from "./actions";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Player, Participant } from "./types";

export function ParticipantEditModal({
  participant,
  tournamentId,
  isOpen,
  onClose,
}: {
  participant: Participant;
  tournamentId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("Organizer.participants.edit_modal");
  const [activeTab, setActiveTab] = useState<"general" | "players">("general");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [playerToDelete, setPlayerToDelete] = useState<string | null>(null);
  const router = useRouter();

  const handleUpdateParticipant = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.append("id", participant.id);
    formData.append("tournament_id", tournamentId);

    startTransition(async () => {
      const result = await updateParticipantFull(formData);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error || "Failed to update participant");
      }
    });
  };

  const handleSavePlayer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("participant_id", participant.id);
    formData.append("tournament_id", tournamentId);
    if (editingPlayer) formData.append("id", editingPlayer.id);

    startTransition(async () => {
      const result = await savePlayer(formData);
      if (result.success) {
        setEditingPlayer(null);
        router.refresh();
      } else {
        alert(result.error);
      }
    });
  };

  const handleDeletePlayer = async () => {
    if (!playerToDelete) return;
    startTransition(async () => {
      const result = await deletePlayer(playerToDelete, tournamentId);
      if (result.success) {
        setPlayerToDelete(null);
        router.refresh();
      } else {
        alert(result.error);
      }
    });
  };

  return (
    <>
      <PremiumModal
        isOpen={isOpen}
        onClose={onClose}
        title={participant.name}
        description={t("description")}
        variant="default"
      >
        <div className="flex flex-col h-[70vh]">
          {/* TABS */}
          <div className="flex gap-2 p-1 bg-white/5 rounded-2xl mb-8">
            <button
              onClick={() => setActiveTab("general")}
              className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === "general"
                  ? "bg-brand-primary text-white shadow-lg"
                  : "text-text-tertiary hover:text-white hover:bg-white/5"
              }`}
            >
              <Settings className="h-3.5 w-3.5" /> {t("tab_general")}
            </button>
            <button
              onClick={() => setActiveTab("players")}
              className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === "players"
                  ? "bg-brand-primary text-white shadow-lg"
                  : "text-text-tertiary hover:text-white hover:bg-white/5"
              }`}
            >
              <UsersIcon className="h-3.5 w-3.5" /> {t("tab_roster")} (
              {participant.players?.length || 0})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {activeTab === "general" ? (
              <form
                onSubmit={handleUpdateParticipant}
                className="space-y-8 pb-8"
              >
                {error && (
                  <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-[10px] font-black uppercase tracking-widest">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-black uppercase tracking-widest text-text-tertiary">
                      {t("name_label")}
                    </Label>
                    <Input
                      name="name"
                      defaultValue={participant.name}
                      required
                      className="bg-white/5 border-white/10 h-12 rounded-xl text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-black uppercase tracking-widest text-text-tertiary">
                      {t("email_label")}
                    </Label>
                    <Input
                      name="email"
                      type="email"
                      defaultValue={participant.main_contact_email || ""}
                      className="bg-white/5 border-white/10 h-12 rounded-xl text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-black uppercase tracking-widest text-text-tertiary">
                      {t("seed_label")}
                    </Label>
                    <Input
                      name="seed"
                      type="number"
                      defaultValue={participant.seed || ""}
                      placeholder="No seed"
                      className="bg-white/5 border-white/10 h-12 rounded-xl text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-black uppercase tracking-widest text-text-tertiary">
                      {t("status_label")}
                    </Label>
                    <Select name="status" defaultValue={participant.status}>
                      <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl text-sm font-bold">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-black uppercase tracking-widest text-text-tertiary">
                      {t("id_label")}
                    </Label>
                    <Input
                      name="team_identifier"
                      defaultValue={participant.team_identifier || ""}
                      placeholder="e.g. TEAM-01"
                      className="bg-white/5 border-white/10 h-12 rounded-xl text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-black uppercase tracking-widest text-text-tertiary">
                      {t("type_label")}
                    </Label>
                    <Select name="type" defaultValue={participant.type}>
                      <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl text-sm font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-bg-secondary border-white/10">
                        <SelectItem value="team">Team</SelectItem>
                        <SelectItem value="player">Individual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-black uppercase tracking-widest text-text-tertiary">
                    {t("logo_label")}
                  </Label>
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                      {participant.logo_url ? (
                        <Image
                          src={participant.logo_url}
                          alt={participant.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <Trophy className="h-5 w-5 text-text-tertiary" />
                      )}
                    </div>
                    <Input
                      name="logo_url"
                      defaultValue={participant.logo_url || ""}
                      placeholder="https://..."
                      className="bg-white/5 border-white/10 h-12 rounded-xl flex-1 text-sm font-bold"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-14 bg-brand-primary text-white hover:bg-white hover:text-black font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg"
                >
                  {isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> {t("save_general")}
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-8 pb-8">
                {/* PLAYER LIST */}
                <div className="space-y-4">
                  {participant.players?.length === 0 ? (
                    <div className="p-12 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center gap-4 opacity-30">
                      <UsersIcon className="h-10 w-10" />
                      <span className="text-xs font-black uppercase tracking-widest">
                        {t("roster_empty")}
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {participant.players.map((player) => (
                        <div
                          key={player.id}
                          className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-brand-primary/30 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                              {player.image_url ? (
                                <Image
                                  src={player.image_url}
                                  alt={player.name}
                                  fill
                                  sizes="40px"
                                  className="object-cover rounded-xl"
                                />
                              ) : (
                                <Shield className="h-4 w-4 text-text-tertiary" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-white uppercase tracking-tight">
                                  {player.name}
                                </span>
                                {player.is_captain && (
                                  <ShieldCheck className="h-3.5 w-3.5 text-brand-primary" />
                                )}
                              </div>
                              <div className="text-xs text-text-tertiary font-bold uppercase tracking-widest">
                                {player.email || "No email"}{" "}
                                {player.position
                                  ? `• Pos: ${player.position}`
                                  : ""}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingPlayer(player)}
                              className="h-9 w-9 text-text-tertiary hover:text-white hover:bg-white/5"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setPlayerToDelete(player.id)}
                              className="h-9 w-9 text-text-tertiary hover:text-error hover:bg-error/5"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ADD/EDIT PLAYER FORM */}
                <div className="p-8 bg-white/[0.03] border border-white/10 rounded-3xl space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary"></div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-3">
                    {editingPlayer ? (
                      <Settings className="h-4 w-4 text-brand-primary" />
                    ) : (
                      <UserPlus className="h-4 w-4 text-brand-primary" />
                    )}
                    {editingPlayer
                      ? t("edit_player", { name: editingPlayer.name })
                      : t("add_player")}
                  </h3>

                  <form onSubmit={handleSavePlayer} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-black uppercase tracking-widest text-text-tertiary">
                          {t("player_name")}
                        </Label>
                        <Input
                          name="name"
                          defaultValue={editingPlayer?.name || ""}
                          required
                          className="bg-white/5 border-white/10 h-11 text-sm font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-black uppercase tracking-widest text-text-tertiary">
                          {t("player_email")}
                        </Label>
                        <Input
                          name="email"
                          type="email"
                          defaultValue={editingPlayer?.email || ""}
                          className="bg-white/5 border-white/10 h-11 text-sm font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-black uppercase tracking-widest text-text-tertiary">
                          {t("player_custom_id")}
                        </Label>
                        <Input
                          name="custom_user_identifier"
                          defaultValue={
                            editingPlayer?.custom_user_identifier || ""
                          }
                          className="bg-white/5 border-white/10 h-11 text-sm font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-black uppercase tracking-widest text-text-tertiary">
                          {t("player_position")}
                        </Label>
                        <Input
                          name="position"
                          type="number"
                          defaultValue={editingPlayer?.position || ""}
                          className="bg-white/5 border-white/10 h-11 text-sm font-bold"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <ShieldCheck
                          className={`h-5 w-5 ${editingPlayer?.is_captain ? "text-brand-primary" : "text-text-tertiary"}`}
                        />
                        <span className="text-xs font-black uppercase tracking-widest text-white">
                          {t("player_captain")}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        name="is_captain"
                        value="true"
                        defaultChecked={editingPlayer?.is_captain}
                        className="h-5 w-5 accent-brand-primary cursor-pointer"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        disabled={isPending}
                        className="flex-1 bg-brand-primary text-white h-12 rounded-xl font-black uppercase tracking-widest text-xs"
                      >
                        {editingPlayer
                          ? t("player_update_btn")
                          : t("player_add_btn")}
                      </Button>
                      {editingPlayer && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setEditingPlayer(null)}
                          className="h-12 px-6 rounded-xl text-text-tertiary hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </PremiumModal>

      <ConfirmDialog
        isOpen={!!playerToDelete}
        onClose={() => setPlayerToDelete(null)}
        onConfirm={handleDeletePlayer}
        isLoading={isPending}
        title={t("remove_player_title")}
        description={t("remove_player_desc")}
      />
    </>
  );
}
