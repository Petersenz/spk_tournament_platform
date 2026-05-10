"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface ActionResult {
  success?: boolean;
  error?: string;
}

export async function createProject(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const logo_file = formData.get("logo_file") as File;

  if (!name) {
    return { error: "Project name is required" };
  }

  let logo_url = "";

  // Handle Image Upload if file exists
  if (logo_file && logo_file.size > 0) {
    const fileExt = logo_file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(fileName, logo_file);

    if (uploadError) {
      return { error: `Upload failed: ${uploadError.message}` };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("logos").getPublicUrl(fileName);

    logo_url = publicUrl;
  }

  const { data, error } = await supabase
    .from("projects")
    .insert([
      {
        name,
        description,
        logo_url: logo_url || null,
        owner_id: user.id,
      },
    ])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/organizer/projects");
  redirect(`/organizer/projects/${data.id}`);
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
  const logo_file = formData.get("logo_file") as File;

  if (!name) return { error: "Project name is required" };

  const updateData: Record<string, unknown> = {
    name,
    description,
  };

  // Handle Image Upload if new file exists
  if (logo_file && logo_file.size > 0) {
    const fileExt = logo_file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(fileName, logo_file);

    if (uploadError) {
      return { error: `Upload failed: ${uploadError.message}` };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("logos").getPublicUrl(fileName);

    updateData.logo_url = publicUrl;
  }

  const { error } = await supabase
    .from("projects")
    .update(updateData)
    .eq("id", projectId)
    .eq("owner_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/organizer/projects");
  revalidatePath(`/organizer/projects/${projectId}`);
  redirect(`/organizer/projects/${projectId}`);
}

export async function deleteProject(projectId: string): Promise<ActionResult> {
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

  revalidatePath("/organizer/projects");
  redirect("/organizer/projects");
}
