import Image from "next/image";
import { getLocale } from "next-intl/server";
import { getSiteSettings } from "@/lib/cms/site-settings";
import { Link } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";

export default async function MaintenancePage() {
  const locale = await getLocale();
  const siteSettings = await getSiteSettings(locale);

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center px-4 py-20">
      <section className="w-full max-w-xl text-center rounded-[3rem] border border-white/5 bg-[#0c0c0e] p-10 md:p-14 shadow-2xl">
        <div className="relative mx-auto mb-8 h-24 w-24">
          <Image
            src={siteSettings.logoUrl}
            alt={siteSettings.siteName}
            fill
            sizes="96px"
            className="object-contain"
            priority
          />
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">
          Maintenance Mode
        </h1>
        <p className="mt-5 text-sm md:text-base font-medium leading-relaxed text-text-secondary">
          The platform is temporarily unavailable while the administration team
          performs updates. Please check back shortly.
        </p>
        <Link href="/login">
          <Button className="mt-10 bg-brand-primary text-white hover:bg-white hover:text-black font-black uppercase tracking-widest">
            Admin Login
          </Button>
        </Link>
      </section>
    </main>
  );
}
