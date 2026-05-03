"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteTournament } from "./actions";

export function DeleteTournamentButton({
  tournamentId,
}: {
  tournamentId: string;
}) {
  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this tournament? This cannot be undone.",
      )
    ) {
      return;
    }
    await deleteTournament(tournamentId);
  };

  return (
    <form
      action={async () => {
        await handleDelete();
      }}
    >
      <Button
        variant="outline"
        type="submit"
        className="h-16 px-8 rounded-2xl border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white font-black uppercase tracking-widest text-[10px] transition-all"
      >
        <Trash2 className="mr-2 h-4 w-4" /> Delete
      </Button>
    </form>
  );
}
