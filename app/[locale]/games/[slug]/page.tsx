import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Link } from "@/lib/i18n/routing";
import { Navbar } from "@/components/Navbar";
import { Trophy, Calendar, Gamepad2, Zap, ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const supabase = await createClient();

  let { data: game } = await supabase
    .from("games")
    .select("name")
    .eq("slug", decodedSlug)
    .maybeSingle();

  if (!game) {
    // Try matching with spaces replaced by dashes or vice versa
    const { data: retryGame } = await supabase
      .from("games")
      .select("name")
      .or(
        `slug.eq."${decodedSlug.replace(/ /g, "-")}",slug.eq."${decodedSlug.replace(/-/g, " ")}"`,
      )
      .maybeSingle();
    game = retryGame;
  }

  if (!game) return { title: "Game Not Found" };
  return { title: `${game.name} - Tournaments` };
}

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const t = await getTranslations("Games");
  const tTourney = await getTranslations("Tournaments");
  const supabase = await createClient();

  let { data: game } = await supabase
    .from("games")
    .select("*")
    .eq("slug", decodedSlug)
    .maybeSingle();

  if (!game) {
    const { data: retryGame } = await supabase
      .from("games")
      .select("*")
      .or(
        `slug.eq."${decodedSlug.replace(/ /g, "-")}",slug.eq."${decodedSlug.replace(/-/g, " ")}"`,
      )
      .maybeSingle();
    game = retryGame;
  }

  if (!game) notFound();

  // Fetch tournaments for this game
  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("*, projects(name), games(name), participants(count)")
    .eq("game_id", game.id)
    .neq("status", "draft")
    .order("start_date", { ascending: true });

  const now = new Date();

  const featured =
    tournaments
      ?.filter((tourney) => tourney.status !== "completed")
      .slice(0, 3) || [];
  const upcoming =
    tournaments?.filter(
      (tourney) =>
        (tourney.status === "registration_open" ||
          tourney.status === "registration_closed") &&
        new Date(tourney.start_date || "") > now,
    ) || [];
  const ongoing =
    tournaments?.filter((tourney) => tourney.status === "in_progress") || [];
  const past =
    tournaments?.filter((tourney) => tourney.status === "completed") || [];

  const renderTournaments = (
    items: {
      id: string;
      name: string;
      status: string;
      size: number;
      projects?: { name: string };
      participants: { count: number }[] | { count: number } | unknown;
    }[],
    emptyKey: string,
  ) => {
    if (items.length === 0) {
      return (
        <div className="py-16 text-center border border-white/5 rounded-[3rem] bg-bg-secondary/30 backdrop-blur-sm">
          <Trophy className="mx-auto h-12 w-12 text-brand-primary/10 mb-4" />
          <p className="text-text-tertiary font-bold uppercase tracking-widest text-xs">
            {t(emptyKey)}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((tourney) => (
          <Link key={tourney.id} href={`/tournaments/${tourney.id}`}>
            <div className="tilt-card h-full group">
              <div className="tilt-card-inner bg-bg-secondary border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-brand-primary/50 transition-all flex flex-col h-full shadow-2xl relative">
                <div className="absolute top-6 left-6 z-20">
                  <span
                    className={`text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-[0.2em] shadow-lg ${
                      tourney.status === "registration_open"
                        ? "bg-success text-white"
                        : tourney.status === "in_progress"
                          ? "bg-brand-primary text-white shadow-[0_0_15px_rgba(244,0,9,0.5)]"
                          : "bg-white/10 text-text-tertiary"
                    }`}
                  >
                    {tourney.status.replace("_", " ")}
                  </span>
                </div>

                <div className="h-48 bg-[#0a0a0c] relative overflow-hidden flex items-center justify-center group-hover:bg-brand-subtle transition-colors duration-700">
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary via-transparent to-transparent z-10"></div>
                  {game.cover_url ? (
                    <Image
                      src={
                        game.cover_url.startsWith("http")
                          ? game.cover_url
                          : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/game-assets/${game.cover_url}`
                      }
                      alt="Game Cover"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-1000"
                    />
                  ) : (
                    <span className="font-display text-5xl font-black text-white absolute select-none opacity-[0.03] uppercase -rotate-12 scale-150 transition-all duration-700 group-hover:scale-175 group-hover:opacity-[0.07] group-hover:text-brand-primary">
                      {game.name}
                    </span>
                  )}
                  <Trophy className="h-12 w-12 text-brand-primary opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 relative z-20" />
                </div>

                <div className="p-10 flex-1 flex flex-col">
                  <div className="text-[10px] text-brand-primary font-black uppercase tracking-[0.3em] mb-3">
                    {tourney.projects?.name}
                  </div>
                  <h3 className="font-display text-2xl font-black text-white mb-8 group-hover:text-brand-primary transition-colors uppercase tracking-tight leading-tight">
                    {tourney.name}
                  </h3>

                  <div className="mt-auto space-y-4 pt-6 border-t border-white/5">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-text-tertiary">
                        {tTourney("game")}
                      </span>
                      <span className="text-white">{game.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-text-tertiary">
                        {tTourney("slots")}
                      </span>
                      <span className="text-brand-primary">
                        {(
                          tourney.participants as unknown as { count: number }[]
                        )?.[0]?.count || 0}{" "}
                        / {tourney.size}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <Navbar />

      {/* GAME HERO */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-[#050505]">
        <div className="absolute inset-0 z-0">
          {game.cover_url && (
            <Image
              src={
                game.cover_url.startsWith("http")
                  ? game.cover_url
                  : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/game-assets/${game.cover_url}`
              }
              alt={game.name}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-30"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/60 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-primary/20 via-transparent to-transparent opacity-40"></div>
        </div>

        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-1000">
          <div className="flex justify-center mb-8">
            <div className="h-24 w-24 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 flex items-center justify-center shadow-2xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-brand-primary opacity-0 group-hover:opacity-10 transition-opacity"></div>
              {game.logo_url ? (
                <Image
                  src={
                    game.logo_url.startsWith("http")
                      ? game.logo_url
                      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/game-assets/${game.logo_url}`
                  }
                  alt="Logo"
                  width={80}
                  height={80}
                  className="object-contain drop-shadow-2xl"
                />
              ) : (
                <Gamepad2 className="h-12 w-12 text-brand-primary" />
              )}
            </div>
          </div>
          <h1 className="font-display text-6xl md:text-9xl font-black uppercase tracking-tighter text-white drop-shadow-[0_0_50px_rgba(244,0,9,0.5)] mb-6">
            {game.name}
          </h1>
          <p className="text-text-secondary text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            {game.description ||
              "The ultimate competition grounds for warriors. Join our professional tournaments and make your mark in history."}
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-32">
        {/* FEATURED SECTION */}
        <section className="space-y-12">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
              <Zap className="h-5 w-5 fill-brand-primary" />
            </div>
            <h2 className="font-display text-4xl font-black uppercase tracking-tight text-white">
              {t("featured")}
            </h2>
          </div>
          {renderTournaments(featured, "no_featured")}
        </section>

        {/* UPCOMING SECTION */}
        <section className="space-y-12">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center text-success border border-success/20">
              <Calendar className="h-5 w-5" />
            </div>
            <h2 className="font-display text-4xl font-black uppercase tracking-tight text-white">
              {t("upcoming")}
            </h2>
          </div>
          {renderTournaments(upcoming, "no_upcoming")}
        </section>

        {/* ONGOING SECTION */}
        <section className="space-y-12">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20 animate-pulse">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <h2 className="font-display text-4xl font-black uppercase tracking-tight text-white">
              {t("ongoing")}
            </h2>
          </div>
          {renderTournaments(ongoing, "no_ongoing")}
        </section>

        {/* PAST SECTION */}
        <section className="space-y-12">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-text-tertiary border border-white/10">
              <ArrowRight className="h-5 w-5" />
            </div>
            <h2 className="font-display text-4xl font-black uppercase tracking-tight text-white">
              {t("past")}
            </h2>
          </div>
          {renderTournaments(past, "no_past")}
        </section>
      </main>
    </div>
  );
}
