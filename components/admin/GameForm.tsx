"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Gamepad2,
  Upload,
  CheckCircle2,
  Loader2,
  Save,
  Rocket,
  ShieldCheck,
  Calendar,
  Building2,
  Tags,
} from "lucide-react";
import Image from "next/image";
import { saveGameAction } from "@/app/[locale]/(admin)/admin/games/actions";

interface Game {
  id?: string;
  name?: string;
  slug?: string;
  category?: string;
  developer?: string;
  release_year?: number;
  description?: string;
  is_active?: boolean;
  logo_url?: string;
  cover_url?: string;
}

interface GameFormProps {
  initialData?: Game;
  id?: string;
}

export function GameForm({ initialData, id }: GameFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!id;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append("is_active", String(isActive));

    startTransition(async () => {
      let logo_url = initialData?.logo_url || "";
      let cover_url = initialData?.cover_url || "";

      // Upload Logo
      if (logoFile) {
        const { data, error: uploadError } = await supabase.storage
          .from("game-assets")
          .upload(`logos/${Date.now()}-${logoFile.name}`, logoFile);
        if (uploadError) {
          setError("Logo Upload Failed: " + uploadError.message);
          return;
        }
        if (data) logo_url = data.path;
      }

      // Upload Cover
      if (coverFile) {
        const { data, error: uploadError } = await supabase.storage
          .from("game-assets")
          .upload(`covers/${Date.now()}-${coverFile.name}`, coverFile);
        if (uploadError) {
          setError("Cover Upload Failed: " + uploadError.message);
          return;
        }
        if (data) cover_url = data.path;
      }

      formData.append("logo_url", logo_url);
      formData.append("cover_url", cover_url);

      const result = await saveGameAction(id, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/admin/games");
        router.refresh();
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20"
    >
      {error && (
        <div className="p-6 bg-error/10 border border-error/20 rounded-[2rem] text-error text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
          <ShieldCheck className="h-5 w-5" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* CORE METADATA */}
        <div className="lg:col-span-2 space-y-8 bg-[#0c0c0e] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-brand-primary/10 transition-all duration-700"></div>

          <div className="flex items-center gap-4 mb-4">
            <div className="h-14 w-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
              <Gamepad2 className="h-7 w-7" />
            </div>
            <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white">
              {isEdit ? "Refine Metadata" : "Title Metadata"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">
                Game Name
              </Label>
              <Input
                name="name"
                defaultValue={initialData?.name}
                required
                className="bg-white/5 border-white/10 h-16 rounded-2xl text-white font-bold text-lg"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">
                Slug (URL)
              </Label>
              <Input
                name="slug"
                defaultValue={initialData?.slug}
                required
                className="bg-white/5 border-white/10 h-16 rounded-2xl text-white font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary flex items-center gap-2">
                <Tags className="h-3 w-3" /> Category
              </Label>
              <Select
                name="category"
                defaultValue={initialData?.category || "moba"}
              >
                <SelectTrigger className="bg-white/5 border-white/10 h-14 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-bg-secondary border-white/10">
                  <SelectItem value="moba">MOBA</SelectItem>
                  <SelectItem value="fps">FPS</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="fighting">Fighting</SelectItem>
                  <SelectItem value="rts">RTS</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary flex items-center gap-2">
                <Building2 className="h-3 w-3" /> Developer
              </Label>
              <Input
                name="developer"
                defaultValue={initialData?.developer}
                className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary flex items-center gap-2">
                <Calendar className="h-3 w-3" /> Release Year
              </Label>
              <Input
                name="release_year"
                type="number"
                defaultValue={initialData?.release_year}
                className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">
              Detailed Description
            </Label>
            <Textarea
              name="description"
              defaultValue={initialData?.description}
              className="bg-white/5 border-white/10 min-h-[150px] rounded-2xl p-6 text-white font-medium"
            />
          </div>

          <div className="flex items-center justify-between p-6 bg-white/2 rounded-2xl border border-white/5">
            <div className="flex items-center gap-4">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${isActive ? "bg-success/20 text-success" : "bg-white/5 text-text-tertiary"}`}
              >
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-black text-white uppercase tracking-tight">
                  Active Library Title
                </div>
                <div className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest">
                  Available for selection in tournaments
                </div>
              </div>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>

        {/* ASSET MANAGEMENT */}
        <div className="space-y-8">
          <div className="bg-[#0c0c0e] border border-white/5 p-8 rounded-[2.5rem] shadow-xl space-y-6">
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">
                Brand Logo
              </Label>
              <p className="text-[9px] text-text-tertiary font-medium uppercase tracking-widest">
                Transparent PNG preferred
              </p>
            </div>
            <div className="relative h-48 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center group hover:border-brand-primary transition-all cursor-pointer overflow-hidden">
              {logoFile || initialData?.logo_url ? (
                <div className="relative h-full w-full flex items-center justify-center bg-white/2">
                  {logoFile ? (
                    <div className="text-center p-4">
                      <CheckCircle2 className="h-10 w-10 text-success mx-auto mb-2" />
                      <p className="text-[10px] font-bold text-white truncate max-w-[150px]">
                        {logoFile.name}
                      </p>
                    </div>
                  ) : (
                    <Image
                      src={
                        initialData?.logo_url?.startsWith("http")
                          ? initialData.logo_url
                          : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/game-assets/${initialData?.logo_url}`
                      }
                      alt="Logo"
                      fill
                      sizes="(max-width: 768px) 100vw, 300px"
                      className="object-contain p-8"
                    />
                  )}
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <Upload className="h-10 w-10 text-text-tertiary group-hover:text-brand-primary transition-all mx-auto" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">
                    Upload Logo
                  </span>
                </div>
              )}
              <input
                type="file"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/*"
              />
            </div>
          </div>

          <div className="bg-[#0c0c0e] border border-white/5 p-8 rounded-[2.5rem] shadow-xl space-y-6">
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">
                Cinematic Cover
              </Label>
              <p className="text-[9px] text-text-tertiary font-medium uppercase tracking-widest">
                High-res landscape image
              </p>
            </div>
            <div className="relative h-48 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center group hover:border-brand-primary transition-all cursor-pointer overflow-hidden">
              {coverFile || initialData?.cover_url ? (
                <div className="relative h-full w-full flex items-center justify-center">
                  {coverFile ? (
                    <div className="text-center p-4 relative z-20">
                      <CheckCircle2 className="h-10 w-10 text-success mx-auto mb-2" />
                      <p className="text-[10px] font-bold text-white truncate max-w-[150px]">
                        {coverFile.name}
                      </p>
                    </div>
                  ) : (
                    <Image
                      src={
                        initialData?.cover_url?.startsWith("http")
                          ? initialData.cover_url
                          : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/game-assets/${initialData?.cover_url}`
                      }
                      alt="Cover"
                      fill
                      sizes="(max-width: 768px) 100vw, 600px"
                      className="object-cover opacity-40"
                    />
                  )}
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <Upload className="h-10 w-10 text-text-tertiary group-hover:text-brand-primary transition-all mx-auto" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">
                    Upload Cover
                  </span>
                </div>
              )}
              <input
                type="file"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/*"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-brand-primary text-white hover:bg-white hover:text-black h-20 rounded-3xl font-black uppercase tracking-widest shadow-[0_0_50px_rgba(244,0,9,0.4)] transition-all group"
          >
            {isPending ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <div className="flex items-center gap-3">
                {isEdit ? (
                  <>
                    <Save className="h-6 w-6" /> Save Changes
                  </>
                ) : (
                  <>
                    <Rocket className="h-6 w-6" /> Register Title
                  </>
                )}
              </div>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
