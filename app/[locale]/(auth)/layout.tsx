import { ReactNode } from "react";
import { Link } from "@/lib/i18n/routing";
import Image from "next/image";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] p-4 overflow-hidden relative">
      {/* Dynamic Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-primary/5 rounded-full blur-[150px]"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
      </div>

      <div className="w-full max-w-md space-y-10 relative z-10 animate-in fade-in zoom-in-95 duration-1000">
        <div className="flex flex-col items-center gap-6">
          <Link href="/" className="flex flex-col items-center gap-5 group">
            <div className="relative h-24 w-24 transition-all duration-700 group-hover:scale-110 drop-shadow-[0_0_30px_rgba(155,27,48,0.8)]">
              <Image
                src="/logo.png"
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="text-center space-y-1">
              <h1 className="font-display text-3xl font-black text-white uppercase tracking-tighter drop-shadow-2xl">
                Samutprakan Esports
              </h1>
              <div className="flex items-center justify-center gap-3">
                <span className="h-[1px] w-8 bg-brand-primary/50"></span>
                <p className="text-[11px] text-brand-primary font-black uppercase tracking-[0.4em]">
                  Association Portal
                </p>
                <span className="h-[1px] w-8 bg-brand-primary/50"></span>
              </div>
            </div>
          </Link>
        </div>

        <div className="bg-[#111111]/80 backdrop-blur-2xl border border-white/5 rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden">
          <div className="p-1 bg-gradient-to-br from-white/10 to-transparent rounded-[2rem]">
            <div className="bg-[#0c0c0e] rounded-[1.9rem] p-2">{children}</div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-[10px] text-text-tertiary uppercase font-bold tracking-widest">
            Official Tournament Management System
          </p>
        </div>
      </div>
    </div>
  );
}
