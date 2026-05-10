"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { joinTournament } from "./actions";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { PremiumModal } from "@/components/ui/PremiumModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";

export function JoinButton({
  tournamentId,
  participantType,
}: {
  tournamentId: string;
  participantType: "player" | "team";
}) {
  const t = useTranslations("Tournament");
  const tCommon = useTranslations("Common");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleJoin() {
    if (participantType === "team" && !teamName.trim()) {
      setStatus("error");
      setMessage("Please enter a team name");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const result = await joinTournament(tournamentId, teamName);

      if (result.success) {
        setStatus("success");
        setMessage("Successfully registered!");
        setShowModal(false);
        router.refresh();
      } else if (result.error) {
        setStatus("error");
        setMessage(result.error);
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "success") {
    return (
      <div className="text-center p-8 bg-success/10 border border-success/20 rounded-[2rem] space-y-3 animate-in zoom-in-95 duration-500">
        <CheckCircle2 className="h-10 w-10 text-success mx-auto" />
        <div className="text-success font-display font-black uppercase tracking-tighter text-xl">
          Success!
        </div>
        <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest">
          {message}
        </p>
      </div>
    );
  }

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        className="w-full bg-brand-primary text-white hover:bg-white hover:text-black hover:shadow-[0_0_40px_rgba(244,0,9,0.5)] transition-all py-8 font-display font-black text-xl uppercase tracking-tighter rounded-2xl"
      >
        {t("join_arena")}
      </Button>

      <PremiumModal
        isOpen={showModal}
        onClose={() => !loading && setShowModal(false)}
        title={t("join_arena")}
        description={
          participantType === "team"
            ? "Register your squad"
            : "Confirm your entry"
        }
        footer={
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleJoin}
              disabled={loading}
              className="bg-brand-primary text-white hover:bg-white hover:text-black transition-all font-display font-bold uppercase tracking-widest h-14 rounded-2xl w-full"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Confirm Registration"
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowModal(false)}
              disabled={loading}
              className="text-text-tertiary hover:text-white transition-all font-display font-bold uppercase tracking-widest h-12 rounded-xl"
            >
              {tCommon("cancel")}
            </Button>
          </div>
        }
      >
        <div className="py-2 space-y-6">
          {status === "error" && (
            <div className="p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3 text-error animate-shake">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p className="text-[10px] font-bold uppercase tracking-widest">
                {message}
              </p>
            </div>
          )}

          {participantType === "team" && (
            <div className="space-y-3">
              <Label
                htmlFor="teamName"
                className="text-xs font-bold uppercase tracking-[0.2em] text-text-tertiary ml-1"
              >
                {t("team_name")}
              </Label>
              <Input
                id="teamName"
                placeholder="Enter squad name..."
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="h-14 bg-white/5 border-white/10 rounded-xl focus:border-brand-primary transition-all text-white font-bold"
              />
            </div>
          )}

          <p className="text-sm text-text-secondary">
            {participantType === "team"
              ? "Registering as a team. You can add your teammates later in the player dashboard."
              : "Registering as an individual player. Good luck, warrior!"}
          </p>
        </div>
      </PremiumModal>
    </>
  );
}
