"use client";

import { useState } from "react";
import Image from "next/image";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Label } from "@/components/ui/label";
import { updateSiteLogoUrl } from "./actions";

interface SiteLogoUploadFieldProps {
  initialValue: string;
  labels: {
    title: string;
    description: string;
    upload: string;
    autoSave: string;
    saving: string;
    success: string;
    error: string;
    previewTitle: string;
    previewDescription: string;
    navbarPreview: string;
    navbarPreviewDescription: string;
    iconPreview: string;
    iconPreviewDescription: string;
    previewAlt: string;
    smallPreviewAlt: string;
  };
}

export function SiteLogoUploadField({
  initialValue,
  labels,
}: SiteLogoUploadFieldProps) {
  const [logoUrl, setLogoUrl] = useState(initialValue || "/logo.png");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const previewUrl = logoUrl || "/logo.png";

  async function handleLogoChange(url: string): Promise<void> {
    const nextUrl = url || "/logo.png";
    setLogoUrl(nextUrl);

    try {
      setIsSaving(true);
      const result = await updateSiteLogoUrl(nextUrl);
      setLogoUrl(result.logoUrl);
      toast.success(labels.success);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : labels.error;
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">
              {labels.title}
            </Label>
            <p className="mt-2 max-w-2xl text-xs font-semibold leading-relaxed text-text-secondary">
              {labels.description}
            </p>
          </div>
          <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-brand-primary/20 bg-brand-primary/10 text-brand-primary sm:flex">
            <ImageIcon className="h-5 w-5" />
          </div>
        </div>

        <ImageUpload
          value={previewUrl}
          onChange={(url) => {
            void handleLogoChange(url);
          }}
          bucket="site-assets"
          label={labels.upload}
        />

        <input type="hidden" name="site_logo_url" value={logoUrl} />

        <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
          {labels.autoSave}
        </p>
        {isSaving && (
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-brand-primary">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {labels.saving}
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-3xl border border-white/5 bg-black/20 p-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">
            {labels.previewTitle}
          </p>
          <p className="mt-1 text-xs font-semibold text-text-secondary">
            {labels.previewDescription}
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-bg-primary/70 p-4">
          <div className="relative h-12 w-12 shrink-0">
            <Image
              src={previewUrl}
              alt={labels.previewAlt}
              fill
              sizes="48px"
              className="object-contain"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-black uppercase text-white">
              {labels.navbarPreview}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">
              {labels.navbarPreviewDescription}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
          <div className="relative h-8 w-8 shrink-0">
            <Image
              src={previewUrl}
              alt={labels.smallPreviewAlt}
              fill
              sizes="32px"
              className="object-contain"
            />
          </div>
          <div className="min-w-0 text-left">
            <p className="truncate text-xs font-black uppercase text-white">
              {labels.iconPreview}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
              {labels.iconPreviewDescription}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
