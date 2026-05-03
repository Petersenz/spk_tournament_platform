"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Gamepad2, Upload, CheckCircle2, Loader2, Save } from "lucide-react";
import Image from "next/image";

interface GameFormProps {
  initialData?: {
    name?: string;
    slug?: string;
    description?: string;
    logo_url?: string;
    cover_url?: string;
  };
  id?: string;
}

export function GameForm({ initialData, id }: GameFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const isEdit = !!id;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const rawSlug = formData.get("slug") as string;
    const description = formData.get("description") as string;

    // Create a URL-friendly slug
    const slug = (rawSlug || name)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/[^\w\-]+/g, "") // Remove all non-word chars
      .replace(/\-\-+/g, "-"); // Replace multiple - with single -

    let logo_url = initialData?.logo_url || "";
    let cover_url = initialData?.cover_url || "";

    // Upload Logo if new file selected
    if (logoFile) {
      const { data } = await supabase.storage
        .from("game-assets")
        .upload(`logos/${Date.now()}-${logoFile.name}`, logoFile);
      if (data) logo_url = data.path;
    }

    // Upload Cover if new file selected
    if (coverFile) {
      const { data } = await supabase.storage
        .from("game-assets")
        .upload(`covers/${Date.now()}-${coverFile.name}`, coverFile);
      if (data) cover_url = data.path;
    }

    if (isEdit) {
      // Update
      const { error } = await supabase
        .from("games")
        .update({ name, slug, description, logo_url, cover_url })
        .eq("id", id);
      if (error) alert(error.message);
    } else {
      // Create
      const { error } = await supabase.from("games").insert({
        name,
        slug,
        description,
        logo_url,
        cover_url,
        is_active: true,
      });
      if (error) alert(error.message);
    }

    setLoading(false);
    router.push("/admin/games");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8 bg-[#0c0c0e] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
              <Gamepad2 className="h-6 w-6" />
            </div>
            <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white">
              {isEdit ? "Update Metadata" : "Title Metadata"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">
                Game Name
              </Label>
              <Input
                name="name"
                defaultValue={initialData?.name}
                required
                className="bg-white/5 border-white/10 h-14 rounded-xl focus:border-brand-primary transition-all text-white font-bold"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">
                Slug (URL friendly)
              </Label>
              <Input
                name="slug"
                defaultValue={initialData?.slug}
                required
                className="bg-white/5 border-white/10 h-14 rounded-xl focus:border-brand-primary transition-all text-white font-bold"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">
              Description
            </Label>
            <Textarea
              name="description"
              defaultValue={initialData?.description}
              className="bg-white/5 border-white/10 min-h-[150px] rounded-2xl focus:border-brand-primary transition-all text-white font-medium p-6"
            />
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-[#0c0c0e] border border-white/5 p-8 rounded-[2.5rem] shadow-xl">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary mb-4 block">
              Game Logo (PNG)
            </Label>
            <div className="relative h-40 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center group hover:border-brand-primary transition-all cursor-pointer overflow-hidden">
              {logoFile || initialData?.logo_url ? (
                <div className="relative h-full w-full flex items-center justify-center bg-white/5">
                  {logoFile ? (
                    <div className="text-center">
                      <CheckCircle2 className="h-10 w-10 text-success mx-auto mb-2" />
                      <p className="text-[10px] font-bold text-white truncate px-4">
                        {logoFile.name}
                      </p>
                    </div>
                  ) : (
                    <Image
                      src={
                        initialData?.logo_url?.startsWith("http")
                          ? initialData.logo_url
                          : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/game-assets/${initialData?.logo_url || ""}`
                      }
                      alt="Logo"
                      fill
                      className="object-contain p-4"
                    />
                  )}
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-text-tertiary group-hover:text-brand-primary transition-colors mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">
                    Select Logo
                  </span>
                </>
              )}
              <input
                type="file"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/*"
              />
            </div>
          </div>

          <div className="bg-[#0c0c0e] border border-white/5 p-8 rounded-[2.5rem] shadow-xl">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary mb-4 block">
              Cover Image (Wide)
            </Label>
            <div className="relative h-40 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center group hover:border-brand-primary transition-all cursor-pointer overflow-hidden">
              {coverFile || initialData?.cover_url ? (
                <div className="relative h-full w-full flex items-center justify-center">
                  {coverFile ? (
                    <div className="text-center">
                      <CheckCircle2 className="h-10 w-10 text-success mx-auto mb-2" />
                      <p className="text-[10px] font-bold text-white truncate px-4">
                        {coverFile.name}
                      </p>
                    </div>
                  ) : (
                    <Image
                      src={
                        initialData?.cover_url?.startsWith("http")
                          ? initialData.cover_url
                          : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/game-assets/${initialData?.cover_url || ""}`
                      }
                      alt="Cover"
                      fill
                      className="object-cover opacity-50"
                    />
                  )}
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-text-tertiary group-hover:text-brand-primary transition-colors mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">
                    Select Cover
                  </span>
                </>
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
            disabled={loading}
            className="w-full bg-brand-primary text-white hover:bg-white hover:text-black py-8 rounded-2xl font-black uppercase tracking-widest text-base shadow-[0_0_30px_rgba(244,0,9,0.4)] transition-all"
          >
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : isEdit ? (
              <>
                <Save className="mr-2 h-5 w-5" /> Save Changes
              </>
            ) : (
              "Register Title"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
