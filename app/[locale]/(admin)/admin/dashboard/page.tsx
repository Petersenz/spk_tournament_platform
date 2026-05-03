import { createClient } from "@/lib/supabase/server";
import {
  Trophy,
  Users,
  Gamepad2,
  BarChart3,
  TrendingUp,
  ShieldAlert,
} from "lucide-react";
import { Link } from "@/lib/i18n/routing";
import { getTranslations } from "next-intl/server";

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
  const supabase = await createClient();

  // Fetch Global Stats
  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });
  const { count: tournamentCount } = await supabase
    .from("tournaments")
    .select("*", { count: "exact", head: true });
  const { count: gameCount } = await supabase
    .from("games")
    .select("*", { count: "exact", head: true });
  const { count: registrationCount } = await supabase
    .from("registrations")
    .select("*", { count: "exact", head: true });

  // Fetch Real Recent Activity
  const { data: recentRegistrations } = await supabase
    .from("registrations")
    .select("*, profiles(nickname), tournaments(name)")
    .order("created_at", { ascending: false })
    .limit(5);

  const stats = [
    {
      label: "Total Users",
      value: userCount || 0,
      icon: Users,
      color: "text-brand-primary",
      trend: "Global users",
    },
    {
      label: "Total Tournaments",
      value: tournamentCount || 0,
      icon: Trophy,
      color: "text-warning",
      trend: "Created arenas",
    },
    {
      label: "Game Library",
      value: gameCount || 0,
      icon: Gamepad2,
      color: "text-success",
      trend: "Supported titles",
    },
    {
      label: "Total Registrations",
      value: registrationCount || 0,
      icon: BarChart3,
      color: "text-info",
      trend: "Player entries",
    },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="h-2 w-2 rounded-full bg-brand-primary animate-pulse"></span>
            <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em]">
              Live Telemetry
            </span>
          </div>
          <h1 className="font-display text-5xl font-black uppercase tracking-tighter text-white">
            System Overview
          </h1>
          <p className="text-text-secondary mt-2 font-medium">
            Real-time platform metrics and global administration.
          </p>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div
            key={i}
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

      {/* RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white">
              Recent Registrations
            </h2>
            <Link
              href="/admin/reports"
              className="text-[10px] text-brand-primary font-black uppercase tracking-[0.2em] hover:text-white transition-colors"
            >
              View All Logs
            </Link>
          </div>
          <div className="bg-[#0c0c0e] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="p-4 bg-white/2 border-b border-white/5 grid grid-cols-4 text-[10px] font-black uppercase tracking-widest text-text-tertiary px-10">
              <span>Player</span>
              <span>Tournament</span>
              <span>Applied At</span>
              <span className="text-right">Status</span>
            </div>
            <div className="divide-y divide-white/5">
              {recentRegistrations?.length === 0 ? (
                <div className="p-20 text-center text-text-tertiary uppercase font-black tracking-widest text-xs">
                  No activity yet
                </div>
              ) : (
                recentRegistrations?.map((reg) => (
                  <div
                    key={reg.id}
                    className="px-10 py-6 grid grid-cols-4 items-center hover:bg-white/2 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary text-[10px] font-black uppercase">
                        {reg.profiles?.nickname?.charAt(0) || "P"}
                      </div>
                      <span className="text-sm font-black text-white">
                        {reg.profiles?.nickname}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-text-secondary truncate">
                      {reg.tournaments?.name}
                    </span>
                    <span className="text-xs text-text-tertiary font-medium">
                      {new Date(reg.created_at).toLocaleDateString()}
                    </span>
                    <div className="text-right">
                      <span
                        className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-wider ${
                          reg.status === "approved"
                            ? "bg-success/10 text-success border border-success/20"
                            : reg.status === "pending"
                              ? "bg-warning/10 text-warning border border-warning/20"
                              : "bg-white/5 text-text-tertiary"
                        }`}
                      >
                        {reg.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white">
            System Tools
          </h2>
          <div className="space-y-4">
            {[
              {
                label: "Register Game",
                icon: Gamepad2,
                href: "/admin/games/new",
              },
              {
                label: "Platform Config",
                icon: BarChart3,
                href: "/admin/settings",
              },
              {
                label: "Global Audit",
                icon: ShieldAlert,
                href: "/admin/reports",
              },
            ].map((action, i) => (
              <Link key={i} href={action.href} className="block group">
                <div className="p-8 bg-white/2 border border-white/5 rounded-[2rem] hover:bg-brand-primary hover:border-brand-primary transition-all duration-500 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <action.icon className="h-6 w-6 text-brand-primary group-hover:text-white transition-colors" />
                      <span className="font-black uppercase tracking-widest text-white">
                        {action.label}
                      </span>
                    </div>
                    <span className="text-2xl text-brand-primary group-hover:text-white transition-colors">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
