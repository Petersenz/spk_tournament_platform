import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { PlayerSettingsForm } from "./PlayerSettingsForm";

export default async function PlayerSettingsPage() {
  const t = await getTranslations("Player.settings");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl">
      <div>
        <h1 className="font-display text-3xl font-bold">{t("title")}</h1>
        <p className="text-text-secondary mt-1">{t("subtitle")}</p>
      </div>

      <PlayerSettingsForm profile={profile} userEmail={user.email || ""} />
    </div>
  );
}
