"use client";

import { Button } from "@/components/ui/button";
import { generateBracket } from "./actions";
import { Loader2, Play } from "lucide-react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

function SubmitButton({ hasMatches }: { hasMatches: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      variant="outline"
      className="h-16 px-10 rounded-2xl border-brand-primary/30 text-brand-primary hover:bg-brand-primary hover:text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-[0_0_20px_rgba(244,0,9,0.1)] group"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Initializing...
        </>
      ) : (
        <>
          <Play className="mr-2 h-4 w-4 fill-current group-hover:scale-125 transition-transform" />
          {hasMatches ? "Reset & Regenerate" : "Initialize Bracket"}
        </>
      )}
    </Button>
  );
}

export function GenerateBracketButton({
  tournamentId,
  stageId,
  hasMatches,
}: {
  tournamentId: string;
  stageId: string;
  hasMatches: boolean;
}) {
  async function handleAction(formData: FormData) {
    const result = await generateBracket(formData);
    if (result?.error) {
      toast.error(result.error);
    }
  }

  return (
    <div className="flex flex-col items-end gap-3">
      <form
        action={async (formData) => {
          await handleAction(formData);
        }}
      >
        <input type="hidden" name="tournament_id" value={tournamentId} />
        <input type="hidden" name="stage_id" value={stageId} />
        <SubmitButton hasMatches={hasMatches} />
      </form>
    </div>
  );
}
