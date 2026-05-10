"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateReportStatus(reportId: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("reports")
    .update({ status })
    .eq("id", reportId);

  if (error) return { error: error.message };

  revalidatePath("/admin/issues");
  return { success: true };
}

export async function deleteReport(reportId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("reports").delete().eq("id", reportId);

  if (error) return { error: error.message };

  revalidatePath("/admin/issues");
  return { success: true };
}
