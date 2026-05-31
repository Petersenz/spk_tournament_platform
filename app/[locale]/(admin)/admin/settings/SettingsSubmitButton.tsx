"use client";

import { useFormStatus } from "react-dom";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SettingsSubmitButtonProps {
  disabled?: boolean;
  labels: {
    saving: string;
    save: string;
  };
}

export function SettingsSubmitButton({
  disabled = false,
  labels,
}: SettingsSubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = disabled || pending;

  return (
    <Button
      type="submit"
      disabled={isDisabled}
      className="w-full bg-brand-primary text-white hover:bg-white hover:text-black h-16 rounded-2xl font-black uppercase tracking-widest shadow-[0_0_30px_rgba(244,0,9,0.4)] transition-all disabled:pointer-events-none disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          {labels.saving}
        </>
      ) : (
        <>
          <Save className="mr-2 h-5 w-5" />
          {labels.save}
        </>
      )}
    </Button>
  );
}
