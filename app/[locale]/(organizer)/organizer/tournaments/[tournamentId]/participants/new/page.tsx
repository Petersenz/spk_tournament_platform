import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Link } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addManualParticipant } from "../actions";

export default async function AddParticipantPage({
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
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link
          href={`/organizer/tournaments/${tournamentId}/participants`}
          className="text-sm text-text-tertiary hover:text-brand-primary mb-4 inline-block"
        >
          ← Back to Participants
        </Link>
        <h1 className="font-display text-3xl font-bold">Add Participant</h1>
        <p className="text-text-secondary mt-1">
          Manually add a player or team to this tournament.
        </p>
      </div>

      <div className="bg-bg-secondary border border-border-primary rounded-xl p-6 md:p-8">
        <form
          action={async (formData) => {
            "use server";
            await addManualParticipant(formData);
          }}
          className="space-y-6"
        >
          <input type="hidden" name="tournament_id" value={tournamentId} />

          <div className="space-y-2">
            <Label htmlFor="name">Participant Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Pro Gamer or Team Liquid"
              required
              className="bg-bg-tertiary border-border-primary focus-visible:ring-brand-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Contact Email (Optional)</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="contact@example.com"
              className="bg-bg-tertiary border-border-primary focus-visible:ring-brand-primary"
            />
          </div>

          <div className="pt-4 flex justify-end gap-4 border-t border-border-secondary">
            <Link href={`/organizer/tournaments/${tournamentId}/participants`}>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              className="bg-brand-primary text-white hover:bg-brand-hover"
            >
              Add Participant
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
