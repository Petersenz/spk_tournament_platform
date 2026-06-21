"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/routing";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { appToast } from "@/lib/app-toast";
import { deleteGameAction } from "./actions";

export function DeleteGameButton({
  gameId,
  gameName,
}: {
  gameId: string;
  gameName: string;
}) {
  const t = useTranslations("Common");
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteGameAction(gameId);
    setIsDeleting(false);
    if (res?.error) {
      appToast.error(res.error);
      return;
    }
    setShowConfirm(false);
    appToast.success(`${gameName} ${t("delete").toLowerCase()}`);
    router.refresh();
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        onClick={() => setShowConfirm(true)}
        className="w-full text-text-tertiary hover:text-error hover:bg-error/5 font-black uppercase tracking-widest text-[10px] rounded-xl h-11 transition-all"
      >
        <Trash2 className="mr-2 h-3 w-3" /> {t("delete")}
      </Button>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title={`${t("delete")} ${gameName}`}
      />
    </>
  );
}
