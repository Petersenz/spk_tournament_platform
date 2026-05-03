import { createClient } from "@/lib/supabase/server";
import { TournamentForm } from "./TournamentForm";
import { Link } from "@/lib/i18n/routing";
import { ChevronLeft } from "lucide-react";

export default async function NewTournamentPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();

  // Fetch real games from database
  const { data: games } = await supabase
    .from("games")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4">
        <Link
          href={`/organizer/projects/${projectId}`}
          className="text-[10px] font-black uppercase tracking-[0.3em] text-text-tertiary hover:text-brand-primary flex items-center transition-colors"
        >
          <ChevronLeft className="mr-1 h-3 w-3" /> Back to Project
        </Link>
        <h1 className="font-display text-5xl font-black uppercase tracking-tighter text-white">
          Create Tournament
        </h1>
        <p className="text-text-secondary font-medium">
          Define the core parameters for your next professional arena.
        </p>
      </div>

      <TournamentForm projectId={projectId} games={games || []} />
    </div>
  );
}
