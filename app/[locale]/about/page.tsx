import { Navbar } from "@/components/Navbar";
import { Shield, Users, Trophy, Heart } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: any) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return { title: t("about") };
}

export default async function AboutPage() {
  const t = await getTranslations("About");

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-32">
        <section className="text-center space-y-8 animate-in fade-in duration-1000">
          <h1 className="font-display text-5xl md:text-7xl font-black uppercase tracking-tighter text-white drop-shadow-[0_0_20px_rgba(244,0,9,0.3)]">
            {t("title")}
          </h1>
          <p className="text-xl text-text-secondary leading-relaxed max-w-3xl mx-auto font-medium">
            {t("description")}
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              icon: Trophy,
              title: t("values.excellence.title"),
              desc: t("values.excellence.desc"),
            },
            {
              icon: Users,
              title: t("values.community.title"),
              desc: t("values.community.desc"),
            },
            {
              icon: Shield,
              title: t("values.professionalism.title"),
              desc: t("values.professionalism.desc"),
            },
            {
              icon: Heart,
              title: t("values.passion.title"),
              desc: t("values.passion.desc"),
            },
          ].map((v, i) => (
            <div
              key={i}
              className="flex gap-6 p-10 bg-bg-secondary border border-white/5 rounded-[2.5rem] shadow-2xl hover:border-brand-primary/30 transition-all group"
            >
              <div className="h-14 w-14 rounded-2xl bg-brand-subtle flex items-center justify-center text-brand-primary shrink-0 group-hover:scale-110 transition-transform duration-500">
                <v.icon className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-display font-black text-xl mb-2 text-white uppercase tracking-tight group-hover:text-brand-primary transition-colors">
                  {v.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed font-medium">
                  {v.desc}
                </p>
              </div>
            </div>
          ))}
        </section>

        <section className="bg-brand-primary rounded-[3rem] p-16 text-center space-y-8 text-white overflow-hidden relative shadow-[0_0_50px_rgba(244,0,9,0.3)]">
          <div className="absolute top-0 right-0 h-64 w-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 h-40 w-40 bg-black/20 rounded-full -ml-20 -mb-20 blur-3xl"></div>

          <h2 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tighter relative z-10">
            {t("partner.title")}
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto text-lg font-medium relative z-10">
            {t("partner.description")}
          </p>
          <div className="font-black text-2xl md:text-3xl tracking-tighter bg-white/10 inline-block px-8 py-4 rounded-2xl border border-white/20 relative z-10">
            contact@spk-tournaments.com
          </div>
        </section>
      </main>
    </div>
  );
}
