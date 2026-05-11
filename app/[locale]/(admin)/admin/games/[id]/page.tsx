import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { GameForm } from "@/components/admin/GameForm";
import { Link } from "@/lib/i18n/routing";
import { ChevronLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function EditGamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const t = await getTranslations("Admin.games_list");
  const { data: game } = await supabase
    .from("games")
    .select("*")
    .eq("id", id)
    .single();

  if (!game) {
    notFound();
  }

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4">
        <Link
          href="/admin/games"
          className="text-[10px] font-black uppercase tracking-[0.3em] text-text-tertiary hover:text-brand-primary flex items-center transition-colors"
        >
          <ChevronLeft className="mr-1 h-3 w-3" /> {t("back_to_list")}
        </Link>
        <h1 className="font-display text-5xl font-black uppercase tracking-tighter text-white">
          {t("edit_title")}
        </h1>
        <p className="text-text-secondary font-medium">
          {t("edit_subtitle", { name: game.name })}
        </p>
      </div>

      <GameForm initialData={game} id={id} />
    </div>
  );
}
