import { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Link } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Gamepad2,
  Users,
  Settings,
  LogOut,
  ShieldCheck,
  BarChart3,
  Monitor,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Ensure user is an admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, nickname")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-[#050505] text-text-primary">
      {/* ADMIN SIDEBAR */}
      <aside className="w-[280px] bg-[#0c0c0e] border-r border-white/5 flex flex-col hidden md:flex sticky top-0 h-screen shrink-0 shadow-[20px_0_50px_rgba(0,0,0,0.5)]">
        <div className="h-24 flex items-center px-8 border-b border-white/5 shrink-0 bg-brand-primary/5">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="relative h-12 w-12 transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(155,27,48,0.5)]">
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
              <span className="font-display font-black text-white uppercase tracking-tighter text-xl leading-tight">
                ADMIN
              </span>
              <span className="font-display font-bold text-brand-primary uppercase tracking-[0.3em] text-[10px] leading-none">
                CONTROL PANEL
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 py-10 px-4 space-y-2 overflow-y-auto">
          {[
            {
              href: "/admin/dashboard",
              icon: LayoutDashboard,
              label: "Overview",
            },
            { href: "/admin/games", icon: Gamepad2, label: "Game Library" },
            { href: "/admin/users", icon: Users, label: "User Management" },
            {
              href: "/admin/reports",
              icon: BarChart3,
              label: "Global Reports",
            },
            {
              href: "/admin/platforms",
              icon: Monitor,
              label: "Platforms",
            },
            {
              href: "/admin/issues",
              icon: AlertTriangle,
              label: "Issues",
            },
            {
              href: "/admin/settings",
              icon: Settings,
              label: "System Settings",
            },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="flex items-center px-5 h-14 rounded-2xl text-sm font-black uppercase tracking-widest transition-all hover:bg-white/5 text-text-secondary hover:text-white group relative overflow-hidden">
                <item.icon className="mr-4 h-5 w-5 text-text-tertiary group-hover:text-brand-primary transition-colors" />
                {item.label}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-brand-primary group-hover:h-8 transition-all duration-300 rounded-r-full"></div>
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-8 border-t border-white/5 shrink-0 bg-white/2">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <div className="text-sm font-black text-white truncate uppercase tracking-tight flex items-center gap-2">
                <ShieldCheck className="h-3 w-3 text-brand-primary" />
                {profile.nickname}
              </div>
              <div className="text-[10px] text-brand-primary font-bold truncate uppercase tracking-[0.2em] mt-1">
                Super Admin
              </div>
            </div>
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
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-brand-primary/5 blur-[150px] pointer-events-none -z-10"></div>

        <header className="h-20 flex items-center justify-between px-10 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-50 shrink-0 md:hidden">
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
              Admin CP
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="font-black uppercase tracking-widest text-brand-primary"
          >
            Menu
          </Button>
        </header>

        <div className="flex-1 p-10 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
