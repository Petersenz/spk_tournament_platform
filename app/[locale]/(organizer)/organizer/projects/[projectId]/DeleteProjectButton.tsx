"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteProject } from "../actions";
import { useTranslations } from "next-intl";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const t = useTranslations("Common");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteProject(projectId);
    setShowConfirm(false);
  };

  return (
    <>
      <Button
        variant="default"
        type="button"
        onClick={() => setShowConfirm(true)}
        className="h-14 px-8 rounded-2xl bg-[#ef4444] text-white hover:bg-[#ff5555] transition-all duration-300 font-display font-bold uppercase tracking-widest text-xs group shadow-[0_0_30px_rgba(239,68,68,0.2)] hover:shadow-red-600/40"
      >
        <Trash2 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />{" "}
        {t("delete")}
      </Button>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title={t("delete") + " " + t("project")}
      />
    </>
  );
}
