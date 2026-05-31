"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Dices, Shuffle, Trophy } from "lucide-react";
import { ActionFeedbackModal } from "@/components/ui/ActionFeedbackModal";
import { Button } from "@/components/ui/button";
import { appToast } from "@/lib/app-toast";
import { cn } from "@/lib/utils";
import { applyParticipantSeeds } from "./actions";
import { Participant } from "./types";

interface SeedDrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  tournamentId: string;
  disabledReason?: string;
}

interface SeedAssignment {
  participantId: string;
  seed: number;
}

function shuffleParticipants(participants: Participant[]): Participant[] {
  const shuffled = [...participants];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }
  return shuffled;
}

export function SeedDrawModal({
  isOpen,
  onClose,
  participants,
  tournamentId,
  disabledReason,
}: SeedDrawModalProps) {
  const t = useTranslations("Organizer.participants.table.seed_draw");
  const common = useTranslations("Common");
  const router = useRouter();
  const [drawnParticipants, setDrawnParticipants] = useState<Participant[]>([]);
  const [rollingName, setRollingName] = useState<string>("");
  const [revealedCount, setRevealedCount] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sortedParticipants = useMemo(
    () =>
      [...participants].sort((first, second) => {
        const seedA = first.seed ?? 999;
        const seedB = second.seed ?? 999;
        if (seedA !== seedB) return seedA - seedB;
        return first.name.localeCompare(second.name);
      }),
    [participants],
  );

  const displayParticipants = drawnParticipants.length
    ? drawnParticipants
    : sortedParticipants;

  const clearTimers = () => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => clearTimers, []);

  const resetDrawState = () => {
    clearTimers();
    setIsDrawing(false);
    setIsApplying(false);
    setRollingName("");
    setRevealedCount(0);
    setDrawnParticipants([]);
  };

  const handleClose = () => {
    if (isApplying) return;
    resetDrawState();
    onClose();
  };

  const startDraw = () => {
    if (participants.length < 2 || disabledReason) return;

    clearTimers();
    setIsDrawing(true);
    setDrawnParticipants([]);
    setRevealedCount(0);

    intervalRef.current = setInterval(() => {
      const next =
        participants[Math.floor(Math.random() * participants.length)]?.name ||
        "";
      setRollingName(next);
    }, 80);

    const drawTimer = setTimeout(() => {
      clearTimers();
      const nextDraw = shuffleParticipants(participants);
      setDrawnParticipants(nextDraw);
      setRollingName("");

      nextDraw.forEach((_, index) => {
        const revealTimer = setTimeout(() => {
          setRevealedCount(index + 1);
          if (index === nextDraw.length - 1) {
            setIsDrawing(false);
            appToast.success(t("draw_complete_title"), {
              description: t("draw_complete_desc"),
            });
          }
        }, index * 120);
        timersRef.current.push(revealTimer);
      });
    }, 1200);

    timersRef.current.push(drawTimer);
  };

  const applySeeds = async () => {
    if (!drawnParticipants.length || disabledReason) return;

    setIsApplying(true);
    const toastId = appToast.loading(t("saving"));
    const assignments: SeedAssignment[] = drawnParticipants.map(
      (participant, index) => ({
        participantId: participant.id,
        seed: index + 1,
      }),
    );

    const formData = new FormData();
    formData.append("tournament_id", tournamentId);
    formData.append("assignments", JSON.stringify(assignments));

    const result = await applyParticipantSeeds(formData);
    appToast.dismiss(toastId);
    setIsApplying(false);

    if (result.success) {
      appToast.success(t("save_success_title"), {
        description: t("save_success_desc"),
      });
      router.refresh();
      resetDrawState();
      onClose();
      return;
    }

    appToast.error(t("save_error_title"), {
      description: result.error || t("save_error_desc"),
    });
  };

  return (
    <ActionFeedbackModal
      isOpen={isOpen}
      onClose={handleClose}
      title={t("title")}
      description={disabledReason || t("description")}
      status={disabledReason ? "warning" : "default"}
      size="xl"
      isLoading={isApplying}
      loadingLabel={t("saving")}
      primaryAction={
        disabledReason
          ? undefined
          : {
              label: t("apply"),
              onClick: applySeeds,
              disabled: !drawnParticipants.length || isDrawing,
            }
      }
      secondaryAction={{
        label: common("cancel"),
        onClick: handleClose,
        disabled: isApplying,
      }}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-primary">
              {t("pool_label", { count: participants.length })}
            </div>
            <div className="mt-1 truncate text-sm font-bold text-text-secondary">
              {isDrawing
                ? rollingName || t("rolling_placeholder")
                : drawnParticipants.length
                  ? t("ready_to_apply")
                  : t("ready_to_draw")}
            </div>
          </div>
          <Button
            type="button"
            onClick={startDraw}
            disabled={!!disabledReason || isDrawing || isApplying}
            className="h-12 rounded-xl bg-white text-black hover:bg-brand-primary hover:text-white font-display text-xs font-black uppercase tracking-widest"
          >
            {isDrawing ? (
              <>
                <Shuffle className="mr-2 h-4 w-4 animate-spin" />
                {t("drawing")}
              </>
            ) : (
              <>
                <Dices className="mr-2 h-4 w-4" />
                {drawnParticipants.length ? t("shuffle_again") : t("draw")}
              </>
            )}
          </Button>
        </div>

        <div className="grid max-h-[52vh] gap-3 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
          {displayParticipants.map((participant, index) => {
            const isRevealed =
              !drawnParticipants.length || index < revealedCount;
            return (
              <div
                key={participant.id}
                className={cn(
                  "flex items-center gap-4 rounded-2xl border p-4 transition-all",
                  drawnParticipants.length
                    ? isRevealed
                      ? "border-brand-primary/30 bg-brand-primary/5"
                      : "border-white/5 bg-white/[0.02] opacity-30 blur-[2px]"
                    : "border-white/5 bg-white/[0.02]",
                )}
              >
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border font-display text-lg font-black",
                    drawnParticipants.length
                      ? "border-brand-primary/30 bg-brand-primary/10 text-brand-primary"
                      : "border-white/10 bg-white/5 text-text-tertiary",
                  )}
                >
                  {drawnParticipants.length
                    ? index + 1
                    : participant.seed || "-"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-black uppercase tracking-tight text-white">
                    {participant.name}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                    <Trophy className="h-3 w-3 text-brand-primary/70" />
                    {participant.seed
                      ? t("current_seed", { seed: participant.seed })
                      : t("no_seed")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ActionFeedbackModal>
  );
}
