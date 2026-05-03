import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Link } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";
import { updateTournament } from "../actions";

export default async function EditTournamentPage({
  params,
}: {
  params: Promise<{ tournamentId: string }>;
}) {
  const { tournamentId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("*, projects(*)")
    .eq("id", tournamentId)
    .single();

  if (!tournament || tournament.projects.owner_id !== user?.id) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <div>
        <Link
          href={`/organizer/tournaments/${tournamentId}`}
          className="text-sm text-text-tertiary hover:text-brand-primary"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="font-display text-3xl font-bold mt-4">
          Edit Tournament Info
        </h1>
      </div>

      <div className="bg-bg-secondary border border-white/5 rounded-[2rem] p-8 shadow-2xl">
        <form
          action={async (formData) => {
            await updateTournament(tournamentId, formData);
          }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-text-secondary uppercase text-[10px] font-black tracking-widest"
            >
              Tournament Name
            </Label>
            <Input
              id="name"
              name="name"
              defaultValue={tournament.name}
              required
              className="bg-bg-tertiary border-white/5 h-12"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="status"
              className="text-text-secondary uppercase text-[10px] font-black tracking-widest"
            >
              Status
            </Label>
            <Select name="status" defaultValue={tournament.status}>
              <SelectTrigger className="bg-bg-tertiary border-white/5 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="registration_open">
                  Registration Open
                </SelectItem>
                <SelectItem value="registration_closed">
                  Registration Closed
                </SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-text-secondary uppercase text-[10px] font-black tracking-widest"
            >
              Description / Rules
            </Label>
            <textarea
              id="description"
              name="description"
              rows={6}
              defaultValue={tournament.description || ""}
              className="w-full rounded-xl bg-bg-tertiary border border-white/5 p-4 text-sm focus:border-brand-primary outline-none transition-all custom-scrollbar"
            />
          </div>

          <div className="pt-6 flex gap-4">
            <Button
              type="submit"
              className="flex-1 h-14 bg-brand-primary text-white hover:bg-brand-hover font-bold uppercase tracking-widest text-xs rounded-xl"
            >
              Update Tournament
            </Button>
            <Link
              href={`/organizer/tournaments/${tournamentId}`}
              className="flex-1"
            >
              <Button
                type="button"
                variant="outline"
                className="w-full h-14 border-white/5 font-bold uppercase tracking-widest text-xs rounded-xl"
              >
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
