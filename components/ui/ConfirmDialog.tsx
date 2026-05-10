"use client";

import { AlertTriangle, X, Trash2 } from "lucide-react";
import { Button } from "./button";
import { PremiumModal } from "./PremiumModal";
import { useTranslations } from "next-intl";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string; // Optional description
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "success";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  variant = "destructive",
  isLoading = false,
}: ConfirmDialogProps) {
  const t = useTranslations("Common");
  const isDestructive = variant === "destructive";

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={() => !isLoading && onClose()}
      title={title}
      variant={variant}
      description={isDestructive ? t("danger_zone") : "CONFIRMATION"}
      footer={
        <div className="grid grid-cols-2 gap-4 w-full mt-4">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="h-14 rounded-xl font-display font-bold uppercase tracking-widest text-xs border-white/10 hover:bg-white/5 text-text-secondary hover:text-white transition-all duration-300"
          >
            <X className="mr-2 h-4 w-4" /> {cancelText || t("cancel")}
          </Button>
          <Button
            variant="default"
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`h-14 rounded-xl font-display font-bold uppercase tracking-widest text-xs text-white transition-all duration-300 shadow-2xl ${
              isDestructive
                ? "bg-[#ef4444] hover:bg-[#ff5555] shadow-red-900/20 hover:shadow-red-600/40"
                : "bg-success hover:bg-success/80 shadow-success/20"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>{t("loading")}</span>
              </div>
            ) : (
              <div className="flex items-center">
                {isDestructive ? (
                  <Trash2 className="mr-2 h-4 w-4" />
                ) : (
                  <AlertTriangle className="mr-2 h-4 w-4" />
                )}
                <span>
                  {confirmText || (isDestructive ? t("delete") : t("save"))}
                </span>
              </div>
            )}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center space-y-6 py-2">
        {/* ICON BOX */}
        <div
          className={`relative h-24 w-24 rounded-[2rem] flex items-center justify-center overflow-hidden ${
            isDestructive
              ? "bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444]"
              : "bg-success/10 border border-success/20 text-success"
          }`}
        >
          {/* Inner Glow */}
          <div
            className={`absolute inset-0 blur-2xl opacity-20 ${isDestructive ? "bg-[#ef4444]" : "bg-success"}`}
          ></div>
          {isDestructive ? (
            <AlertTriangle className="h-10 w-10 relative z-10" />
          ) : (
            <Trash2 className="h-10 w-10 relative z-10" />
          )}
        </div>

        <div className="space-y-3 px-2">
          <h3 className="font-display text-2xl font-black text-white uppercase tracking-tight leading-tight">
            {description || t("delete_confirm_title")}
          </h3>
          <p className="font-body text-sm text-text-secondary leading-relaxed max-w-[320px] mx-auto">
            {
              isDestructive ? t("delete_confirm_desc") : t("save_confirm_desc") // You might want to add this key too
            }
          </p>
        </div>
      </div>
    </PremiumModal>
  );
}
