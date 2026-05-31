"use client";

import { CheckCircle2, Info, Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumModal } from "@/components/ui/PremiumModal";
import { cn } from "@/lib/utils";

interface ActionFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  isLoading?: boolean;
  loadingLabel?: string;
  status?: "default" | "success" | "warning" | "destructive";
  size?: "sm" | "default" | "lg" | "xl" | "full";
}

const statusConfig = {
  default: {
    icon: Info,
    modalVariant: "default" as const,
    iconClass: "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
    primaryClass: "bg-brand-primary text-white hover:bg-white hover:text-black",
    eyebrow: "SYSTEM MESSAGE",
  },
  success: {
    icon: CheckCircle2,
    modalVariant: "success" as const,
    iconClass: "bg-success/10 text-success border-success/20",
    primaryClass: "bg-success text-black hover:bg-white hover:text-black",
    eyebrow: "COMPLETED",
  },
  warning: {
    icon: TriangleAlert,
    modalVariant: "default" as const,
    iconClass: "bg-warning/10 text-warning border-warning/20",
    primaryClass: "bg-warning text-black hover:bg-white hover:text-black",
    eyebrow: "REVIEW REQUIRED",
  },
  destructive: {
    icon: TriangleAlert,
    modalVariant: "destructive" as const,
    iconClass: "bg-red-500/10 text-red-400 border-red-500/20",
    primaryClass: "bg-red-500 text-white hover:bg-white hover:text-black",
    eyebrow: "DANGER ZONE",
  },
};

export function ActionFeedbackModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  primaryAction,
  secondaryAction,
  isLoading = false,
  loadingLabel = "Working...",
  status = "default",
  size = "default",
}: ActionFeedbackModalProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={() => {
        if (!isLoading) onClose();
      }}
      title={title}
      description={config.eyebrow}
      variant={config.modalVariant}
      size={size}
      footer={
        (primaryAction || secondaryAction) && (
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {secondaryAction && (
              <Button
                type="button"
                variant="outline"
                onClick={secondaryAction.onClick}
                disabled={isLoading || secondaryAction.disabled}
                className="h-12 rounded-xl border-white/10 bg-white/5 px-6 font-display text-xs font-black uppercase tracking-widest text-text-secondary hover:bg-white/10 hover:text-white"
              >
                {secondaryAction.label}
              </Button>
            )}
            {primaryAction && (
              <Button
                type="button"
                onClick={primaryAction.onClick}
                disabled={isLoading || primaryAction.disabled}
                className={cn(
                  "h-12 rounded-xl px-6 font-display text-xs font-black uppercase tracking-widest transition-all",
                  config.primaryClass,
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {loadingLabel}
                  </>
                ) : (
                  primaryAction.label
                )}
              </Button>
            )}
          </div>
        )
      }
    >
      <div className="space-y-6">
        <div className="flex items-start gap-5">
          <div
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border",
              config.iconClass,
            )}
          >
            <Icon className="h-7 w-7" />
          </div>
          <div className="min-w-0">
            {description && (
              <p className="text-sm font-medium leading-relaxed text-text-secondary">
                {description}
              </p>
            )}
          </div>
        </div>
        {children}
      </div>
    </PremiumModal>
  );
}
