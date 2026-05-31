"use client";

import { toast } from "sonner";

interface AppToastOptions {
  description?: string;
}

export const appToast = {
  success(message: string, options?: AppToastOptions): void {
    toast.success(message, {
      description: options?.description,
    });
  },
  error(message: string, options?: AppToastOptions): void {
    toast.error(message, {
      description: options?.description,
    });
  },
  info(message: string, options?: AppToastOptions): void {
    toast(message, {
      description: options?.description,
    });
  },
  loading(message: string): string | number {
    return toast.loading(message);
  },
  dismiss(id?: string | number): void {
    toast.dismiss(id);
  },
};
