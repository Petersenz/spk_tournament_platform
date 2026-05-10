import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { Link } from "@/lib/i18n/routing";
import { Gamepad2, Zap } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return { title: t("games") };
}

export default async function GamesPage() {
  const t = await getTranslations("Games");
  const supabase = await createClient();

  // Fetch games with their tournament count
  const { data: games } = await supabase
    .from("games")
    .select("*, tournaments(count)")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      <Navbar />

      {/* HERO SECTION */}
      <div className="relative h-[40vh] flex items-center justify-center overflow-hidden border-b border-white/5 bg-[#050505]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-primary/10 via-transparent to-transparent opacity-50"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent z-10"></div>

        <div className="relative z-20 text-center space-y-4 px-4 animate-in fade-in zoom-in-95 duration-1000">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="h-[1px] w-12 bg-brand-primary"></span>
            <span className="text-xs font-bold text-brand-primary uppercase tracking-[0.5em]">
              {t("battlegrounds")}
            </span>
            <span className="h-[1px] w-12 bg-brand-primary"></span>
          </div>
          <h1 className="font-display text-5xl md:text-8xl font-black uppercase tracking-tighter text-white drop-shadow-[0_0_30px_rgba(244,0,9,0.4)]">
            {t("title")}
          </h1>
          <p className="text-text-secondary text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {games?.map((g) => {
            const tournamentCount =
              (g.tournaments as unknown as { count: number }[])?.[0]?.count ||
              0;

            return (
              <Link
                key={g.id}
                href={`/games/${g.slug}`}
                className="group relative h-[480px] bg-bg-secondary border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-700 hover:border-brand-primary/50 hover:shadow-[0_0_50px_rgba(244,0,9,0.2)]"
              >
                {/* Background Cover Image */}
                <div className="absolute inset-0 z-0">
                  {g.cover_url ? (
                    <Image
                      src={
                        g.cover_url.startsWith("http")
                          ? g.cover_url
                          : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/game-assets/${g.cover_url}`
                      }
                      alt={g.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover opacity-40 group-hover:scale-110 group-hover:opacity-70 transition-all duration-1000"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-bg-tertiary to-bg-primary opacity-20"></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary via-bg-secondary/40 to-transparent z-10"></div>
                </div>

                {/* Content Overlay */}
                <div className="relative z-20 h-full p-10 flex flex-col justify-end">
                  <div className="mb-6 h-20 w-20 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-4 flex items-center justify-center group-hover:bg-brand-primary group-hover:border-brand-primary transition-all duration-500 shadow-xl overflow-hidden">
                    {g.logo_url ? (
                      <Image
                        src={
                          g.logo_url.startsWith("http")
                            ? g.logo_url
                            : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/game-assets/${g.logo_url}`
                        }
                        alt="Logo"
                        width={60}
                        height={60}
                        className="object-contain drop-shadow-lg rounded-md"
                      />
                    ) : (
                      <Gamepad2 className="h-10 w-10 text-brand-primary group-hover:text-white transition-colors" />
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Zap className="h-3 w-3 text-brand-primary fill-brand-primary" />
                      <span className="text-xs text-brand-primary font-bold uppercase tracking-[0.2em] leading-none">
                        {g.slug}
                      </span>
                    </div>
                    <h3 className="font-display text-4xl font-black text-white uppercase tracking-tighter leading-none group-hover:text-brand-primary transition-colors">
                      {g.name}
                    </h3>
                    <p className="text-sm text-text-tertiary font-medium line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                      {g.description || t("default_desc")}
                    </p>
                  </div>

                  <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                    <div className="text-xs text-text-tertiary font-bold uppercase tracking-widest leading-none">
                      {t("arenas")}
                    </div>
                    <div className="text-xl font-display font-black text-white leading-none">
                      {tournamentCount}
                    </div>
                  </div>
                </div>

                {/* Top Accent Line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
            );
          })}

          {/* If No Games */}
          {games?.length === 0 && (
            <div className="col-span-full py-32 text-center bg-white/2 border border-dashed border-white/5 rounded-2xl">
              <Gamepad2 className="h-20 w-20 mx-auto text-text-tertiary opacity-20 mb-6" />
              <p className="text-text-tertiary font-bold uppercase tracking-widest text-sm">
                {t("no_games_found")}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
