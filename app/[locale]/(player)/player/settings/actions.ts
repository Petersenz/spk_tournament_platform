"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData, path?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const nickname = formData.get("nickname") as string;
  const custom_user_identifier = formData.get(
    "custom_user_identifier",
  ) as string;
  const bio = formData.get("bio") as string;
  const avatarFile = formData.get("avatar") as File;

  let avatar_url = undefined;

  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split(".").pop();
    const fileName = `${user.id}/${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(filePath, avatarFile, {
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
    } else {
      const {
        data: { publicUrl },
      } = supabase.storage.from("logos").getPublicUrl(filePath);
      avatar_url = publicUrl;
    }
  }

  const updateData: Record<string, unknown> = {
    nickname,
    custom_user_identifier,
    bio,
  };

  if (avatar_url) {
    updateData.avatar_url = avatar_url;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id);

  if (error) return { error: error.message };

  if (path) {
    revalidatePath(path);
  } else {
    revalidatePath("/player/settings");
    revalidatePath("/organizer/settings");
  }

  return { success: true };
}
