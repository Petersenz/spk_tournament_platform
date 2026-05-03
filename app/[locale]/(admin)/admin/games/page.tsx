import { createClient } from "@/lib/supabase/server";
import {
  Gamepad2,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/routing";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return { title: t("admin_games") };
}

export default async function AdminGamesPage() {
  const supabase = await createClient();
  const { data: games } = await supabase
    .from("games")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="font-display text-5xl font-black uppercase tracking-tighter text-white">
            Game Library
          </h1>
          <p className="text-text-secondary mt-2 font-medium">
            Manage titles, assets, and metadata for the entire platform.
          </p>
        </div>
        <Link href="/admin/games/new">
          <Button className="bg-brand-primary text-white hover:bg-white hover:text-black hover:shadow-[0_0_30px_rgba(244,0,9,0.5)] transition-all font-black uppercase tracking-widest px-10 py-7 rounded-2xl text-base shadow-2xl">
            <Plus className="mr-3 h-5 w-5" /> Add New Game
          </Button>
        </Link>
      </div>

      {/* GAMES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {games?.map((game) => (
          <div
            key={game.id}
            className="bg-[#0c0c0e] border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-brand-primary/50 transition-all duration-500 shadow-2xl flex flex-col"
          >
            {/* Game Cover */}
            <div className="h-48 bg-bg-tertiary relative overflow-hidden flex items-center justify-center">
              {game.cover_url ? (
                <Image
                  src={
                    game.cover_url.startsWith("http")
                      ? game.cover_url
                      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/game-assets/${game.cover_url}`
                  }
                  alt={game.name}
                  fill
                  className="object-cover opacity-60 group-hover:scale-110 group-hover:opacity-100 transition-all duration-1000"
                />
              ) : (
                <Gamepad2 className="h-20 w-20 text-white/5 group-hover:text-brand-primary/20 transition-colors duration-700" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] to-transparent z-10"></div>

              <div className="absolute top-6 right-6 z-20">
                {game.is_active ? (
                  <div className="flex items-center gap-2 bg-success/10 text-success border border-success/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                    <CheckCircle2 className="h-3 w-3" /> Active
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-white/5 text-text-tertiary border border-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                    <XCircle className="h-3 w-3" /> Inactive
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 flex-1 flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-xl bg-white/5 p-2 relative overflow-hidden shrink-0 border border-white/5">
                  {game.logo_url && (
                    <Image
                      src={
                        game.logo_url.startsWith("http")
                          ? game.logo_url
                          : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/game-assets/${game.logo_url}`
                      }
                      alt="Logo"
                      fill
                      className="object-contain p-1"
                    />
                  )}
                </div>
                <div className="truncate">
                  <h3 className="font-display text-xl font-black text-white uppercase tracking-tight truncate group-hover:text-brand-primary transition-colors">
                    {game.name}
                  </h3>
                  <div className="text-[10px] text-text-tertiary font-bold uppercase tracking-[0.2em]">
                    {game.slug}
                  </div>
                </div>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 mb-8 font-medium">
                {game.description || "No description provided for this title."}
              </p>

              <div className="mt-auto grid grid-cols-2 gap-4">
                <Link href={`/admin/games/${game.id}`} className="block">
                  <Button
                    variant="outline"
                    className="w-full border-white/5 text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px] rounded-xl h-11 transition-all"
                  >
                    <Edit2 className="mr-2 h-3 w-3 text-brand-primary" /> Edit
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full text-text-tertiary hover:text-error hover:bg-error/5 font-black uppercase tracking-widest text-[10px] rounded-xl h-11 transition-all"
                >
                  <Trash2 className="mr-2 h-3 w-3" /> Delete
                </Button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State / Add New Card */}
        <Link href="/admin/games/new" className="group">
          <div className="h-full min-h-[400px] border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center p-10 hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all duration-500 group-hover:scale-[0.98]">
            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:bg-brand-primary group-hover:text-white transition-all duration-500 shadow-2xl">
              <Plus className="h-10 w-10 text-text-tertiary group-hover:text-white transition-colors" />
            </div>
            <div className="text-center">
              <div className="font-display text-xl font-black text-white uppercase tracking-tight mb-2">
                Register Game
              </div>
              <p className="text-xs text-text-tertiary font-bold uppercase tracking-widest leading-loose">
                Expand the platform&apos;s ecosystem
                <br />
                by adding new competitive titles.
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
