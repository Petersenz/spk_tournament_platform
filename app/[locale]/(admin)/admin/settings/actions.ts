"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateSettings(formData: FormData) {
  const supabase = await createClient();

  const platformName = formData.get("platform_name") as string;
  const maintenanceMode = formData.get("maintenance_mode") === "on";
  const publicRegistration = formData.get("public_registration") === "on";

  // We will upsert each setting
  const updates = [
    { key: "platform_name", value: platformName },
    { key: "maintenance_mode", value: maintenanceMode },
    { key: "public_registration", value: publicRegistration },
  ];

  for (const update of updates) {
    await supabase.from("system_settings").upsert(update);
  }

  revalidatePath("/admin/settings");
}
