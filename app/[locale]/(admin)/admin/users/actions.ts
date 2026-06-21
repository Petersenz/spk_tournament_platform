"use server";

import { revalidatePath } from "next/cache";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/require-admin";

const USER_ROLES = ["admin", "organizer", "player"] as const;

type UserRole = (typeof USER_ROLES)[number];

function isUserRole(value: string): value is UserRole {
  return USER_ROLES.includes(value as UserRole);
}

export async function updateUserRole(userId: string, role: string) {
  const adminUserId = await requireAdmin();

  if (!userId) {
    return { error: "User profile is missing." };
  }

  if (!isUserRole(role)) {
    return { error: "Invalid role selected." };
  }

  if (userId === adminUserId && role !== "admin") {
    return { error: "You cannot remove your own admin access." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      role,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/users");
  revalidatePath("/en/admin/users");
  revalidatePath("/th/admin/users");
  revalidatePath("/", "layout");

  return { success: true };
}

interface UserReferenceCheck {
  label: string;
  table: string;
  column: string;
}

const USER_REFERENCE_CHECKS: UserReferenceCheck[] = [
  { label: "owned projects", table: "projects", column: "owner_id" },
  { label: "created tournaments", table: "tournaments", column: "created_by" },
  { label: "participants", table: "participants", column: "user_id" },
  { label: "registrations", table: "registrations", column: "user_id" },
  {
    label: "reviewed registrations",
    table: "registrations",
    column: "reviewed_by",
  },
  { label: "reported matches", table: "matches", column: "reported_by" },
  {
    label: "system settings updates",
    table: "system_settings",
    column: "updated_by",
  },
  { label: "content updates", table: "content_blocks", column: "updated_by" },
  {
    label: "navigation updates",
    table: "navigation_items",
    column: "updated_by",
  },
];

async function getReferenceCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  check: UserReferenceCheck,
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from(check.table)
    .select("id", { count: "exact", head: true })
    .eq(check.column, userId);

  if (error) {
    return 0;
  }

  return count || 0;
}

export async function deleteUserAccount(userId: string, confirmation: string) {
  const adminUserId = await requireAdmin();

  if (!userId) {
    return { error: "User profile is missing." };
  }

  if (userId === adminUserId) {
    return { error: "You cannot delete your own admin account." };
  }

  if (confirmation !== "DELETE") {
    return { error: "Type DELETE to confirm user deletion." };
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nickname")
    .eq("id", userId)
    .single();

  if (!profile) {
    return { error: "User profile not found." };
  }

  const referenceCounts = await Promise.all(
    USER_REFERENCE_CHECKS.map(async (check) => ({
      label: check.label,
      count: await getReferenceCount(supabase, check, userId),
    })),
  );
  const blockers = referenceCounts.filter((item) => item.count > 0);

  if (blockers.length > 0) {
    return {
      error: `Cannot delete this user because linked records exist: ${blockers
        .map((item) => `${item.count} ${item.label}`)
        .join(", ")}.`,
    };
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceRoleKey || !supabaseUrl) {
    return {
      error:
        "SUPABASE_SERVICE_ROLE_KEY is required on the server to delete auth users.",
    };
  }

  const adminSupabase = createServiceClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  const { error } = await adminSupabase.auth.admin.deleteUser(userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/users");
  revalidatePath("/en/admin/users");
  revalidatePath("/th/admin/users");

  return { success: true };
}
