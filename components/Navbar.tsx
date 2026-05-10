import { createClient } from "@/lib/supabase/server";
import { Link } from "@/lib/i18n/routing";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Button } from "./ui/button";
import { getTranslations } from "next-intl/server";
import { LogOut, ShieldCheck, Trophy, Gamepad2 } from "lucide-react";
import { signOut } from "@/app/[locale]/(auth)/actions";
import Image from "next/image";

export async function Navbar() {
  const t = await getTranslations("Navbar");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch profile to check role and display name
  let profile = null;
  if (user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("role, nickname, avatar_url")
      .eq("id", user.id)
      .single();
    profile = profileData;
  }
  const role = profile?.role;

  return (
    <nav className="sticky top-0 z-50 h-20 w-full border-b border-white/5 bg-bg-primary/60 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo & Main Links */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-12 w-12 transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(155,27,48,0.6)]">
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
              <span className="font-display text-[19px] font-black text-white group-hover:text-brand-primary transition-colors hidden sm:block uppercase tracking-tighter leading-tight">
                Samutprakan
              </span>
              <span className="font-display text-xs font-bold text-brand-primary hidden sm:block uppercase tracking-[0.2em] leading-none">
                Esports Association
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/tournaments"
              className="font-display text-sm font-bold uppercase tracking-widest text-text-secondary hover:text-white transition-all relative group/link"
            >
              {t("tournaments")}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-brand-primary transition-all group-hover/link:w-full"></span>
            </Link>
            <Link
              href="/games"
              className="font-display text-sm font-bold uppercase tracking-widest text-text-secondary hover:text-white transition-all relative group/link"
            >
              {t("games")}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-brand-primary transition-all group-hover/link:w-full"></span>
            </Link>
            <Link
              href="/about"
              className="font-display text-sm font-bold uppercase tracking-widest text-text-secondary hover:text-white transition-all relative group/link"
            >
              {t("about")}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-brand-primary transition-all group-hover/link:w-full"></span>
            </Link>
          </div>
        </div>

        {/* Right: Actions & Auth */}
        <div className="flex items-center gap-3 sm:gap-5">
          <LanguageSwitcher />

          {user ? (
            <div className="flex items-center gap-4">
              {role === "admin" && (
                <Link href="/admin/dashboard" className="hidden lg:block">
                  <Button
                    variant="outline"
                    className="font-display border-brand-primary/50 text-brand-primary hover:bg-brand-primary hover:text-white transition-all font-bold uppercase tracking-widest text-xs px-4 h-10 border-2"
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" /> {t("admin_cp")}
                  </Button>
                </Link>
              )}

              <div className="flex items-center gap-3">
                <Link
                  href={
                    role === "organizer" || role === "admin"
                      ? "/organizer/dashboard"
                      : "/player/dashboard"
                  }
                  className="flex items-center gap-3 group"
                >
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-black text-white tracking-tight group-hover:text-brand-primary transition-colors leading-none mb-1 flex items-center justify-end gap-2">
                      {role === "admin" ? (
                        <ShieldCheck className="h-3 w-3 text-brand-primary" />
                      ) : role === "organizer" ? (
                        <Trophy className="h-3 w-3 text-brand-primary" />
                      ) : (
                        <Gamepad2 className="h-3 w-3 text-brand-primary" />
                      )}
                      {profile?.nickname || user.email?.split("@")[0]}
                    </div>
                    <div className="text-xs text-brand-primary font-bold uppercase tracking-[0.2em] leading-none opacity-80">
                      {role === "admin"
                        ? t("role_admin")
                        : role === "organizer"
                          ? t("role_organizer")
                          : t("role_player")}
                    </div>
                  </div>
                  <div className="h-11 w-11 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center font-black text-brand-primary overflow-hidden relative group-hover:border-brand-primary/50 transition-all shadow-[0_0_20px_rgba(155,27,48,0.2)]">
                    {profile?.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt="Avatar"
                        fill
                        sizes="44px"
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
                </Link>

                <form
                  action={async () => {
                    "use server";
                    await signOut();
                  }}
                >
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 text-text-tertiary hover:text-brand-primary transition-all hover:bg-brand-primary/10 rounded-2xl"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="hidden sm:block">
                <Button
                  variant="ghost"
                  className="font-display text-text-secondary hover:text-white font-bold uppercase tracking-wide"
                >
                  {t("login")}
                </Button>
              </Link>
              <Link href="/register">
                <Button className="font-display bg-brand-primary text-white hover:bg-white hover:text-black hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all font-bold uppercase tracking-wide px-8">
                  {t("signup")}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
