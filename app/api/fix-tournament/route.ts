import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return new Response("Missing ID", { status: 400 });

  const supabase = await createClient();
  const { error } = await supabase
    .from("tournaments")
    .update({ status: "completed" })
    .eq("id", id);

  if (error) return new Response(error.message, { status: 500 });

  revalidatePath(`/tournaments/${id}`);
  revalidatePath(`/organizer/tournaments/${id}`);

  return new Response(
    `Tournament ${id} marked as COMPLETED. Please refresh your page.`,
    { status: 200 },
  );
}
