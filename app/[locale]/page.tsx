import { createClient } from "@/lib/supabase/server";
import { getLocale, getTranslations } from "next-intl/server";
import { getSiteSettings } from "@/lib/cms/site-settings";
import { getContentBlocks } from "@/lib/cms/content-blocks";
import { getFeatureFlags } from "@/lib/cms/feature-flags";
import { getNavigationItems } from "@/lib/cms/navigation";

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
import { Trophy, Users, Zap, Shield, Mail } from "lucide-react";

type FooterIcon = React.ComponentType<{ className?: string }>;

interface FooterLink {
  href: string;
  label: string;
  icon: FooterIcon;
  external: boolean;
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.5-3.91 3.77-3.91 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.56v1.91h2.78l-.44 2.91h-2.34V22C18.34 21.24 22 17.08 22 12.06Z" />
    </svg>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M20.32 4.37A19.8 19.8 0 0 0 15.37 2.8a.07.07 0 0 0-.08.04c-.22.39-.46.9-.63 1.3a18.38 18.38 0 0 0-5.52 0 12.6 12.6 0 0 0-.64-1.3.08.08 0 0 0-.08-.04 19.74 19.74 0 0 0-4.95 1.57.07.07 0 0 0-.03.03C.31 9.09-.47 13.66.03 18.18c0 .02.02.05.04.06a19.9 19.9 0 0 0 6.07 3.08.08.08 0 0 0 .08-.03c.47-.64.88-1.32 1.24-2.03a.08.08 0 0 0-.04-.1 13.12 13.12 0 0 1-1.9-.91.08.08 0 0 1 0-.13c.13-.1.26-.2.38-.3a.08.08 0 0 1 .08-.01c3.97 1.82 8.27 1.82 12.2 0a.08.08 0 0 1 .09.01c.12.1.25.2.38.3a.08.08 0 0 1 0 .13 12.5 12.5 0 0 1-1.9.91.08.08 0 0 0-.04.1c.36.71.78 1.39 1.24 2.03a.08.08 0 0 0 .08.03 19.84 19.84 0 0 0 6.08-3.08.08.08 0 0 0 .03-.06c.6-5.23-.98-9.77-3.84-13.78a.06.06 0 0 0-.04-.04ZM8.02 15.43c-1.2 0-2.18-1.1-2.18-2.45 0-1.35.97-2.45 2.18-2.45 1.22 0 2.2 1.11 2.18 2.45 0 1.35-.97 2.45-2.18 2.45Zm7.97 0c-1.2 0-2.18-1.1-2.18-2.45 0-1.35.97-2.45 2.18-2.45 1.22 0 2.2 1.11 2.18 2.45 0 1.35-.96 2.45-2.18 2.45Z" />
    </svg>
  );
}

function getExternalHref(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export default async function HomePage() {
  const locale = await getLocale();
  const t = await getTranslations("HomePage");
  const siteSettings = await getSiteSettings(locale);
  const featureFlags = await getFeatureFlags();
  const contentBlocks = await getContentBlocks(locale, {
    home_hero: {
      title: t("hero.title"),
      subtitle: siteSettings.tagline || t("hero.subtitle"),
      ctaLabel: t("hero.cta_primary"),
      ctaHref: "/tournaments",
    },
    about_intro: {},
    partner_cta: {},
  });
  const homeHero = contentBlocks.home_hero;
  const heroCtaHref = featureFlags.tournamentsEnabled
    ? homeHero.ctaHref || "/tournaments"
    : "";
  const footerNavItems = await getNavigationItems(
    locale,
    "public_footer",
    featureFlags,
  );
  const supabase = await createClient();
  const footerLinks: FooterLink[] = [];

  if (siteSettings.contactEmail) {
    footerLinks.push({
      href: `mailto:${siteSettings.contactEmail}`,
      label: "Email",
      icon: Mail,
      external: false,
    });
  }

  if (siteSettings.facebookUrl) {
    footerLinks.push({
      href: getExternalHref(siteSettings.facebookUrl),
      label: "Facebook",
      icon: FacebookIcon,
      external: true,
    });
  }

  if (siteSettings.discordUrl) {
    footerLinks.push({
      href: getExternalHref(siteSettings.discordUrl),
      label: "Discord",
      icon: DiscordIcon,
      external: true,
    });
  }

  // Fetch top 3 upcoming tournaments only when the public module is enabled.
  const { data: featured } = featureFlags.tournamentsEnabled
    ? await supabase
        .from("tournaments")
        .select("*, projects(name), games(name)")
        .eq("status", "registration_open")
        .limit(3)
        .order("created_at", { ascending: false })
    : { data: null };

  return (
    <div className="relative flex min-h-screen flex-col bg-bg-primary text-text-primary">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="hero-bg-layer pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-subtle via-bg-primary to-bg-primary opacity-50"></div>
            <HeroParticles />
          </div>

          <div className="hero-shapes pointer-events-none absolute inset-0">
            <div
              className="hero-shape absolute border-brand-primary opacity-20 left-[10%] top-[20%] w-20 h-20"
              style={{ "--rotation": "45deg" } as React.CSSProperties}
            ></div>
            <div
              className="hero-shape absolute border-brand-primary opacity-10 right-[15%] bottom-[30%] w-32 h-32"
              style={{ "--rotation": "-15deg" } as React.CSSProperties}
            ></div>
          </div>

          <div className="relative z-10 w-full max-w-4xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h1 className="font-display text-5xl sm:text-6xl md:text-[80px] font-black tracking-tight uppercase leading-[1.1] text-white drop-shadow-[0_0_15px_rgba(244,0,9,0.5)] whitespace-pre-line">
              {homeHero.title}
            </h1>
            <p className="font-sans text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
              {homeHero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {heroCtaHref && (
                <Link href={heroCtaHref}>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto font-display text-base tracking-wide uppercase font-bold bg-brand-primary text-white hover:bg-brand-hover hover:shadow-[0_0_20px_rgba(244,0,9,0.5)] transition-all px-10 py-7"
                  >
                    {homeHero.ctaLabel || t("hero.cta_primary")}
                  </Button>
                </Link>
              )}
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
        {featureFlags.tournamentsEnabled && (
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
        )}
      </main>

      {/* FOOTER */}
      <footer className="relative z-20 py-20 bg-bg-tertiary border-t border-white/5 text-center">
        <div className="font-display font-black text-xl text-white mb-3 uppercase tracking-tighter leading-none">
          {siteSettings.siteName}
        </div>
        <p className="text-xs text-text-tertiary uppercase font-bold tracking-[0.3em] leading-relaxed">
          {siteSettings.footerText || t("footer.copyright")}
        </p>
        {footerNavItems.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {footerNavItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="text-[10px] font-black uppercase tracking-[0.25em] text-text-tertiary transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
        {footerLinks.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {footerLinks.map(({ href, label, icon: Icon, external }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
                className="group inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-text-secondary transition-all hover:-translate-y-0.5 hover:border-brand-primary/60 hover:bg-brand-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-tertiary"
              >
                <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
              </a>
            ))}
          </div>
        )}
      </footer>
    </div>
  );
}
