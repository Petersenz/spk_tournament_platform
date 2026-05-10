import { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Link } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";
import { Gamepad2, History, Settings, ShieldCheck, LogOut } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

export default async function PlayerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = await getTranslations("Player");
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

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-12">
        {/* SIDEBAR */}
        <aside className="w-full md:w-72 shrink-0 flex flex-col gap-6">
          <div className="bg-bg-secondary border border-white/5 rounded-3xl p-6 sticky top-32 shadow-xl flex flex-col h-fit">
            <nav className="space-y-2 flex-1">
              {[
                {
                  href: "/player/dashboard",
                  icon: Gamepad2,
                  label: t("sidebar.my_tournaments"),
                },
                {
                  href: "/player/history",
                  icon: History,
                  label: t("sidebar.history"),
                },
                {
                  href: "/player/settings",
                  icon: Settings,
                  label: t("sidebar.settings"),
                },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <div className="flex items-center px-4 py-4 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all hover:bg-white/5 text-text-secondary hover:text-white group">
                    <item.icon className="mr-3 h-5 w-5 text-text-tertiary group-hover:text-brand-primary transition-colors" />
                    {item.label}
                  </div>
                </Link>
              ))}
            </nav>

            <div className="mt-8 pt-8 border-t border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 truncate">
                  <div className="h-12 w-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center font-black text-brand-primary overflow-hidden relative shrink-0 shadow-[0_0_20px_rgba(155,27,48,0.15)]">
                    {profile?.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt="Avatar"
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-xl">
                        {(
                          profile?.nickname?.[0] || user.email?.[0]
                        )?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="truncate">
                    <div className="text-sm font-black text-white truncate uppercase tracking-tight flex items-center gap-2">
                      {profile?.role === "admin" ? (
                        <ShieldCheck className="h-3 w-3 text-brand-primary shrink-0" />
                      ) : (
                        <Gamepad2 className="h-3 w-3 text-brand-primary shrink-0" />
                      )}
                      {profile?.nickname || user.email?.split("@")[0]}
                    </div>
                    <div className="text-[10px] text-brand-primary font-bold truncate uppercase tracking-[0.2em] mt-1 opacity-80">
                      {profile?.role === "admin"
                        ? "Super Admin"
                        : "Active Player"}
                    </div>
                  </div>
                </div>
                <form action="/api/auth/signout" method="POST">
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="text-text-tertiary hover:text-brand-primary transition-all hover:scale-125 ml-2"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 animate-in fade-in slide-in-from-right-4 duration-500">
          {children}
        </main>
      </div>
    </div>
  );
}
