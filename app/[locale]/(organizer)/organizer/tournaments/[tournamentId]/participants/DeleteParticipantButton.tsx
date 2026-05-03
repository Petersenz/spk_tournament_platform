"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteParticipant } from "./actions";
import { useRouter } from "next/navigation";
import { PremiumModal } from "@/components/ui/PremiumModal";

export function DeleteParticipantButton({
  participantId,
  tournamentId,
}: {
  participantId: string;
  tournamentId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    setErrorMsg(null);
    const formData = new FormData();
    formData.append("participant_id", participantId);
    formData.append("tournament_id", tournamentId);

    try {
      const result = await deleteParticipant(formData);
      if (result?.error) {
        setErrorMsg(result.error);
      } else {
        setShowConfirm(false);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        size="icon"
        variant="ghost"
        className="h-10 w-10 text-text-tertiary hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
        onClick={() => setShowConfirm(true)}
      >
        <Trash2 className="h-5 w-5" />
      </Button>

      <PremiumModal
        isOpen={showConfirm}
        onClose={() => !loading && setShowConfirm(false)}
        title="Remove Player"
        description="Disqualify from Arena"
        variant="destructive"
        footer={
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleDelete}
              disabled={loading}
              className="bg-brand-primary text-white hover:bg-white hover:text-black transition-all font-display font-bold uppercase tracking-widest h-14 rounded-2xl w-full"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Confirm Removal"
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowConfirm(false)}
              disabled={loading}
              className="text-text-tertiary hover:text-white transition-all font-display font-bold uppercase tracking-widest h-12 rounded-xl"
            >
              Cancel
            </Button>
          </div>
        }
      >
        <div className="py-2">
          {errorMsg ? (
            <div className="p-4 bg-error/10 border border-error/20 rounded-2xl text-error text-[13px] font-medium text-center">
              {errorMsg}
            </div>
          ) : (
            <p>
              Are you sure you want to remove this participant? This action
              cannot be undone and will also delete their registration record.
            </p>
          )}
        </div>
      </PremiumModal>
    </>
  );
}
