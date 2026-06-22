"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeaguePointsConfig } from "@/components/tournament/LeaguePointsConfig";

export function StageFormatField({
  defaultType,
  defaultPoints,
}: {
  defaultType: string;
  defaultPoints?: { win: number; draw: number; loss: number } | null;
}) {
  const t = useTranslations("Setup");
  const tCommon = useTranslations("Common");
  const [format, setFormat] = useState(defaultType || "single_elimination");

  return (
    <>
      <div className="space-y-3">
        <Label
          htmlFor="stage_type"
          className="text-sm font-bold uppercase tracking-[0.2em] text-text-tertiary ml-1"
        >
          {t("format_type")}
        </Label>
        <Select
          name="stage_type"
          defaultValue={format}
          onValueChange={setFormat}
        >
          <SelectTrigger
            id="stage_type"
            aria-label={t("format_type")}
            className="h-14 bg-white/5 border-white/10 rounded-xl focus:border-brand-primary transition-all text-white font-bold"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#0c0c0e] border-white/10 text-white">
            <SelectItem value="single_elimination">
              {tCommon("formats.single_elimination")}
            </SelectItem>
            <SelectItem value="double_elimination">
              {tCommon("formats.double_elimination")}
            </SelectItem>
            <SelectItem value="round_robin">
              {tCommon("formats.round_robin")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {format === "round_robin" && (
        <LeaguePointsConfig
          defaultWin={defaultPoints?.win ?? 3}
          defaultDraw={defaultPoints?.draw ?? 1}
          defaultLoss={defaultPoints?.loss ?? 0}
        />
      )}
    </>
  );
}
