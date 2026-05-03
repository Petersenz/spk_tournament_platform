"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Save, CheckCircle2, Trophy, Medal, Crown, Star } from "lucide-react";
import { reportMatchScore } from "@/app/[locale]/(organizer)/organizer/tournaments/[tournamentId]/match-actions";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";

function SaveButton({ disabled }: { disabled?: boolean }) {
  const t = useTranslations("Tournament");
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="w-full h-11 mt-2 bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white rounded-xl flex items-center justify-center gap-2 transition-all font-bold uppercase tracking-widest text-xs border border-brand-primary/20 disabled:opacity-50"
    >
      {pending ? (
        <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
      ) : (
        <>
          <Save className="h-4 w-4" />
          <span className="mt-0.5">{t("confirm_results")}</span>
        </>
      )}
    </button>
  );
}

interface Match {
  id: string;
  stage_id: string;
  match_number: number;
  status: string;
  participant1_id: string | null;
  participant2_id: string | null;
  winner_id: string | null;
  score_participant1: number | null;
  score_participant2: number | null;
  p1?: { name: string };
  p2?: { name: string };
  rounds?: { number: number; name: string };
}

export function BracketView({
  initialMatches,
  tournamentId,
  isOrganizer = false,
}: {
  initialMatches: Match[];
  tournamentId: string;
  isOrganizer?: boolean;
}) {
  const t = useTranslations("Tournament");
  const [matches, setMatches] = useState(initialMatches);
  const supabase = createClient();

  // 1. Sync with server-side props (Fallback when revalidatePath fires)
  useEffect(() => {
    setMatches(initialMatches);
  }, [initialMatches]);

  // 2. Real-time subscription for instant updates
  useEffect(() => {
    if (!initialMatches?.[0]?.stage_id) return;

    const stageId = initialMatches[0].stage_id;

    const fetchMatches = async () => {
      const { data, error } = await supabase
        .from("matches")
        .select(
          "*, p1:participants!participant1_id(name), p2:participants!participant2_id(name), rounds(number, name)",
        )
        .eq("stage_id", stageId)
        .order("match_number", { ascending: true });

      if (error) {
        console.error("Error fetching matches for realtime:", error);
        return;
      }
      if (data) setMatches(data);
    };

    const channel = supabase
      .channel(`bracket-${stageId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
          filter: `stage_id=eq.${stageId}`,
        },
        (payload) => {
          fetchMatches();
        },
      )
      .subscribe((status) => {
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialMatches, supabase]);

  // Group matches by round using the round number or name
  const roundsMap = matches?.reduce((acc: Record<string, { name: string; matches: Match[] }>, match) => {
    const roundNumber = match.rounds?.number || 999;
    const roundName = match.rounds?.name || `${t("round")} ${roundNumber}`;
    const key = roundNumber.toString();

    if (!acc[key]) {
      acc[key] = {
        name: roundName,
        matches: [],
      };
    }
    acc[key].matches.push(match);
    return acc;
  }, {} as Record<string, { name: string; matches: Match[] }>);

  const roundNumbers = Object.keys(roundsMap || {}).sort(
    (a, b) => Number(a) - Number(b),
  );

  // PODIUM LOGIC
  const finalRoundNum = roundNumbers[roundNumbers.length - 1];
  const finalMatch = roundsMap[finalRoundNum]?.matches?.[0];
  const isFinished = finalMatch?.status === "completed";

  const firstPlace = isFinished
    ? finalMatch.winner_id === finalMatch.participant1_id
      ? finalMatch.p1?.name
      : finalMatch.p2?.name
    : null;
  const secondPlace = isFinished
    ? finalMatch.winner_id === finalMatch.participant1_id
      ? finalMatch.p2?.name
      : finalMatch.p1?.name
    : null;

  // Find 3rd place (losers of semi-finals)
  const semiFinalRoundNum = roundNumbers[roundNumbers.length - 2];
  const semiFinalMatches = roundsMap[semiFinalRoundNum]?.matches || [];
  const thirdPlaces = semiFinalMatches
    .filter((m: Match) => m.status === "completed")
    .map((m: Match) => {
      return m.winner_id === m.participant1_id ? m.p2?.name : m.p1?.name;
    })
    .filter((name): name is string => !!name);

  if (roundNumbers.length === 0) {
    return (
      <div className="w-full py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/2">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-text-tertiary leading-loose">
          {isOrganizer ? t("arena_empty") : t("arena_preparing")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-16 py-10 px-4">
      {/* PODIUM SECTION */}
      {isFinished && (
        <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-1000">
          <div className="relative p-1 rounded-[3rem] bg-gradient-to-b from-[#FFD700]/40 via-white/5 to-transparent shadow-[0_0_50px_rgba(255,215,0,0.15)]">
            <div className="bg-[#0c0c0e] rounded-[2.9rem] p-12 text-center relative overflow-hidden">
              {/* Decorative particles */}
              <div className="absolute top-0 left-1/4 h-32 w-32 bg-[#FFD700]/5 blur-[80px]"></div>
              <div className="absolute bottom-0 right-1/4 h-32 w-32 bg-[#FFD700]/5 blur-[80px]"></div>

              <div className="flex justify-center mb-16 gap-4 items-center">
                <Star className="text-[#FFD700] h-8 w-8 animate-pulse" />
                <h2 className="font-display text-4xl md:text-6xl font-black uppercase tracking-tighter text-white drop-shadow-2xl">
                  {t("champions")}
                </h2>
                <Star className="text-[#FFD700] h-8 w-8 animate-pulse" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                {/* 2nd Place */}
                <div className="order-2 md:order-1 flex flex-col items-center">
                  <div className="h-16 w-16 rounded-2xl bg-white/5 border border-[#C0C0C0]/20 flex items-center justify-center mb-4 text-[#C0C0C0] shadow-[0_0_15px_rgba(192,192,192,0.2)]">
                    <Medal className="h-8 w-8" />
                  </div>
                  <div className="text-xs font-bold text-[#C0C0C0] uppercase tracking-widest mb-2">
                    {t("silver")}
                  </div>
                  <div className="font-display text-2xl font-black text-white uppercase">
                    {secondPlace}
                  </div>
                  <div className="mt-6 h-24 w-full bg-gradient-to-t from-[#C0C0C0]/10 to-transparent rounded-t-xl"></div>
                </div>

                {/* 1st Place */}
                <div className="order-1 md:order-2 flex flex-col items-center transform scale-110 -translate-y-4">
                  <div className="h-24 w-24 rounded-3xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center mb-4 text-[#FFD700] shadow-[0_0_30px_rgba(255,215,0,0.2)]">
                    <Crown className="h-12 w-12" />
                  </div>
                  <div className="text-xs font-bold text-[#FFD700] uppercase tracking-widest mb-2">
                    {t("gold")}
                  </div>
                  <div className="font-display text-4xl font-black text-white uppercase tracking-tighter drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]">
                    {firstPlace}
                  </div>
                  <div className="mt-6 h-40 w-full bg-gradient-to-t from-[#FFD700]/20 to-transparent rounded-t-2xl border-t border-[#FFD700]/30"></div>
                </div>

                {/* 3rd Place */}
                <div className="order-3 md:order-3 flex flex-col items-center">
                  <div className="h-12 w-12 rounded-xl bg-white/5 border border-[#CD7F32]/20 flex items-center justify-center mb-4 text-[#CD7F32] shadow-[0_0_15px_rgba(205,127,50,0.2)]">
                    <Medal className="h-6 w-6" />
                  </div>
                  <div className="text-xs font-bold text-[#CD7F32] uppercase tracking-widest mb-2">
                    {t("bronze")}
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    {thirdPlaces.length > 0 ? (
                      thirdPlaces.map((name: string, i: number) => (
                        <div
                          key={i}
                          className="font-display text-xl font-black text-white uppercase"
                        >
                          {name}
                        </div>
                      ))
                    ) : (
                      <div className="font-display text-xl font-black text-text-tertiary uppercase">
                        TBD
                      </div>
                    )}
                  </div>
                  <div className="mt-6 h-16 w-full bg-gradient-to-t from-[#CD7F32]/10 to-transparent rounded-t-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HORIZONTAL BRACKET */}
      <div className="flex gap-16 md:gap-32 pb-10 overflow-x-auto min-w-max px-4 scrollbar-hide">
        {roundNumbers.map((roundNum, index) => (
          <div key={roundNum} className="flex-shrink-0 w-[300px] relative">
            {/* ROUND HEADER */}
            <div className="mb-10 px-4">
              <div className="text-xs font-bold text-brand-primary uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse"></span>
                {roundsMap[roundNum].name}
              </div>
              <div className="h-[2px] w-full bg-gradient-to-r from-brand-primary/30 to-transparent"></div>
            </div>

            <div className="flex flex-col justify-around h-full gap-12 relative">
              {roundsMap[roundNum].matches
                .sort((a: Match, b: Match) => a.match_number - b.match_number)
                .map((match: Match) => (
                  <div key={match.id} className="relative group">
                    {/* MATCH CARD */}
                    <form
                      action={async (formData) => {
                        await reportMatchScore(formData);
                      }}
                      className={`relative z-10 bg-[#0c0c0e] border-2 rounded-[2rem] overflow-hidden transition-all shadow-xl p-2 ${
                        match.status === "completed"
                          ? "border-success/20 shadow-success/5"
                          : "border-white/5 hover:border-brand-primary/30"
                      }`}
                    >
                      <input type="hidden" name="match_id" value={match.id} />
                      <input
                        type="hidden"
                        name="tournament_id"
                        value={tournamentId}
                      />

                      {/* PARTICIPANT 1 */}
                      <div
                        className={`p-5 rounded-xl flex justify-between items-center transition-colors mb-1.5 ${
                          match.winner_id === match.participant1_id
                            ? "bg-success/5 border border-success/10"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className={`h-2.5 w-2.5 rounded-full ${match.winner_id === match.participant1_id ? "bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-white/10"}`}
                          ></div>
                          <span
                            className={`truncate font-bold uppercase tracking-tight text-xs md:text-sm ${
                              match.winner_id === match.participant1_id
                                ? "text-white"
                                : "text-text-tertiary"
                            }`}
                          >
                            {match.p1?.name ||
                              (index === 0 ? t("bye") : t("tbd"))}
                          </span>
                          {match.winner_id === match.participant1_id && (
                            <Trophy className="h-3.5 w-3.5 text-success" />
                          )}
                        </div>

                        {isOrganizer &&
                        match.participant1_id &&
                        match.participant2_id &&
                        match.status !== "completed" ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              name="score1"
                              placeholder="0"
                              aria-label={t("score_participant1")}
                              defaultValue={match.score_participant1 ?? undefined}
                              className="w-12 h-9 bg-white/5 border border-white/10 rounded-lg text-center text-white font-bold focus:border-brand-primary/50 outline-none transition-all"
                            />
                          </div>
                        ) : (
                          <span
                            className={`font-black text-lg ${match.winner_id === match.participant1_id ? "text-success" : "text-white/20"}`}
                          >
                            {match.score_participant1 ?? "-"}
                          </span>
                        )}
                      </div>

                      {/* PARTICIPANT 2 */}
                      <div
                        className={`p-5 rounded-xl flex justify-between items-center transition-colors ${
                          match.winner_id === match.participant2_id
                            ? "bg-success/5 border border-success/10"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className={`h-2.5 w-2.5 rounded-full ${match.winner_id === match.participant2_id ? "bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-white/10"}`}
                          ></div>
                          <span
                            className={`truncate font-bold uppercase tracking-tight text-xs md:text-sm ${
                              match.winner_id === match.participant2_id
                                ? "text-white"
                                : "text-text-tertiary"
                            }`}
                          >
                            {match.p2?.name ||
                              (index === 0 ? t("bye") : t("tbd"))}
                          </span>
                          {match.winner_id === match.participant2_id && (
                            <Trophy className="h-3.5 w-3.5 text-success" />
                          )}
                        </div>

                        {isOrganizer &&
                        match.participant1_id &&
                        match.participant2_id &&
                        match.status !== "completed" ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              name="score2"
                              placeholder="0"
                              aria-label={t("score_participant2")}
                              defaultValue={match.score_participant2 ?? undefined}
                              className="w-12 h-9 bg-white/5 border border-white/10 rounded-lg text-center text-white font-bold focus:border-brand-primary/50 outline-none transition-all"
                            />
                          </div>
                        ) : (
                          <span
                            className={`font-black text-lg ${match.winner_id === match.participant2_id ? "text-success" : "text-white/20"}`}
                          >
                            {match.score_participant2 ?? "-"}
                          </span>
                        )}
                      </div>

                      {/* ACTION BUTTON AT BOTTOM */}
                      {isOrganizer &&
                        match.participant1_id &&
                        match.participant2_id &&
                        match.status !== "completed" && <SaveButton />}
                      {match.status === "completed" && (
                        <div className="w-full py-3 flex items-center justify-center gap-2 text-[10px] font-bold text-success/70 uppercase tracking-widest">
                          <CheckCircle2 className="h-3 w-3" />{" "}
                          {t("match_recorded")}
                        </div>
                      )}
                    </form>

                    {/* CONNECTION LINES */}
                    {index < roundNumbers.length - 1 && (
                      <div className="absolute top-1/2 -right-16 w-16 h-px bg-white/5 z-0"></div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
