import { createClient } from "@/lib/supabase/server";
import { Link } from "@/lib/i18n/routing";
import { Navbar } from "@/components/Navbar";
import { Search, Trophy } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { TournamentFilters } from "@/components/TournamentFilters";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return { title: t("tournaments") };
}

export default async function PublicTournamentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; game?: string; status?: string }>;
}) {
  const t = await getTranslations("Tournaments");
  const params = await searchParams;
  const search = params.q || "";
  const gameId = params.game || "";
  const statusFilter = params.status || "";

  const supabase = await createClient();

  // Fetch games for filter
  const { data: games } = await supabase
    .from("games")
    .select("*")
    .order("name");

  // Build Query
  let query = supabase
    .from("tournaments")
    .select("*, projects(name), games(name), participants(count)")
    .neq("status", "draft");

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }
  if (gameId) {
    query = query.eq("game_id", gameId);
  }
  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data: tournaments } = await query.order("created_at", {
    ascending: false,
  });

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="mb-16">
          <h1 className="font-display text-4xl md:text-7xl font-black uppercase tracking-tighter text-white drop-shadow-[0_0_20px_rgba(244,0,9,0.3)]">
            {t("title")}
          </h1>
          <p className="text-text-secondary mt-4 text-lg max-w-3xl font-medium leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* FILTERS BAR */}
        <div className="mb-12 bg-bg-secondary border border-white/5 p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Search className="h-16 w-16" />
          </div>
          <TournamentFilters games={games || []} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {tournaments?.length === 0 ? (
            <div className="col-span-full py-32 text-center border border-white/5 rounded-[3rem] bg-bg-secondary/50 backdrop-blur-sm">
              <Trophy className="mx-auto h-20 w-20 text-brand-primary/20 mb-6" />
              <h3 className="font-display text-2xl font-black uppercase tracking-tight text-white mb-2">
                {t("empty")}
              </h3>
              <p className="text-text-secondary font-medium">
                {t("empty_desc")}
              </p>
            </div>
          ) : (
            tournaments?.map((t_item) => (
              <Link key={t_item.id} href={`/tournaments/${t_item.id}`}>
                <div className="tilt-card h-full group">
                  <div className="tilt-card-inner bg-bg-secondary border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-brand-primary/50 transition-all flex flex-col h-full shadow-2xl relative">
                    {/* Badge Container */}
                    <div className="absolute top-6 left-6 z-20">
                      <span
                        className={`text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-[0.2em] shadow-lg ${
                          t_item.status === "registration_open"
                            ? "bg-success text-white"
                            : "bg-white/10 text-text-tertiary"
                        }`}
                      >
                        {t(`status_${t_item.status}`)}
                      </span>
                    </div>

                    <div className="h-48 bg-bg-primary/50 relative overflow-hidden flex items-center justify-center group-hover:bg-brand-subtle transition-colors duration-700">
                      <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary via-transparent to-transparent z-10"></div>
                      <span className="font-display text-5xl font-black text-white absolute select-none opacity-[0.03] uppercase -rotate-12 scale-150 transition-all duration-700 group-hover:scale-175 group-hover:opacity-[0.07] group-hover:text-brand-primary">
                        {t_item.games?.name || "CUSTOM GAME"}
                      </span>
                      <Trophy className="h-16 w-16 text-brand-primary opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                    </div>

                    <div className="p-8 lg:p-10 flex-1 flex flex-col min-w-0">
                      <div className="flex flex-col gap-1 mb-4">
                        <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.3em] opacity-70">
                          {t("hosted_by")}
                        </span>
                        <div className="text-[11px] text-white font-black uppercase tracking-widest truncate">
                          {t_item.projects?.name}
                        </div>
                      </div>

                      <h3 className="font-display text-2xl lg:text-3xl font-black text-white mb-6 group-hover:text-brand-primary transition-colors uppercase tracking-tighter leading-[0.95] line-clamp-2 min-h-[3.5rem]">
                        {t_item.name}
                      </h3>

                      <div className="mt-auto space-y-4 pt-6 border-t border-white/5">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                          <span className="text-text-tertiary">
                            {t("game")}
                          </span>
                          <span className="text-white">
                            {t_item.games?.name || "Custom"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                          <span className="text-text-tertiary">
                            {t("slots")}
                          </span>
                          <span className="text-brand-primary">
                            {(
                              t_item.participants as unknown as {
                                count: number;
                              }[]
                            )?.[0]?.count || 0}{" "}
                            / {t_item.size}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
