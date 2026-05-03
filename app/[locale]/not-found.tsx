import { Link } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Trophy, Home, ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col relative overflow-hidden">
      <Navbar />

      {/* Background Cinematic Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-primary/10 blur-[150px] rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black/80"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
        {/* 404 Content */}
        <div className="text-center space-y-10 animate-in fade-in zoom-in-95 duration-1000">
          <div className="relative inline-block">
            <h1 className="font-display text-[150px] md:text-[250px] font-black leading-none uppercase tracking-tighter opacity-10 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <Trophy className="h-24 w-24 md:h-40 md:w-40 text-brand-primary drop-shadow-[0_0_50px_rgba(244,0,9,0.8)]" />
            </div>
          </div>

          <div className="max-w-xl mx-auto space-y-4">
            <h2 className="font-display text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
              {t("title")}
            </h2>
            <p className="text-text-tertiary text-lg font-medium leading-relaxed">
              {t("description")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
            <Link href="/">
              <Button className="bg-brand-primary text-white hover:bg-white hover:text-black h-16 px-10 rounded-2xl font-black uppercase tracking-widest transition-all shadow-[0_0_40px_rgba(244,0,9,0.3)] group">
                <Home className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                {t("return")}
              </Button>
            </Link>
            <Link href="/tournaments">
              <Button
                variant="ghost"
                className="text-text-secondary hover:text-white font-black uppercase tracking-widest h-16 px-10 rounded-2xl group"
              >
                <ArrowLeft className="mr-3 h-5 w-5 group-hover:-translate-x-2 transition-transform" />
                {t("browse")}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Glitch Text */}
      <div className="absolute bottom-10 left-10 opacity-5 pointer-events-none hidden md:block z-20">
        <div className="font-display font-black text-4xl uppercase tracking-[0.5em] vertical-text">
          SYSTEM ERROR // LOST CONNECTION
        </div>
      </div>
    </div>
  );
}
