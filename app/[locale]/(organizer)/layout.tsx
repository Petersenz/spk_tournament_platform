import { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Link } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FolderKanban,
  Trophy,
  Users,
  LogOut,
  ShieldCheck,
  Settings,
} from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default async function OrganizerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = await getTranslations("Organizer");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, nickname, avatar_url")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "organizer" && profile?.role !== "admin") {
    redirect("/player/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-bg-primary text-text-primary">
      <aside className="w-[280px] bg-bg-secondary border-r border-white/5 flex flex-col hidden md:flex sticky top-0 h-screen shrink-0 shadow-2xl">
        <div className="h-24 flex items-center px-6 border-b border-white/5 shrink-0 bg-bg-primary/30">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="relative h-12 w-12 transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_0_10px_rgba(155,27,48,0.3)]">
              <Image
                src="/logo.png"
                alt="Logo"
                fill
                sizes="48px"
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-white uppercase tracking-tighter text-[16px] leading-tight">
                {t("sidebar.hub")}
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
          {[
            {
              href: "/organizer/dashboard",
              icon: LayoutDashboard,
              label: t("sidebar.dashboard"),
            },
            {
              href: "/organizer/projects",
              icon: FolderKanban,
              label: t("sidebar.projects"),
            },
            {
              href: "/organizer/tournaments",
              icon: Trophy,
              label: t("sidebar.tournaments"),
            },
            {
              href: "/organizer/participants",
              icon: Users,
              label: t("sidebar.participants"),
            },
            {
              href: "/organizer/settings",
              icon: Settings,
              label: t("sidebar.settings"),
            },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="flex items-center px-4 h-12 rounded-xl text-sm font-bold uppercase tracking-widest transition-all hover:bg-white/5 text-text-secondary hover:text-white group">
                <item.icon className="mr-3 h-5 w-5 text-text-tertiary group-hover:text-brand-primary transition-colors" />
                {item.label}
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-8 border-t border-white/5 shrink-0 bg-white/2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 truncate">
              <div className="h-10 w-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center font-black text-brand-primary overflow-hidden relative shrink-0">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt="Avatar"
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <span className="text-sm">
                    {(profile.nickname?.[0] || user.email?.[0])?.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="truncate">
                <div className="text-sm font-black text-white truncate uppercase tracking-tight flex items-center gap-2">
                  {profile.role === "admin" ? (
                    <ShieldCheck className="h-3 w-3 text-brand-primary shrink-0" />
                  ) : (
                    <Trophy className="h-3 w-3 text-brand-primary shrink-0" />
                  )}
                  {profile.nickname}
                </div>
                <div className="text-[10px] text-brand-primary font-bold truncate uppercase tracking-[0.2em] mt-1 opacity-80">
                  {profile.role === "admin" ? "Super Admin" : "Organizer Hub"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <form action="/api/auth/signout" method="POST">
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="text-text-tertiary hover:text-brand-primary transition-all hover:scale-125"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-subtle/20 via-transparent to-transparent">
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-bg-primary/80 backdrop-blur-md sticky top-0 z-10 shrink-0 md:hidden">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              <Image
                src="/logo.png"
                alt="Logo"
                fill
                sizes="40px"
                className="object-contain"
              />
            </div>
            <span className="font-display font-black uppercase tracking-tighter text-sm text-white">
              {t("sidebar.dashboard")}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-text-secondary font-bold uppercase tracking-widest"
          >
            Menu
          </Button>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
