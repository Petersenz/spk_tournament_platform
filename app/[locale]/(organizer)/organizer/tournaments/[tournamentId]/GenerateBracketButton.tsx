"use client";

import { useState } from "react";
import { useRouter } from "@/lib/i18n/routing";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ActionFeedbackModal } from "@/components/ui/ActionFeedbackModal";
import { appToast } from "@/lib/app-toast";
import { clearBracket, generateBracket } from "./actions";
import { Loader2, Play, Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";

function SubmitButton({ hasMatches }: { hasMatches: boolean }) {
  const { pending } = useFormStatus();
  const t = useTranslations("Tournament");

  return (
    <Button
      type="submit"
      disabled={pending}
      variant="outline"
      className="h-16 px-10 rounded-2xl border-brand-primary/30 text-brand-primary hover:bg-brand-primary hover:text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-[0_0_20px_rgba(244,0,9,0.1)] group"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t("initializing")}
        </>
      ) : (
        <>
          <Play className="mr-2 h-4 w-4 fill-current group-hover:scale-125 transition-transform" />
          {hasMatches ? t("reset") : t("initialize")}
        </>
      )}
    </Button>
  );
}

export function GenerateBracketButton({
  tournamentId,
  stageId,
  hasMatches,
}: {
  tournamentId: string;
  stageId: string;
  hasMatches: boolean;
}) {
  const t = useTranslations("Tournament");
  const router = useRouter();
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  async function handleAction(formData: FormData) {
    const result = await generateBracket(formData);
    if (result?.error) {
      appToast.error(result.error);
    }
  }

  async function handleClearBracket() {
    setIsClearing(true);

    const formData = new FormData();
    formData.set("tournament_id", tournamentId);
    formData.set("stage_id", stageId);

    const result = await clearBracket(formData);
    setIsClearing(false);

    if (result?.error) {
      appToast.error(result.error);
      return;
    }

    setIsClearModalOpen(false);
    appToast.success(t("clear_bracket_success"), {
      description: t("clear_bracket_success_desc"),
    });
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-3">
      <form
        action={async (formData) => {
          await handleAction(formData);
        }}
      >
        <input type="hidden" name="tournament_id" value={tournamentId} />
        <input type="hidden" name="stage_id" value={stageId} />
        <SubmitButton hasMatches={hasMatches} />
      </form>
      {hasMatches && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsClearModalOpen(true)}
          className="h-10 rounded-xl border-red-500/20 bg-red-500/5 px-4 font-display text-[10px] font-black uppercase tracking-widest text-red-300 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-200"
        >
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          {t("clear_bracket")}
        </Button>
      )}
      <ActionFeedbackModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        title={t("clear_bracket_title")}
        description={t("clear_bracket_desc")}
        status="destructive"
        primaryAction={{
          label: t("clear_bracket_confirm"),
          onClick: handleClearBracket,
        }}
        secondaryAction={{
          label: t("clear_bracket_cancel"),
          onClick: () => setIsClearModalOpen(false),
        }}
        isLoading={isClearing}
        loadingLabel={t("clear_bracket_loading")}
      >
        <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-4 text-xs font-bold leading-relaxed text-red-100/80">
          {t("clear_bracket_warning")}
        </div>
      </ActionFeedbackModal>
    </div>
  );
}
