"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { appToast } from "@/lib/app-toast";
import { LeaguePointsConfig } from "@/components/tournament/LeaguePointsConfig";
import { updateLeaguePoints } from "../actions";

export function LeaguePointsEditForm({
  tournamentId,
  defaultPoints,
}: {
  tournamentId: string;
  defaultPoints?: { win: number; draw: number; loss: number } | null;
}) {
  const common = useTranslations("Common");
  const [pending, setPending] = useState(false);

  return (
    <form
      action={async (formData) => {
        setPending(true);
        const res = await updateLeaguePoints(tournamentId, formData);
        setPending(false);
        if (res?.error) appToast.error(res.error);
        else appToast.success(common("saved"));
      }}
      className="space-y-4"
    >
      <LeaguePointsConfig
        defaultWin={defaultPoints?.win ?? 3}
        defaultDraw={defaultPoints?.draw ?? 1}
        defaultLoss={defaultPoints?.loss ?? 0}
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={pending}
          className="bg-brand-primary text-white hover:bg-brand-hover px-10 disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            common("save")
          )}
        </Button>
      </div>
    </form>
  );
}
