"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";

interface ActionResult {
  success?: boolean;
  error?: string;
}

export async function createProject(
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  let logo_url = null;
  const logoFile = formData.get("logo") as File | null;

  if (logoFile && logoFile.size > 0) {
    const fileExt = logoFile.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(fileName, logoFile);

    if (uploadError) {
      return { error: "Failed to upload logo: " + uploadError.message };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("logos").getPublicUrl(fileName);

    logo_url = publicUrl;
  }

  if (!name) {
    return { error: "Project name is required" };
  }

  const { data, error } = await supabase
    .from("projects")
    .insert([
      {
        name,
        description,
        logo_url,
        owner_id: user.id,
      },
    ])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  const locale = await getLocale();
  revalidatePath("/organizer/projects");
  redirect(`/${locale}/organizer/projects/${data.id}`);
}

export async function updateProject(
  projectId: string,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) return { error: "Project name is required" };

  const { error } = await supabase
    .from("projects")
    .update({ name, description })
    .eq("id", projectId)
    .eq("owner_id", user.id);

  if (error) return { error: error.message };

  const locale = await getLocale();
  revalidatePath("/organizer/projects");
  revalidatePath(`/organizer/projects/${projectId}`);
  redirect(`/${locale}/organizer/projects/${projectId}`);
}

export async function deleteProject(
  projectId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("owner_id", user.id);

  if (error) return { error: error.message };

  const locale = await getLocale();
  revalidatePath("/organizer/projects");
  redirect(`/${locale}/organizer/projects`);
}
