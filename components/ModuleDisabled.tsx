import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/routing";
import { LockKeyhole } from "lucide-react";

interface ModuleDisabledProps {
  title: string;
  description: string;
}

export function ModuleDisabled({ title, description }: ModuleDisabledProps) {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <section className="w-full max-w-2xl text-center rounded-[3rem] border border-white/5 bg-[#0c0c0e] p-10 md:p-14 shadow-2xl">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-primary/20 bg-brand-primary/10 text-brand-primary">
            <LockKeyhole className="h-7 w-7" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">
            {title}
          </h1>
          <p className="mt-5 text-sm md:text-base font-medium leading-relaxed text-text-secondary">
            {description}
          </p>
          <Link href="/">
            <Button className="mt-10 bg-brand-primary text-white hover:bg-white hover:text-black font-black uppercase tracking-widest px-8">
              Back Home
            </Button>
          </Link>
        </section>
      </main>
    </div>
  );
}
