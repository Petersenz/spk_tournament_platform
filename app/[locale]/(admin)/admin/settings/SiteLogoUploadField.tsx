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
}

export function SiteLogoUploadField({
  initialValue,
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
      toast.success("Site logo updated");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save site logo";
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
              Site Logo
            </Label>
            <p className="mt-2 max-w-2xl text-xs font-semibold leading-relaxed text-text-secondary">
              Upload a new logo here. The saved image is used in the public
              navbar, admin sidebar, organizer sidebar, and browser metadata.
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
          label="Upload Site Logo"
        />

        <input type="hidden" name="site_logo_url" value={logoUrl} />

        <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
          Logo changes are saved automatically after upload.
        </p>
        {isSaving && (
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-brand-primary">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Saving logo
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-3xl border border-white/5 bg-black/20 p-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">
            Live Preview
          </p>
          <p className="mt-1 text-xs font-semibold text-text-secondary">
            This is how the mark appears in compact navigation areas.
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-bg-primary/70 p-4">
          <div className="relative h-12 w-12 shrink-0">
            <Image
              src={previewUrl}
              alt="Site logo preview"
              fill
              sizes="48px"
              className="object-contain"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-black uppercase text-white">
              Navbar
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">
              Public + dashboard
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
          <div className="relative h-8 w-8 shrink-0">
            <Image
              src={previewUrl}
              alt="Small logo preview"
              fill
              sizes="32px"
              className="object-contain"
            />
          </div>
          <div className="min-w-0 text-left">
            <p className="truncate text-xs font-black uppercase text-white">
              Icon Scale
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
              Check readability
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
