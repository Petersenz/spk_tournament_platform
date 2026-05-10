import { createClient } from "@/lib/supabase/server";
import { TournamentForm } from "@/components/tournament/TournamentForm";
import { Link } from "@/lib/i18n/routing";
import { createTournament } from "./actions";
import { ChevronLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function NewTournamentPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const t = await getTranslations("Organizer.project_detail");
  const supabase = await createClient();

  // Fetch real games from database
  const { data: gamesData } = await supabase
    .from("games")
    .select("id, name, cover_url")
    .eq("is_active", true)
    .order("name");

  // Map to include full URLs for images
  const games =
    gamesData?.map((g) => ({
      ...g,
      cover_url: g.cover_url
        ? g.cover_url.startsWith("http")
          ? g.cover_url
          : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/game-assets/${g.cover_url}`
        : null,
    })) || [];

  // Fetch platforms
  const { data: platforms } = await supabase
    .from("platforms")
    .select("id, name")
    .order("name");

  return (
    <div className="space-y-12 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4">
        <Link
          href={`/organizer/projects/${projectId}`}
          className="text-[10px] font-black uppercase tracking-[0.3em] text-text-tertiary hover:text-brand-primary flex items-center transition-colors"
        >
          <ChevronLeft className="mr-1 h-3 w-3" /> {t("back")}
        </Link>
        <h1 className="font-display text-5xl font-black uppercase tracking-tighter text-white">
          {t("new_tournament_title")}
        </h1>
        <p className="text-text-secondary font-medium">
          {t("new_tournament_subtitle")}
        </p>
      </div>

      <TournamentForm
        projectId={projectId}
        games={games || []}
        platforms={platforms || []}
        submitAction={createTournament}
        cancelHref={`/organizer/projects/${projectId}`}
      />
    </div>
  );
}
