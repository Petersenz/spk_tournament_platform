import { GameForm } from "./GameForm";
import { Link } from "@/lib/i18n/routing";
import { ChevronLeft } from "lucide-react";

export default function NewGamePage() {
  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-4">
        <Link
          href="/admin/games"
          className="text-[10px] font-black uppercase tracking-[0.3em] text-text-tertiary hover:text-brand-primary flex items-center transition-colors"
        >
          <ChevronLeft className="mr-1 h-3 w-3" /> Back to Library
        </Link>
        <h1 className="font-display text-5xl font-black uppercase tracking-tighter text-white">
          Register Title
        </h1>
        <p className="text-text-secondary font-medium">
          Add a new game to the official platform library.
        </p>
      </div>

      <GameForm />
    </div>
  );
}
