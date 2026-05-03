"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "./ui/input";
import { Search } from "lucide-react";

export function TournamentFilters({ games }: { games: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/tournaments?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-10 bg-bg-secondary p-4 rounded-xl border border-border-primary">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
        <Input
          defaultValue={searchParams.get("q") || ""}
          placeholder="Search tournaments..."
          className="pl-10 bg-bg-tertiary border-border-primary"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateFilters("q", (e.target as HTMLInputElement).value);
            }
          }}
        />
      </div>

      <div className="flex gap-4">
        <select
          className="bg-bg-tertiary border border-border-primary rounded-md px-4 py-2 text-sm text-text-primary focus:ring-1 focus:ring-brand-primary outline-none cursor-pointer"
          onChange={(e) => updateFilters("game", e.target.value)}
          defaultValue={searchParams.get("game") || ""}
        >
          <option value="">All Games</option>
          {games?.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        <select
          className="bg-bg-tertiary border border-border-primary rounded-md px-4 py-2 text-sm text-text-primary focus:ring-1 focus:ring-brand-primary outline-none cursor-pointer"
          onChange={(e) => updateFilters("status", e.target.value)}
          defaultValue={searchParams.get("status") || ""}
        >
          <option value="">All Status</option>
          <option value="registration_open">Registration Open</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>
  );
}
