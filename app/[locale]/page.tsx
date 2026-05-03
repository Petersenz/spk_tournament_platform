import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return { title: t("home") };
}
import { Link } from "@/lib/i18n/routing";
import { HeroParticles } from "@/components/HeroParticles";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Zap, Shield } from "lucide-react";

export default async function HomePage() {
  const t = await getTranslations("HomePage");
  const supabase = await createClient();

  // Fetch top 3 upcoming tournaments
  const { data: featured } = await supabase
    .from("tournaments")
    .select("*, projects(name), games(name)")
    .eq("status", "registration_open")
    .limit(3)
    .order("created_at", { ascending: false });

  return (
    <div className="relative flex min-h-screen flex-col bg-bg-primary text-text-primary">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="hero-bg-layer">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-subtle via-bg-primary to-bg-primary opacity-50"></div>
            <HeroParticles />
          </div>

          <div className="hero-shapes pointer-events-none">
            <div
              className="hero-shape border-brand-primary opacity-20 left-[10%] top-[20%] w-20 h-20"
              style={{ "--rotation": "45deg" } as any}
            ></div>
            <div
              className="hero-shape border-brand-primary opacity-10 right-[15%] bottom-[30%] w-32 h-32"
              style={{ "--rotation": "-15deg" } as any}
            ></div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h1 className="font-display text-5xl sm:text-6xl md:text-[80px] font-black tracking-tight uppercase leading-[1.1] text-white drop-shadow-[0_0_15px_rgba(244,0,9,0.5)]">
              {t("hero.title")}
            </h1>
            <p className="font-sans text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/tournaments">
                <Button
                  size="lg"
                  className="w-full sm:w-auto font-display text-base tracking-wide uppercase font-bold bg-brand-primary text-white hover:bg-brand-hover hover:shadow-[0_0_20px_rgba(244,0,9,0.5)] transition-all px-10 py-7"
                >
                  {t("hero.cta_primary")}
                </Button>
              </Link>
              <Link href="/organizer/dashboard">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto font-display text-base tracking-wide uppercase font-bold border-white/10 text-text-primary hover:bg-white/5 hover:text-white transition-all bg-transparent px-10 py-7"
                >
                  {t("hero.cta_secondary")}
                </Button>
              </Link>
            </div>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center text-text-tertiary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="relative z-20 py-32 bg-bg-secondary border-y border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                {
                  icon: Trophy,
                  title: t("features.logic_title"),
                  desc: t("features.logic_desc"),
                },
                {
                  icon: Zap,
                  title: t("features.updates_title"),
                  desc: t("features.updates_desc"),
                },
                {
                  icon: Users,
                  title: t("features.teams_title"),
                  desc: t("features.teams_desc"),
                },
                {
                  icon: Shield,
                  title: t("features.stats_title"),
                  desc: t("features.stats_desc"),
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="p-8 bg-bg-tertiary/50 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-brand-primary/50 transition-all group"
                >
                  <f.icon className="h-10 w-10 text-brand-primary mb-6 group-hover:scale-110 transition-transform" />
                  <h3 className="font-display font-bold text-xl mb-3 uppercase tracking-tight">
                    {f.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED TOURNAMENTS */}
        <section className="relative z-20 py-32 bg-bg-primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-16">
              <div>
                <h2 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">
                  {t("arenas.title")}
                </h2>
                <div className="flex items-center gap-3 mt-4">
                  <span className="h-[2px] w-12 bg-brand-primary"></span>
                  <p className="text-text-secondary text-sm font-bold uppercase tracking-widest">
                    {t("arenas.subtitle")}
                  </p>
                </div>
              </div>
              <Link
                href="/tournaments"
                className="text-brand-primary font-bold hover:text-white transition-colors hidden sm:flex items-center gap-2 uppercase tracking-widest text-xs"
              >
                {t("arenas.view_all")} <span className="text-lg">→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featured?.map((tournament) => (
                <Link
                  key={tournament.id}
                  href={`/tournaments/${tournament.id}`}
                >
                  <div className="tilt-card h-full group">
                    <div className="tilt-card-inner bg-bg-secondary border border-white/5 rounded-3xl overflow-hidden hover:border-brand-primary/50 transition-all p-8 h-full flex flex-col relative">
                      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Trophy className="h-24 w-24" />
                      </div>
                      <div className="text-xs text-brand-primary font-bold uppercase tracking-[0.3em] mb-3 leading-none">
                        {tournament.projects?.name}
                      </div>
                      <h3 className="font-display text-2xl font-black mb-6 uppercase tracking-tight group-hover:text-brand-primary transition-colors text-white">
                        {tournament.name}
                      </h3>
                      <div className="mt-auto flex justify-between items-center text-xs font-bold uppercase tracking-widest text-text-tertiary pt-6 border-t border-white/5">
                        <span>{tournament.games?.name}</span>
                        <span className="text-brand-primary">
                          {t("status_registration_open")}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="relative z-20 py-20 bg-bg-tertiary border-t border-white/5 text-center">
        <div className="font-display font-black text-xl text-white mb-3 uppercase tracking-tighter leading-none">
          Samutprakan Esports Association
        </div>
        <p className="text-xs text-text-tertiary uppercase font-bold tracking-[0.3em] leading-relaxed">
          {t("footer.copyright")}
        </p>
      </footer>
    </div>
  );
}
