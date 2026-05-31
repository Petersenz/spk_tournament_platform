import { createClient } from "@/lib/supabase/server";
import {
  ChevronRight,
  Trophy,
  Users,
  Gamepad2,
  Settings,
  Monitor,
} from "lucide-react";
import { Link } from "@/lib/i18n/routing";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return { title: t("admin_dashboard") };
}

export default async function AdminDashboardPage() {
  const t = await getTranslations("Admin.dashboard_page");
  const supabase = await createClient();

  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });
  const { count: tournamentCount } = await supabase
    .from("tournaments")
    .select("*", { count: "exact", head: true });
  const { count: gameCount } = await supabase
    .from("games")
    .select("*", { count: "exact", head: true });
  const { count: platformCount } = await supabase
    .from("platforms")
    .select("*", { count: "exact", head: true });

  const stats = [
    {
      label: t("stats.users.label"),
      value: userCount || 0,
      icon: Users,
      color: "text-brand-primary",
      trend: t("stats.users.trend"),
    },
    {
      label: t("stats.tournaments.label"),
      value: tournamentCount || 0,
      icon: Trophy,
      color: "text-warning",
      trend: t("stats.tournaments.trend"),
    },
    {
      label: t("stats.games.label"),
      value: gameCount || 0,
      icon: Gamepad2,
      color: "text-success",
      trend: t("stats.games.trend"),
    },
    {
      label: t("stats.platforms.label"),
      value: platformCount || 0,
      icon: Monitor,
      color: "text-info",
      trend: t("stats.platforms.trend"),
    },
  ];

  const systemTools = [
    {
      label: t("tools.register_game.label"),
      icon: Gamepad2,
      href: "/admin/games/new",
      description: t("tools.register_game.description"),
    },
    {
      label: t("tools.manage_users.label"),
      icon: Users,
      href: "/admin/users",
      description: t("tools.manage_users.description"),
    },
    {
      label: t("tools.platforms.label"),
      icon: Monitor,
      href: "/admin/platforms",
      description: t("tools.platforms.description"),
    },
    {
      label: t("tools.settings.label"),
      icon: Settings,
      href: "/admin/settings",
      description: t("tools.settings.description"),
    },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="h-2 w-2 rounded-full bg-brand-primary animate-pulse"></span>
            <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em]">
              {t("badge")}
            </span>
          </div>
          <h1 className="font-display text-5xl font-black uppercase tracking-tighter text-white">
            {t("title")}
          </h1>
          <p className="text-text-secondary mt-2 font-medium">
            {t("subtitle")}
          </p>
        </div>

        <Link href="/organizer/dashboard">
          <Button
            variant="outline"
            className="h-12 rounded-2xl border-2 border-brand-primary/50 bg-transparent px-6 font-display text-xs font-bold uppercase tracking-widest text-brand-primary transition-all hover:bg-brand-primary hover:text-white"
          >
            <Trophy className="mr-2 h-4 w-4" />
            {t("organizer_dashboard")}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-[#0c0c0e] border border-white/5 rounded-[2.5rem] p-10 hover:border-brand-primary/30 transition-all group relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-all duration-700">
              <stat.icon className="h-24 w-24" />
            </div>
            <div className="flex items-center justify-between mb-6 relative z-10">
              <span className="text-[11px] text-text-tertiary font-black uppercase tracking-[0.2em]">
                {stat.label}
              </span>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className="font-display text-5xl font-black text-white relative z-10 mb-2">
              {stat.value}
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-text-tertiary uppercase tracking-widest relative z-10">
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white">
            {t("tools_title")}
          </h2>
          <p className="text-sm text-text-tertiary font-medium mt-2">
            {t("tools_subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {systemTools.map((action) => (
            <Link key={action.href} href={action.href} className="block group">
              <div className="h-full p-7 bg-white/2 border border-white/5 rounded-[2rem] hover:bg-brand-primary hover:border-brand-primary transition-all duration-500 shadow-xl">
                <div className="flex items-start justify-between gap-5">
                  <div className="space-y-4">
                    <action.icon className="h-6 w-6 text-brand-primary group-hover:text-white transition-colors" />
                    <div>
                      <div className="font-black uppercase tracking-widest text-white text-sm">
                        {action.label}
                      </div>
                      <p className="text-xs text-text-tertiary group-hover:text-white/75 font-medium leading-relaxed mt-2">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-brand-primary group-hover:text-white transition-colors shrink-0" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
