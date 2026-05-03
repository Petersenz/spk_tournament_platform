"use client";

import { useState } from "react";
import { Link } from "@/lib/i18n/routing";
import { createTournament } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Gamepad2, Swords } from "lucide-react";

interface Game {
  id: string;
  name: string;
}

export function TournamentForm({
  projectId,
  games,
}: {
  projectId: string;
  games: Game[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    formData.append("project_id", projectId);

    const result = await createTournament(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <form
      action={async (formData) => {
        await handleSubmit(formData);
      }}
      className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700"
    >
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-bold uppercase tracking-widest">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* BASIC INFO */}
        <div className="space-y-8 bg-[#0c0c0e] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-10 w-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white">
              General Info
            </h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="tournament_name" className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">
                Tournament Name *
              </Label>
              <Input
                id="tournament_name"
                name="name"
                placeholder="e.g. Winter Championship 2026"
                required
                className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="game_id" className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">
                Game Title
              </Label>
              <Select name="game_id">
                <SelectTrigger id="game_id" aria-label="Game Title" className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold">
                  <SelectValue placeholder="Select from library..." />
                </SelectTrigger>
                <SelectContent className="bg-bg-secondary border-white/10 z-50">
                  <SelectItem value="none">Custom / Unlisted</SelectItem>
                  {games.map((game) => (
                    <SelectItem key={game.id} value={game.id}>
                      {game.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* FORMAT & RULES */}
        <div className="space-y-8 bg-[#0c0c0e] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center text-success border border-success/20">
              <Swords className="h-5 w-5" />
            </div>
            <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white">
              Match Format
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="match_type" className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">
                Format Type
              </Label>
              <Select name="match_type" defaultValue="duel">
                <SelectTrigger id="match_type" aria-label="Format Type" className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-bg-secondary border-white/10 z-50">
                  <SelectItem value="duel">
                    Duel (1v1 / Team vs Team)
                  </SelectItem>
                  <SelectItem value="ffa">
                    Free-For-All (Battle Royale)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="participant_type" className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">
                Entry Mode
              </Label>
              <Select name="participant_type" defaultValue="team">
                <SelectTrigger id="participant_type" aria-label="Entry Mode" className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-bg-secondary border-white/10 z-50">
                  <SelectItem value="team">Team Entry</SelectItem>
                  <SelectItem value="player">Individual Entry</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="tournament_size" className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">
              Max Capacity (2-256)
            </Label>
            <Input
              id="tournament_size"
              name="size"
              type="number"
              min="2"
              max="256"
              defaultValue="32"
              required
              className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold"
            />
          </div>
        </div>
      </div>

      <div className="pt-10 flex justify-end gap-6 border-t border-white/5">
        <Link href={`/organizer/projects/${projectId}`}>
          <Button
            type="button"
            variant="ghost"
            className="text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:text-white h-16 px-10"
          >
            Cancel
          </Button>
        </Link>
        <Button
          type="submit"
          disabled={pending}
          className="bg-brand-primary text-white hover:bg-white hover:text-black h-16 px-12 rounded-2xl font-black uppercase tracking-widest shadow-[0_0_30px_rgba(244,0,9,0.4)] transition-all"
        >
          {pending ? "Initializing..." : "Save & Continue"}
        </Button>
      </div>
    </form>
  );
}
