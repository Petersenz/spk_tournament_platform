"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface LeaguePointsConfigProps {
  defaultWin?: number;
  defaultDraw?: number;
  defaultLoss?: number;
}

const PRESETS: { label: string; win: number; draw: number; loss: number }[] = [
  { label: "3 / 1 / 0", win: 3, draw: 1, loss: 0 },
  { label: "2 / 1 / 0", win: 2, draw: 1, loss: 0 },
  { label: "1 / 0 / 0", win: 1, draw: 0, loss: 0 },
];

const inputClass =
  "h-12 bg-white/5 border-white/10 rounded-xl text-center text-white font-bold";

/**
 * League points editor (round-robin). Renders three number inputs named
 * points_win / points_draw / points_loss plus quick presets. Used in both the
 * setup wizard and the tournament edit form.
 *
 * The fields are uncontrolled (defaultValue): the shared Input re-keys on its
 * defaultValue, so clicking a preset re-mounts the inputs with the new numbers
 * while manual typing is still submitted normally.
 */
export function LeaguePointsConfig({
  defaultWin = 3,
  defaultDraw = 1,
  defaultLoss = 0,
}: LeaguePointsConfigProps) {
  const t = useTranslations("Tournament");
  const [win, setWin] = useState(defaultWin);
  const [draw, setDraw] = useState(defaultDraw);
  const [loss, setLoss] = useState(defaultLoss);

  const apply = (p: (typeof PRESETS)[number]) => {
    setWin(p.win);
    setDraw(p.draw);
    setLoss(p.loss);
  };

  const isActivePreset = (p: (typeof PRESETS)[number]) =>
    p.win === win && p.draw === draw && p.loss === loss;

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div>
        <div className="text-sm font-bold uppercase tracking-[0.2em] text-text-tertiary">
          {t("points_config_title")}
        </div>
        <p className="text-[11px] text-text-tertiary/70 mt-1">
          {t("points_config_desc")}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary self-center mr-1">
          {t("points_presets")}:
        </span>
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => apply(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              isActivePreset(p)
                ? "bg-brand-primary border-brand-primary text-white"
                : "bg-white/5 border-white/10 text-text-tertiary hover:bg-white/10 hover:text-white"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label
            htmlFor="points_win"
            className="text-xs font-bold uppercase tracking-widest text-success"
          >
            {t("points_win")}
          </Label>
          <Input
            id="points_win"
            name="points_win"
            type="text"
            inputMode="numeric"
            defaultValue={win}
            className={inputClass}
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="points_draw"
            className="text-xs font-bold uppercase tracking-widest text-text-tertiary"
          >
            {t("points_draw")}
          </Label>
          <Input
            id="points_draw"
            name="points_draw"
            type="text"
            inputMode="numeric"
            defaultValue={draw}
            className={inputClass}
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="points_loss"
            className="text-xs font-bold uppercase tracking-widest text-brand-primary/80"
          >
            {t("points_loss")}
          </Label>
          <Input
            id="points_loss"
            name="points_loss"
            type="text"
            inputMode="numeric"
            defaultValue={loss}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
