import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { TournamentForm } from "@/components/tournament/TournamentForm";
import { updateTournament } from "../actions";
import { Link } from "@/lib/i18n/routing";
import { ChevronLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function EditTournamentPage({
  params,
}: {
  params: Promise<{ tournamentId: string }>;
}) {
  const { tournamentId } = await params;
  const t = await getTranslations("Organizer.tournament_detail");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("*, projects(*), tournament_platforms(*)")
    .eq("id", tournamentId)
    .single();

  if (!tournament || tournament.projects.owner_id !== user?.id) {
    notFound();
  }

  // Fetch games
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

  const initialPlatforms = (
    tournament.tournament_platforms as { platform_id: string }[]
  ).map((tp) => tp.platform_id);

  // Wrap updateTournament to include the ID
  const boundUpdateAction = async (formData: FormData) => {
    "use server";
    return updateTournament(tournamentId, formData);
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4">
        <Link
          href={`/organizer/tournaments/${tournamentId}`}
          className="text-xs font-black uppercase tracking-[0.3em] text-text-tertiary hover:text-brand-primary flex items-center transition-colors"
        >
          <ChevronLeft className="mr-1 h-3 w-3" /> {t("back_to_dashboard")}
        </Link>
        <h1 className="font-display text-5xl font-black uppercase tracking-tighter text-white">
          {t("edit_title")}
        </h1>
        <p className="text-text-secondary font-medium">
          {t("edit_desc", { name: tournament.name })}
        </p>
      </div>

      <TournamentForm
        projectId={tournament.project_id}
        games={games || []}
        platforms={platforms || []}
        initialData={tournament}
        initialPlatforms={initialPlatforms}
        submitAction={boundUpdateAction}
        cancelHref={`/organizer/tournaments/${tournamentId}`}
      />
    </div>
  );
}
