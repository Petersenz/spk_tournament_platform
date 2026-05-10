"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createPlatform(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const icon_url = formData.get("icon_url") as string;

  const { error } = await supabase
    .from("platforms")
    .insert([{ name, icon_url }]);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/platforms");
  return { success: true };
}

export async function updatePlatform(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const icon_url = formData.get("icon_url") as string;

  const { error } = await supabase
    .from("platforms")
    .update({ name, icon_url })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/platforms");
  return { success: true };
}

export async function deletePlatform(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("platforms").delete().eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/platforms");
  return { success: true };
}
