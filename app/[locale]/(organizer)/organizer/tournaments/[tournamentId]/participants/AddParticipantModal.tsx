"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, UserPlus, Check } from "lucide-react";
import { PremiumModal } from "@/components/ui/PremiumModal";
import { addManualParticipant } from "./actions";
import { Link, useRouter } from "@/lib/i18n/routing";
import { useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AddParticipantModal({
  tournamentId,
  participantType = "player",
}: {
  tournamentId: string;
  participantType?: "player" | "team";
}) {
  const t = useTranslations("Organizer.participants.add_modal");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData(event.currentTarget);
    formData.append("type", participantType);

    const result = await addManualParticipant(formData);

    setLoading(false);
    if (result?.error) {
      setErrorMsg(result.error);
    } else {
      setIsSuccess(true);
      router.refresh();
    }
  }

  const resetAndContinue = () => {
    setIsSuccess(false);
    setErrorMsg(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsSuccess(false);
    setErrorMsg(null);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-white text-black hover:bg-brand-primary hover:text-white h-12 px-6 rounded-xl font-black uppercase tracking-widest transition-all text-sm group"
      >
        <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />{" "}
        {useTranslations("Organizer.participants")("add_button")}
      </Button>

      <PremiumModal
        isOpen={isOpen}
        onClose={handleClose}
        title={isSuccess ? t("success_title") : t("title")}
        description={isSuccess ? t("success_desc") : t("subtitle")}
        footer={null}
      >
        {isSuccess ? (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="h-20 w-20 rounded-full bg-success/10 border border-success/20 flex items-center justify-center">
                <Check className="h-10 w-10 text-success" />
              </div>
              <p className="text-text-secondary font-medium text-center">
                {t("success_desc")}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={resetAndContinue}
                className="bg-brand-primary text-white hover:bg-white hover:text-black transition-all font-display font-bold uppercase tracking-widest h-14 rounded-2xl w-full"
              >
                {t("add_another")}
              </Button>
              <Button
                variant="ghost"
                onClick={handleClose}
                className="text-text-tertiary hover:text-white transition-all font-display font-bold uppercase tracking-widest h-12 rounded-xl"
              >
                {t("finish")}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="text-left space-y-6">
            <input type="hidden" name="tournament_id" value={tournamentId} />

            <div className="space-y-3">
              <Label
                htmlFor="name"
                className="text-sm font-black uppercase tracking-widest text-text-tertiary"
              >
                {t("name_label")}
              </Label>
              <Input
                id="name"
                name="name"
                placeholder={t("name_placeholder")}
                required
                className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 font-bold text-white focus:ring-brand-primary focus:border-brand-primary transition-all text-base"
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="email"
                className="text-sm font-black uppercase tracking-widest text-text-tertiary"
              >
                {t("email_label")}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="player@example.com"
                className="h-14 bg-white/5 border-white/5 rounded-2xl px-6 font-bold text-white focus:ring-brand-primary focus:border-brand-primary transition-all text-base"
              />
            </div>

            {errorMsg && (
              <div className="p-4 bg-error/10 border border-error/20 rounded-2xl text-error text-[13px] font-medium text-center">
                {errorMsg}
              </div>
            )}

            <div className="pt-4 flex flex-col gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="bg-brand-primary text-white hover:bg-white hover:text-black transition-all font-display font-bold uppercase tracking-widest h-14 rounded-2xl w-full"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="mr-2 h-5 w-5" /> {t("confirm_btn")}
                  </>
                )}
              </Button>

              <Link
                href={`/organizer/tournaments/${tournamentId}/participants/new`}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-14 rounded-2xl border-white/10 hover:bg-white/5 text-xs font-black uppercase tracking-widest flex items-center justify-center",
                )}
              >
                {t("title")} (Advanced)
              </Link>

              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={loading}
                className="text-text-tertiary hover:text-white transition-all font-display font-bold uppercase tracking-widest h-12 rounded-xl"
              >
                {t("cancel_btn")}
              </Button>
            </div>
          </form>
        )}
      </PremiumModal>
    </>
  );
}
