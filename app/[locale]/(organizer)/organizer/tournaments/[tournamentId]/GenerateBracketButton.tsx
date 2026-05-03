"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { generateBracket } from "./actions";
import { Loader2, Play } from "lucide-react";
import { useFormStatus } from "react-dom";

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
  const [error, setError] = useState<string | null>(null);

  async function handleAction(formData: FormData) {
    setError(null);
    const result = await generateBracket(formData);
    if (result?.error) {
      setError(result.error);
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
      {error && (
        <p className="text-[10px] font-black uppercase text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-lg animate-shake">
          Error: {error}
        </p>
      )}
    </div>
  );
}
