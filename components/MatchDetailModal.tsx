"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Calendar,
  MapPin,
  Clock,
  Swords,
  Save,
  Loader2,
  Trophy,
} from "lucide-react";
import { updateMatchDetails } from "@/app/[locale]/(organizer)/organizer/tournaments/[tournamentId]/match-actions";
import { Match } from "./BracketView";
import { useTranslations } from "next-intl";

interface MatchDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
  tournamentId: string;
}

export function MatchDetailModal({
  isOpen,
  onClose,
  match,
  tournamentId,
}: MatchDetailModalProps) {
  const t = useTranslations("Tournament.protocol");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.append("tournament_id", tournamentId);

    const result = await updateMatchDetails(formData);
    setPending(false);
    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0c0c0e] border-white/5 text-white max-w-md rounded-[2.5rem] shadow-2xl p-0 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <input type="hidden" name="id" value={match.id} />

          <div key={match.id} className="p-8 space-y-8">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                <Swords className="h-6 w-6 text-brand-primary" />
                {t("title")}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* SCHEDULE */}
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary flex items-center gap-2">
                  <Calendar className="h-3 w-3" /> {t("scheduled_time")}
                </Label>
                <Input
                  name="scheduled_at"
                  type="datetime-local"
                  defaultValue={
                    match.scheduled_at
                      ? new Date(match.scheduled_at).toISOString().slice(0, 16)
                      : ""
                  }
                  className="bg-white/5 border-white/10 h-12 rounded-xl text-white font-bold"
                />
              </div>

              {/* LOCATION */}
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary flex items-center gap-2">
                  <MapPin className="h-3 w-3" /> {t("location_label")}
                </Label>
                <Input
                  name="location"
                  placeholder={t("location_placeholder")}
                  defaultValue={match.location || ""}
                  className="bg-white/5 border-white/10 h-12 rounded-xl text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* STATUS */}
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary flex items-center gap-2">
                    <Clock className="h-3 w-3" /> {t("status_label")}
                  </Label>
                  <Select name="status" defaultValue={match.status}>
                    <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl text-white font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-bg-secondary border-white/10">
                      <SelectItem value="pending">
                        {t("status_pending")}
                      </SelectItem>
                      <SelectItem value="in_progress">
                        {t("status_in_progress")}
                      </SelectItem>
                      <SelectItem value="completed">
                        {t("status_completed")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* WINNER OVERRIDE */}
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary flex items-center gap-2">
                    <Trophy className="h-3 w-3" /> {t("winner_label")}
                  </Label>
                  <Select
                    name="winner_id"
                    defaultValue={match.winner_id || "none"}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl text-white font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-bg-secondary border-white/10">
                      <SelectItem value="none">{t("undecided")}</SelectItem>
                      {match.participant1_id && (
                        <SelectItem value={match.participant1_id}>
                          {match.p1?.name || "P1"}
                        </SelectItem>
                      )}
                      {match.participant2_id && (
                        <SelectItem value={match.participant2_id}>
                          {match.p2?.name || "P2"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* SCORES */}
              <div className="grid grid-cols-2 gap-6 p-6 bg-white/2 rounded-2xl border border-white/5">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">
                    {match.p1?.name || "P1"} {t("score_label")}
                  </Label>
                  <Input
                    name="score1"
                    type="number"
                    defaultValue={match.score_participant1 ?? ""}
                    className="bg-white/5 border-white/10 h-12 rounded-xl text-white font-black text-center"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">
                    {match.p2?.name || "P2"} {t("score_label")}
                  </Label>
                  <Input
                    name="score2"
                    type="number"
                    defaultValue={match.score_participant2 ?? ""}
                    className="bg-white/5 border-white/10 h-12 rounded-xl text-white font-black text-center"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="mx-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold">
                {error}
              </div>
            )}
          </div>

          <div className="bg-white/2 p-8 border-t border-white/5">
            <Button
              type="submit"
              disabled={pending}
              className="w-full bg-brand-primary text-white hover:bg-white hover:text-black h-14 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl"
            >
              {pending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" /> {t("commit")}
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
