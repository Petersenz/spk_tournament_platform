"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "./ui/input";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface Game {
  id: string;
  name: string;
}

export function TournamentFilters({ games }: { games: Game[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("Tournaments");

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    router.push(`/tournaments?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-10 bg-bg-secondary p-4 rounded-xl border border-white/5">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
        <Input
          defaultValue={searchParams.get("q") || ""}
          placeholder={t("search_placeholder")}
          className="pl-10 bg-bg-tertiary border-white/5 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateFilters("q", (e.target as HTMLInputElement).value);
            }
          }}
        />
      </div>

      <div className="flex gap-4">
        <Select
          value={searchParams.get("game") || "all"}
          onValueChange={(val) => updateFilters("game", val)}
        >
          <SelectTrigger className="w-[180px] bg-bg-tertiary border-white/5 text-text-primary h-11 px-4 rounded-xl">
            <SelectValue placeholder={t("all_games")} />
          </SelectTrigger>
          <SelectContent className="bg-bg-tertiary border-white/10 text-white">
            <SelectItem value="all">{t("all_games")}</SelectItem>
            {games?.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("status") || "all"}
          onValueChange={(val) => updateFilters("status", val)}
        >
          <SelectTrigger className="w-[180px] bg-bg-tertiary border-white/5 text-text-primary h-11 px-4 rounded-xl">
            <SelectValue placeholder={t("all_status")} />
          </SelectTrigger>
          <SelectContent className="bg-bg-tertiary border-white/10 text-white">
            <SelectItem value="all">{t("all_status")}</SelectItem>
            <SelectItem value="registration_open">
              {t("status_registration_open")}
            </SelectItem>
            <SelectItem value="in_progress">
              {t("status_in_progress")}
            </SelectItem>
            <SelectItem value="completed">{t("status_completed")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
