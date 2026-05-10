"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { approveRegistration } from "./actions";
import { useRouter } from "next/navigation";

import { PremiumModal } from "@/components/ui/PremiumModal";

export function ApproveButton({
  registrationId,
  tournamentId,
}: {
  registrationId: string;
  tournamentId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  async function handleApprove() {
    setLoading(true);
    setErrorMsg(null);
    const formData = new FormData();
    formData.append("registration_id", registrationId);
    formData.append("tournament_id", tournamentId);

    try {
      const result = await approveRegistration(formData);
      if (result?.error) {
        setErrorMsg(result.error);
      } else {
        setShowConfirm(false);
        router.refresh();
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        size="icon"
        variant="ghost"
        className="h-10 w-10 text-success hover:bg-success/10 rounded-xl transition-all"
        onClick={() => setShowConfirm(true)}
      >
        <Check className="h-5 w-5" />
      </Button>

      <PremiumModal
        isOpen={showConfirm}
        onClose={() => !loading && setShowConfirm(false)}
        title="Approve Player"
        description="Verify entry into arena"
        variant="success"
        footer={
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleApprove}
              disabled={loading}
              className="bg-brand-primary text-white hover:bg-white hover:text-black transition-all font-display font-bold uppercase tracking-widest h-14 rounded-2xl w-full"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Confirm Approval"
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
              Are you sure you want to approve this registration? The player
              will be moved to the confirmed arena.
            </p>
          )}
        </div>
      </PremiumModal>
    </>
  );
}
