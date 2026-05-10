"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, Monitor, Loader2, Save, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PremiumModal } from "@/components/ui/PremiumModal";
import { useRouter } from "next/navigation";
import { createPlatform, updatePlatform, deletePlatform } from "./actions";
import { useTranslations } from "next-intl";

interface Platform {
  id: string;
  name: string;
  icon_url: string | null;
}

export function PlatformManagement({
  initialPlatforms,
}: {
  initialPlatforms: Platform[];
}) {
  const t = useTranslations("Admin");
  const common = useTranslations("Common");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleOpenModal = (platform: Platform | null = null) => {
    setEditingPlatform(platform);
    setError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingPlatform(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      let result;
      if (editingPlatform) {
        formData.append("id", editingPlatform.id);
        result = await updatePlatform(formData);
      } else {
        result = await createPlatform(formData);
      }

      if (result.success) {
        handleCloseModal();
        router.refresh();
      } else {
        setError(result.error || "Something went wrong");
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirm_delete"))) return;

    startTransition(async () => {
      const result = await deletePlatform(id);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error);
      }
    });
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="font-display text-5xl font-black uppercase tracking-tighter text-white">
            {t("platforms")}
          </h1>
          <p className="text-text-secondary mt-2 font-medium">
            {t("platforms_subtitle")}
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-brand-primary text-white hover:bg-white hover:text-black hover:shadow-[0_0_30px_rgba(244,0,9,0.5)] transition-all font-black uppercase tracking-widest px-10 py-7 rounded-2xl text-base shadow-2xl"
        >
          <Plus className="mr-3 h-5 w-5" /> {t("add_platform")}
        </Button>
      </div>

      {/* PLATFORMS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {initialPlatforms.map((platform) => (
          <div
            key={platform.id}
            className="bg-[#0c0c0e] border border-white/5 rounded-[2.5rem] p-8 group hover:border-brand-primary/50 transition-all duration-500 shadow-2xl flex flex-col items-center text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="h-20 w-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-brand-primary/10 group-hover:scale-110 transition-all duration-500 border border-white/5">
              {platform.icon_url ? (
                <div className="relative h-10 w-10">
                  <Image
                    src={platform.icon_url}
                    alt={platform.name}
                    fill
                    sizes="40px"
                    className="object-contain"
                  />
                </div>
              ) : (
                <Monitor className="h-10 w-10 text-text-tertiary group-hover:text-brand-primary transition-colors" />
              )}
            </div>

            <h3 className="font-display text-2xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-brand-primary transition-colors">
              {platform.name}
            </h3>

            <div className="mt-8 grid grid-cols-2 gap-4 w-full opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
              <Button
                variant="outline"
                onClick={() => handleOpenModal(platform)}
                className="w-full border-white/5 text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px] rounded-xl h-11 transition-all"
              >
                <Edit2 className="mr-2 h-3 w-3 text-brand-primary" />{" "}
                {common("edit")}
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleDelete(platform.id)}
                className="w-full text-text-tertiary hover:text-error hover:bg-error/5 font-black uppercase tracking-widest text-[10px] rounded-xl h-11 transition-all"
              >
                <Trash2 className="mr-2 h-3 w-3" /> {common("delete")}
              </Button>
            </div>
          </div>
        ))}

        {/* Add New Card */}
        <button
          onClick={() => handleOpenModal()}
          className="group h-full min-h-[300px] border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center p-10 hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all duration-500"
        >
          <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:bg-brand-primary group-hover:text-white transition-all duration-500 shadow-2xl">
            <Plus className="h-8 w-8 text-text-tertiary group-hover:text-white transition-colors" />
          </div>
          <div className="text-center">
            <div className="font-display text-xl font-black text-white uppercase tracking-tight mb-2">
              {t("add_platform")}
            </div>
          </div>
        </button>
      </div>

      <PremiumModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingPlatform ? t("edit_platform") : t("add_platform")}
        description="Global Device Configuration"
        variant="default"
      >
        <form onSubmit={handleSubmit} className="space-y-8 py-4">
          {error && (
            <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-[10px] font-black uppercase tracking-widest animate-shake">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-3">
              <Label
                htmlFor="name"
                className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary"
              >
                {t("platform_name")}
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={editingPlatform?.name}
                required
                placeholder="e.g. PlayStation 5"
                className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold focus:ring-brand-primary"
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="icon_url"
                className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary"
              >
                {t("platform_icon")}
              </Label>
              <Input
                id="icon_url"
                name="icon_url"
                defaultValue={editingPlatform?.icon_url || ""}
                placeholder="https://example.com/icon.png"
                className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold focus:ring-brand-primary"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCloseModal}
              className="flex-1 h-14 rounded-xl font-black uppercase tracking-widest text-text-tertiary hover:text-white"
            >
              <X className="mr-2 h-4 w-4" /> {common("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-brand-primary text-white hover:bg-white hover:text-black h-14 rounded-xl font-black uppercase tracking-widest shadow-[0_0_20px_rgba(244,0,9,0.3)] transition-all"
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />{" "}
                  {editingPlatform ? common("save") : t("add_platform")}
                </>
              )}
            </Button>
          </div>
        </form>
      </PremiumModal>
    </div>
  );
}
