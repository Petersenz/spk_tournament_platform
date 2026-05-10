import { ReactNode } from "react";
import { Link } from "@/lib/i18n/routing";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const t = useTranslations("Auth.layout");

  return (
    <div className="flex min-h-screen bg-[#050505] overflow-hidden font-display">
      {/* LEFT SIDE: VISUAL & IDENTITY (Hidden on Mobile, 2/5 on Desktop) */}
      <div className="hidden lg:flex lg:w-2/5 relative flex-col items-center justify-center p-12 overflow-hidden border-r border-white/5">
        {/* Generated Cinematic Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/esports_bg.png"
            alt="Cinematic Background"
            fill
            sizes="100vw"
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#050505]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/50 via-transparent to-[#050505]"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-10 max-w-sm">
          <Link href="/" className="group">
            <div className="relative h-48 w-48 transition-all duration-700 group-hover:scale-110 drop-shadow-[0_0_50px_rgba(244,0,9,0.6)]">
              <Image
                src="/logo.png"
                alt="Logo"
                fill
                sizes="192px"
                className="object-contain"
                priority
              />
            </div>
          </Link>
          <div className="space-y-4">
            <p className="text-sm md:text-base text-text-tertiary font-medium uppercase tracking-[0.2em] leading-relaxed opacity-80 max-w-[320px] mx-auto text-balance">
              {t("subtitle")}
            </p>
          </div>

          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-brand-primary/30"
              ></span>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: FORM (Full on Mobile, 3/5 on Desktop) */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-4 md:p-12 relative overflow-y-auto custom-scrollbar">
        {/* Background Gradients for Form Side */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-primary/10 rounded-full blur-[150px]"></div>
        </div>

        <div className="w-full max-w-[500px] animate-in fade-in slide-in-from-right-10 duration-1000">
          {/* Mobile Logo (Shown only on small screens) */}
          <div className="lg:hidden flex justify-center mb-10">
            <Image
              src="/logo.png"
              alt="Logo"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>

          <div className="glass-panel rounded-[3rem] border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="p-1 bg-gradient-to-br from-white/10 via-transparent to-transparent">
              <div className="bg-[#0c0c0e]/95 backdrop-blur-3xl rounded-[2.9rem] p-2 md:p-6">
                {children}
              </div>
            </div>
          </div>

          {/* Copyright Section Removed as requested */}
        </div>
      </div>
    </div>
  );
}
