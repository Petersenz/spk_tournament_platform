"use client";

import { useState, useRef } from "react";
import { Link } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import {
  Briefcase,
  Image as ImageIcon,
  ChevronRight,
  ShieldAlert,
  Loader2,
  Save,
  Rocket,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";

interface Project {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
}

interface ProjectFormProps {
  initialData?: Project;
  submitAction: (
    formData: FormData,
  ) => Promise<{ error?: string; success?: boolean }>;
  cancelHref: string;
}

export function ProjectForm({
  initialData,
  submitAction,
  cancelHref,
}: ProjectFormProps) {
  const t = useTranslations("Organizer.forms");
  const common = useTranslations("Common");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Image Upload State
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialData?.logo_url || null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const clearFile = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const result = await submitAction(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <form
      action={handleSubmit}
      className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32"
    >
      {error && (
        <div className="p-6 bg-error/10 border border-error/20 rounded-[2rem] flex items-center gap-4 text-error animate-shake">
          <ShieldAlert className="h-6 w-6 shrink-0" />
          <div className="text-sm font-black uppercase tracking-widest">
            {error}
          </div>
        </div>
      )}

      {/* IDENTITY SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
            <Briefcase className="h-7 w-7" />
          </div>
          <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white">
            {t("brand")}
          </h2>
          <p className="text-text-tertiary text-sm leading-relaxed font-medium">
            {t("brand_desc")}
          </p>
        </div>

        <div className="lg:col-span-2 space-y-8 bg-[#0c0c0e] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="space-y-8">
            <div className="space-y-3">
              <Label
                htmlFor="name"
                className="text-sm font-black uppercase tracking-[0.15em] text-text-tertiary flex items-center gap-2 mb-2"
              >
                {t("org_name")} <span className="text-brand-primary">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Samutprakan Esport Association"
                required
                defaultValue={initialData?.name}
                className="bg-white/5 border-white/10 h-16 rounded-2xl text-white font-bold text-lg focus:ring-brand-primary transition-all px-8"
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="description"
                className="text-sm font-black uppercase tracking-[0.15em] text-text-tertiary mb-2 block"
              >
                {t("about_project")}
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="..."
                defaultValue={initialData?.description}
                className="bg-white/5 border-white/10 min-h-[120px] rounded-2xl p-6 text-white font-medium focus:ring-brand-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ASSETS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-warning/10 flex items-center justify-center text-warning border border-warning/20">
            <ImageIcon className="h-7 w-7" />
          </div>
          <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white">
            {t("assets")}
          </h2>
          <p className="text-text-tertiary text-sm leading-relaxed font-medium">
            {t("assets_desc")}
          </p>
        </div>

        <div className="lg:col-span-2 space-y-8 bg-[#0c0c0e] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="space-y-3">
            <Label className="text-sm font-black uppercase tracking-[0.15em] text-text-tertiary mb-2 block">
              {t("logo_url")}
            </Label>
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-white/2 rounded-2xl border border-white/5 border-dashed group-hover:border-brand-primary/50 transition-all">
              <div className="relative h-32 w-32 shrink-0 group/img">
                <div className="absolute inset-0 bg-brand-primary rounded-2xl blur-xl opacity-0 group-hover/img:opacity-10 transition-opacity"></div>
                <div className="relative h-full w-full rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      sizes="128px"
                      className="object-contain"
                    />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-text-tertiary opacity-20" />
                  )}
                </div>
                {previewUrl && (
                  <button
                    type="button"
                    onClick={clearFile}
                    className="absolute -top-2 -right-2 h-6 w-6 bg-error text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              <div className="flex-1 space-y-4 w-full">
                <div className="text-xs text-text-tertiary font-medium">
                  Recommended: 512x512px (PNG, JPG)
                </div>
                <div className="relative">
                  <input
                    type="file"
                    id="logo_file"
                    name="logo_file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-14 rounded-xl border-white/10 hover:bg-white/5 font-black uppercase tracking-widest text-xs"
                  >
                    <Upload className="mr-2 h-4 w-4" />{" "}
                    {previewUrl ? t("change_image") : t("select_image")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="fixed bottom-0 left-0 md:left-[280px] right-0 p-8 bg-[#050505]/80 backdrop-blur-3xl border-t border-white/5 z-[60] flex justify-center md:justify-end gap-6 rounded-t-[3rem]">
        <Link href={cancelHref}>
          <Button
            type="button"
            variant="ghost"
            className="text-xs font-black uppercase tracking-widest text-text-tertiary hover:text-white h-16 px-10"
          >
            {common("cancel")}
          </Button>
        </Link>
        <Button
          type="submit"
          disabled={pending}
          className="bg-brand-primary text-white hover:bg-white hover:text-black h-16 px-16 rounded-2xl font-black uppercase tracking-widest shadow-[0_0_50px_rgba(244,0,9,0.5)] transition-all group"
        >
          {pending ? (
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{common("loading")}</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {initialData ? (
                <>
                  <Save className="h-5 w-5" />
                  <span>{t("update_org")}</span>
                </>
              ) : (
                <>
                  <Rocket className="h-5 w-5" />
                  <span>{t("launch_project")}</span>
                </>
              )}
              <ChevronRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
            </div>
          )}
        </Button>
      </div>
    </form>
  );
}
