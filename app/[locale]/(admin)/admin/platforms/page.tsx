import { createClient } from "@/lib/supabase/server";
import { PlatformManagement } from "./PlatformManagement";

export default async function PlatformsPage() {
  const supabase = await createClient();
  const { data: platforms } = await supabase
    .from("platforms")
    .select("*")
    .order("name");

  return <PlatformManagement initialPlatforms={platforms || []} />;
}
