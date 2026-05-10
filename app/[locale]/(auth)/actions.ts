"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/lib/i18n/routing";

// Helper to translate common Supabase errors
function getErrorMessage(message: string) {
  const msg = message.toLowerCase();
  if (msg.includes("invalid login credentials")) {
    return "อีเมลหรือรหัสผ่านไม่ถูกต้อง โปรดตรวจสอบอีกครั้ง";
  }
  if (msg.includes("user already registered")) {
    return "อีเมลนี้ถูกใช้งานไปแล้ว";
  }
  if (msg.includes("email not confirmed")) {
    return "โปรดยืนยันอีเมลของคุณก่อนเข้าสู่ระบบ";
  }
  return message;
}

export async function login(formData: FormData, locale: string = "th") {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: getErrorMessage(error.message) };
  }

  // Check role and redirect
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();

  revalidatePath("/", "layout");

  // Using the provided locale to ensure stable redirect
  if (profile?.role === "organizer") {
    redirect({ href: "/organizer/dashboard", locale });
  } else {
    redirect({ href: "/player/dashboard", locale });
  }
}

export async function signup(formData: FormData, locale: string = "th") {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nickname = formData.get("nickname") as string;
  const custom_user_identifier = formData.get("custom_id") as string;
  const role = (formData.get("role") as string) || "player";

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nickname,
        role,
        custom_user_identifier,
      },
    },
  });

  if (error) {
    return { error: getErrorMessage(error.message) };
  }

  revalidatePath("/", "layout");
  redirect({ href: "/login", locale });
}

export async function signOut(locale: string = "th") {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect({ href: "/login", locale });
}
