import { createClient } from "@/lib/supabase/server";
import { Link } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, Layout, Plus, ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return { title: t("tournaments") };
}

export default async function OrganizerTournamentsPage() {
  const t = await getTranslations("Organizer");
  const common = await getTranslations("Common");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch all tournaments where the owner of the project is the current user
  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("*, projects!inner(owner_id, name), games(name)")
    .eq("projects.owner_id", user?.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-display text-4xl font-black uppercase tracking-tighter text-white">
            {t("sidebar.tournaments")}
          </h1>
          <p className="text-text-secondary mt-1 font-medium">
            {t("dashboard.tournaments_subtitle")}
          </p>
        </div>
        <Link href="/organizer/projects">
          <Button className="bg-brand-primary text-white hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all font-bold uppercase tracking-widest px-8">
            <Plus className="mr-2 h-4 w-4" /> {t("dashboard.create_new")}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tournaments?.length === 0 ? (
          <div className="col-span-full py-32 text-center border border-white/5 border-dashed rounded-[2.5rem] bg-bg-secondary/50">
            <Trophy className="mx-auto h-20 w-20 text-text-tertiary opacity-10 mb-6" />
            <h3 className="font-display text-2xl font-black uppercase tracking-tight text-white mb-2">
              {t("dashboard.empty")}
            </h3>
            <p className="text-text-tertiary mb-10 font-medium">
              {t("dashboard.empty_tournaments_desc")}
            </p>
            <Link href="/organizer/projects">
              <Button className="bg-white text-black hover:bg-brand-primary hover:text-white transition-all font-black uppercase tracking-widest px-10 h-14 rounded-2xl">
                {t("dashboard.go_to_projects")}
              </Button>
            </Link>
          </div>
        ) : (
          tournaments?.map((t_item) => (
            <Link key={t_item.id} href={`/organizer/tournaments/${t_item.id}`}>
              <div className="bg-bg-secondary border border-white/5 rounded-[2.5rem] p-8 hover:border-brand-primary/30 transition-all group flex flex-col h-full relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-all translate-x-4 group-hover:translate-x-0">
                  <ChevronRight className="h-20 w-20" />
                </div>

                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="space-y-1">
                    <div className="text-xs text-brand-primary font-black uppercase tracking-[0.2em]">
                      {t_item.projects?.name}
                    </div>
                    <h3 className="font-display text-2xl font-black text-white group-hover:text-brand-primary transition-colors uppercase tracking-tight">
                      {t_item.name}
                    </h3>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-black uppercase tracking-widest ${
                      t_item.status === "registration_open"
                        ? "bg-success/20 text-success border border-success/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                        : "bg-white/5 text-text-tertiary border border-white/10"
                    }`}
                  >
                    {common(t_item.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6 mt-auto pt-8 border-t border-white/5 relative z-10">
                  <div className="flex items-center gap-3 text-sm text-text-tertiary font-bold uppercase tracking-widest">
                    <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-brand-primary">
                      <Layout className="h-4 w-4" />
                    </div>
                    <span>{t_item.games?.name || common("tournaments")}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-text-tertiary justify-end font-bold uppercase tracking-widest">
                    <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <span>
                      {new Date(t_item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
