"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Save,
  CheckCircle2,
  Trophy,
  Medal,
  Crown,
  Star,
  Settings2,
  Calendar,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
} from "lucide-react";
import {
  reportMatchScore,
  swapTeamsInMatches,
} from "@/app/[locale]/(organizer)/organizer/tournaments/[tournamentId]/match-actions";
import { MatchDetailModal } from "./MatchDetailModal";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/routing";
import Image from "next/image";

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

export interface Match {
  id: string;
  stage_id: string;
  match_number: number;
  status: string;
  participant1_id: string | null;
  participant2_id: string | null;
  winner_id: string | null;
  score_participant1: number | null;
  score_participant2: number | null;
  scheduled_at?: string | null;
  location?: string | null;
  p1?: { name: string; logo_url?: string | null };
  p2?: { name: string; logo_url?: string | null };
  rounds?: { number: number; name: string };
  next_match_id?: string | null;
  next_match_slot?: number | null;
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
  const router = useRouter();
  const [matches, setMatches] = useState(initialMatches);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const supabase = createClient();

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedRound, setSelectedRound] = useState<string | null>(null);
  const [trackedTeamId, setTrackedTeamId] = useState<string | null>(null);
  interface SwapCandidate {
    matchId: string;
    field: "participant1_id" | "participant2_id";
    teamId: string;
    teamName: string;
  }
  const [swapCandidate, setSwapCandidate] = useState<SwapCandidate | null>(
    null,
  );

  interface SwapState {
    matchId1: string;
    field1: "participant1_id" | "participant2_id";
    teamId1: string;
    teamName1: string;
    matchId2: string;
    field2: "participant1_id" | "participant2_id";
    teamId2: string;
    teamName2: string;
  }
  const [swapState, setSwapState] = useState<SwapState | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const zoomIn = () => setZoom((prev) => Math.min(2, prev + 0.1));
  const zoomOut = () => setZoom((prev) => Math.max(0.4, prev - 0.1));
  const resetView = () => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  // Auto-reset viewport pan/zoom when switching round tabs to center newly active columns
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    resetView();
  }, [selectedRound]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, input, form, select, a"))
      return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest("button, input, form, select, a"))
      return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPan({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("Error enabling full-screen mode:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleTeamClick = (
    matchId: string,
    participantId: string,
    field: "participant1_id" | "participant2_id",
    roundNumber: number,
  ) => {
    // Determine active name
    const m = matches.find((match) => match.id === matchId);
    const teamName = field === "participant1_id" ? m?.p1?.name : m?.p2?.name;

    if (isOrganizer && roundNumber === 1 && m?.status !== "completed") {
      if (!swapCandidate) {
        // First selection: set it as the candidate
        setSwapCandidate({
          matchId,
          field,
          teamId: participantId,
          teamName: teamName || "Team",
        });
        setTrackedTeamId(participantId);
      } else {
        if (swapCandidate.teamId === participantId) {
          setSwapCandidate(null);
          setTrackedTeamId(null);
        } else {
          const matchObj = matches.find((m) => m.id === matchId);
          const teamName2 =
            field === "participant1_id"
              ? matchObj?.p1?.name
              : matchObj?.p2?.name;
          setSwapState({
            matchId1: swapCandidate.matchId,
            field1: swapCandidate.field,
            teamId1: swapCandidate.teamId,
            teamName1: swapCandidate.teamName,
            matchId2: matchId,
            field2: field,
            teamId2: participantId,
            teamName2: teamName2 || "Team",
          });
        }
      }
    } else {
      setTrackedTeamId((prev) =>
        prev === participantId ? null : participantId,
      );
    }
  };

  const fetchMatches = useCallback(async () => {
    if (!initialMatches?.[0]?.stage_id) return;
    const stageId = initialMatches[0].stage_id;
    const { data, error } = await supabase
      .from("matches")
      .select(
        "*, p1:participants!participant1_id(name, logo_url), p2:participants!participant2_id(name, logo_url), rounds(number, name)",
      )
      .eq("stage_id", stageId)
      .order("match_number", { ascending: true });

    if (error) {
      console.error("Error fetching matches:", error);
      return;
    }
    if (data) setMatches(data);
  }, [initialMatches, supabase]);

  // 1. Sync with server-side props
  useEffect(() => {
    if (initialMatches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMatches(initialMatches);
    }
  }, [initialMatches]);

  // 2. Real-time subscription
  useEffect(() => {
    if (!initialMatches?.[0]?.stage_id) return;

    const stageId = initialMatches[0].stage_id;

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
        () => {
          fetchMatches();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialMatches, supabase, fetchMatches]);

  const CARD_HEIGHT = isOrganizer ? 285 : 180;
  const BASE_GAP = 32;

  // Group matches by round using the round number or name
  const roundsMap = matches?.reduce(
    (acc: Record<string, { name: string; matches: Match[] }>, match) => {
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
    },
    {} as Record<string, { name: string; matches: Match[] }>,
  );

  const roundNumbers = Object.keys(roundsMap || {}).sort(
    (a, b) => Number(a) - Number(b),
  );

  // PODIUM LOGIC
  const finalRoundNum = roundNumbers[roundNumbers.length - 1];
  const finalMatch = roundsMap[finalRoundNum]?.matches?.[0];
  const isFinished = finalMatch?.status === "completed";

  const firstPlace = isFinished
    ? finalMatch.winner_id === finalMatch.participant1_id
      ? finalMatch.p1
      : finalMatch.p2
    : null;
  const secondPlace = isFinished
    ? finalMatch.winner_id === finalMatch.participant1_id
      ? finalMatch.p2
      : finalMatch.p1
    : null;

  // Find 3rd place (losers of semi-finals)
  const semiFinalRoundNum = roundNumbers[roundNumbers.length - 2];
  const semiFinalMatches = roundsMap[semiFinalRoundNum]?.matches || [];
  const thirdPlaces = semiFinalMatches
    .filter((m: Match) => m.status === "completed")
    .map((m: Match) => {
      return m.winner_id === m.participant1_id ? m.p2 : m.p1;
    })
    .filter((p): p is { name: string; logo_url?: string | null } => !!p);

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
                  <div className="h-20 w-20 rounded-2xl bg-white/5 border border-[#C0C0C0]/20 flex items-center justify-center mb-4 text-[#C0C0C0] shadow-[0_0_15px_rgba(192,192,192,0.2)] overflow-hidden relative">
                    {secondPlace?.logo_url ? (
                      <Image
                        src={secondPlace.logo_url}
                        alt={secondPlace.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Medal className="h-10 w-10" />
                    )}
                  </div>
                  <div className="text-xs font-bold text-[#C0C0C0] uppercase tracking-widest mb-2">
                    {t("silver")}
                  </div>
                  <div className="font-display text-2xl font-black text-white uppercase truncate max-w-full px-2">
                    {secondPlace?.name}
                  </div>
                  <div className="mt-6 h-24 w-full bg-gradient-to-t from-[#C0C0C0]/10 to-transparent rounded-t-xl"></div>
                </div>

                {/* 1st Place */}
                <div className="order-1 md:order-2 flex flex-col items-center transform scale-110 -translate-y-4">
                  <div className="h-32 w-32 rounded-3xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center mb-4 text-[#FFD700] shadow-[0_0_30px_rgba(255,215,0,0.2)] overflow-hidden relative">
                    {firstPlace?.logo_url ? (
                      <Image
                        src={firstPlace.logo_url}
                        alt={firstPlace.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Crown className="h-16 w-16" />
                    )}
                  </div>
                  <div className="text-xs font-bold text-[#FFD700] uppercase tracking-widest mb-2">
                    {t("gold")}
                  </div>
                  <div className="font-display text-4xl font-black text-white uppercase tracking-tighter drop-shadow-[0_0_10px_rgba(255,215,0,0.3)] truncate max-w-full px-2">
                    {firstPlace?.name}
                  </div>
                  <div className="mt-6 h-40 w-full bg-gradient-to-t from-[#FFD700]/20 to-transparent rounded-t-2xl border-t border-[#FFD700]/30"></div>
                </div>

                {/* 3rd Place */}
                <div className="order-3 md:order-3 flex flex-col items-center">
                  <div className="h-16 w-16 rounded-xl bg-white/5 border border-[#CD7F32]/20 flex items-center justify-center mb-4 text-[#CD7F32] shadow-[0_0_15px_rgba(205,127,50,0.2)] overflow-hidden relative">
                    {thirdPlaces[0]?.logo_url ? (
                      <Image
                        src={thirdPlaces[0].logo_url}
                        alt={thirdPlaces[0].name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Medal className="h-8 w-8" />
                    )}
                  </div>
                  <div className="text-xs font-bold text-[#CD7F32] uppercase tracking-widest mb-2">
                    {t("bronze")}
                  </div>
                  <div className="flex flex-col items-center gap-1.5 w-full">
                    {thirdPlaces.length > 0 ? (
                      thirdPlaces.map((p, i: number) => (
                        <div
                          key={i}
                          className="font-display text-xl font-black text-white uppercase truncate max-w-full px-2"
                        >
                          {p.name}
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

      {/* ROUND SELECTOR TABS */}
      <div className="flex flex-wrap gap-2 justify-center mb-8 border-b border-white/5 pb-6">
        <button
          onClick={() => setSelectedRound(null)}
          className={`px-5 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all border ${
            selectedRound === null
              ? "bg-brand-primary border-brand-primary text-white shadow-[0_0_15px_rgba(244,0,9,0.3)]"
              : "bg-white/5 border-white/10 text-text-tertiary hover:bg-white/10 hover:text-white"
          }`}
        >
          {t("all_rounds") || "All Rounds"}
        </button>
        {roundNumbers.map((roundNum) => (
          <button
            key={roundNum}
            onClick={() => setSelectedRound(roundNum)}
            className={`px-5 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all border ${
              selectedRound === roundNum
                ? "bg-brand-primary border-brand-primary text-white shadow-[0_0_15px_rgba(244,0,9,0.3)]"
                : "bg-white/5 border-white/10 text-text-tertiary hover:bg-white/10 hover:text-white"
            }`}
          >
            {roundsMap[roundNum].name}
          </button>
        ))}
      </div>

      {/* INTERACTIVE WORKSPACE VIEWPORT */}
      <div
        ref={containerRef}
        className={`relative w-full border border-white/5 rounded-[2.5rem] bg-[#060608]/90 overflow-hidden select-none shadow-inner group/workspace ${
          isFullscreen
            ? "fixed inset-0 z-50 p-6 md:p-12 w-screen h-screen bg-[#060608]"
            : "h-[650px]"
        }`}
        style={{
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Floating controls in top right */}
        <div className="absolute top-6 right-6 z-30 flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 p-1.5 rounded-2xl shadow-2xl">
          <button
            type="button"
            onClick={zoomIn}
            className="h-10 w-10 rounded-xl bg-white/5 hover:bg-brand-primary hover:text-white border border-white/5 text-text-tertiary flex items-center justify-center transition-all"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={zoomOut}
            className="h-10 w-10 rounded-xl bg-white/5 hover:bg-brand-primary hover:text-white border border-white/5 text-text-tertiary flex items-center justify-center transition-all"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={resetView}
            className="h-10 w-10 rounded-xl bg-white/5 hover:bg-brand-primary hover:text-white border border-white/5 text-text-tertiary flex items-center justify-center transition-all"
            title="Reset View"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <div className="w-[1px] h-6 bg-white/10 mx-1"></div>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="h-10 w-10 rounded-xl bg-white/5 hover:bg-brand-primary hover:text-white border border-white/5 text-text-tertiary flex items-center justify-center transition-all"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Floating Zoom and Tracked Team Indicators in bottom-left */}
        <div className="absolute bottom-6 left-6 z-30 flex items-center gap-3">
          <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl text-[10px] font-black text-text-tertiary uppercase tracking-widest pointer-events-none">
            Zoom: {Math.round(zoom * 100)}%
          </div>
          {trackedTeamId && (
            <button
              type="button"
              onClick={() => setTrackedTeamId(null)}
              className="px-3 py-1.5 bg-brand-primary/20 hover:bg-brand-primary text-white border border-brand-primary/30 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
            >
              <span>
                Tracking:{" "}
                {matches.find((m) => m.participant1_id === trackedTeamId)?.p1
                  ?.name ||
                  matches.find((m) => m.participant2_id === trackedTeamId)?.p2
                    ?.name ||
                  "Team"}
              </span>
              <span className="text-white/60">✕</span>
            </button>
          )}
        </div>

        {/* PANNABLE CANVAS CONTAINER */}
        <div
          className="absolute inset-0 p-12 transition-transform duration-75 ease-out flex items-center justify-start min-w-max h-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          {/* HORIZONTAL BRACKET */}
          <div className="flex gap-16 md:gap-32 pb-10 min-w-max px-4">
            {(selectedRound ? [selectedRound] : roundNumbers).map(
              (roundNum, index) => (
                <div
                  key={roundNum}
                  className="flex-shrink-0 w-[300px] relative"
                >
                  {/* ROUND HEADER */}
                  <div className="mb-10 px-4">
                    <div className="text-xs font-bold text-brand-primary uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse"></span>
                      {roundsMap[roundNum].name}
                    </div>
                    <div className="h-[2px] w-full bg-gradient-to-r from-brand-primary/30 to-transparent"></div>
                  </div>{" "}
                  <div
                    className="flex flex-col relative w-full"
                    style={{
                      paddingTop: `${(Math.pow(2, index) - 1) * (CARD_HEIGHT / 2 + BASE_GAP / 2)}px`,
                      gap: `${(Math.pow(2, index) - 1) * CARD_HEIGHT + Math.pow(2, index) * BASE_GAP}px`,
                      // Store the exact gap value in a CSS variable for precise connector drawing
                      ...({
                        "--gap": `${(Math.pow(2, index) - 1) * CARD_HEIGHT + Math.pow(2, index) * BASE_GAP}px`,
                      } as React.CSSProperties),
                    }}
                  >
                    {(() => {
                      const sortedMatches = [
                        ...roundsMap[roundNum].matches,
                      ].sort(
                        (a: Match, b: Match) => a.match_number - b.match_number,
                      );
                      return sortedMatches.map(
                        (match: Match, matchIdx: number) => {
                          const isMatchTracked =
                            trackedTeamId &&
                            (match.participant1_id === trackedTeamId ||
                              match.participant2_id === trackedTeamId);

                          return (
                            <div
                              key={match.id}
                              className="relative group w-full"
                              style={{ height: `${CARD_HEIGHT}px` }}
                            >
                              {/* MATCH CARD */}
                              {(() => {
                                return (
                                  <form
                                    action={async (formData) => {
                                      const res =
                                        await reportMatchScore(formData);
                                      if (res?.success) {
                                        await fetchMatches();
                                        router.refresh();
                                      }
                                    }}
                                    className={`relative z-10 w-full h-full bg-[#0c0c0e] border-2 rounded-[2rem] overflow-hidden transition-all shadow-xl p-2 ${
                                      isMatchTracked
                                        ? "border-brand-primary/80 shadow-[0_0_20px_rgba(244,0,9,0.35)] scale-[1.02]"
                                        : match.status === "completed"
                                          ? "border-success/20 shadow-success/5"
                                          : "border-white/5 hover:border-brand-primary/30"
                                    }`}
                                  >
                                    <input
                                      type="hidden"
                                      name="match_id"
                                      value={match.id}
                                    />
                                    <input
                                      type="hidden"
                                      name="tournament_id"
                                      value={tournamentId}
                                    />

                                    {isOrganizer && (
                                      <div className="flex items-center justify-between px-3 pt-2 pb-1">
                                        <div className="flex gap-2">
                                          {match.scheduled_at && (
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/5 text-[8px] font-black uppercase text-text-tertiary">
                                              <Calendar className="h-2.5 w-2.5 text-brand-primary" />
                                              {new Date(
                                                match.scheduled_at,
                                              ).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                              })}
                                            </div>
                                          )}
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setSelectedMatch(match)
                                          }
                                          className="h-7 w-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-text-tertiary hover:bg-brand-primary hover:text-white transition-all shadow-lg"
                                        >
                                          <Settings2 className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    )}

                                    {/* PARTICIPANT 1 */}
                                    <div
                                      onClick={() => {
                                        if (match.participant1_id) {
                                          handleTeamClick(
                                            match.id,
                                            match.participant1_id,
                                            "participant1_id",
                                            match.rounds?.number || 1,
                                          );
                                        }
                                      }}
                                      className={`p-5 rounded-xl flex justify-between items-center transition-colors mb-1.5 cursor-pointer ${
                                        trackedTeamId &&
                                        match.participant1_id === trackedTeamId
                                          ? "bg-brand-primary/20 border-l-4 border-brand-primary text-white font-black"
                                          : match.winner_id ===
                                              match.participant1_id
                                            ? "bg-success/5 border border-success/10"
                                            : "hover:bg-white/5"
                                      }`}
                                    >
                                      <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="relative h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                          {match.p1?.logo_url ? (
                                            <Image
                                              src={match.p1.logo_url}
                                              alt={match.p1.name}
                                              fill
                                              className="object-cover"
                                            />
                                          ) : (
                                            <span className="text-[10px] font-black text-white/40">
                                              {match.p1?.name?.[0]?.toUpperCase() ||
                                                "?"}
                                            </span>
                                          )}
                                        </div>
                                        <span
                                          className={`truncate font-bold uppercase tracking-tight text-xs md:text-sm ${
                                            match.winner_id ===
                                            match.participant1_id
                                              ? "text-white"
                                              : "text-text-tertiary"
                                          }`}
                                        >
                                          {match.p1?.name ||
                                            (index === 0 ? t("bye") : t("tbd"))}
                                        </span>
                                        {match.winner_id ===
                                          match.participant1_id && (
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
                                            defaultValue={
                                              match.score_participant1 ??
                                              undefined
                                            }
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
                                      onClick={() => {
                                        if (match.participant2_id) {
                                          handleTeamClick(
                                            match.id,
                                            match.participant2_id,
                                            "participant2_id",
                                            match.rounds?.number || 1,
                                          );
                                        }
                                      }}
                                      className={`p-5 rounded-xl flex justify-between items-center transition-colors cursor-pointer ${
                                        trackedTeamId &&
                                        match.participant2_id === trackedTeamId
                                          ? "bg-brand-primary/20 border-l-4 border-brand-primary text-white font-black"
                                          : match.winner_id ===
                                              match.participant2_id
                                            ? "bg-success/5 border border-success/10"
                                            : "hover:bg-white/5"
                                      }`}
                                    >
                                      <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="relative h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                          {match.p2?.logo_url ? (
                                            <Image
                                              src={match.p2.logo_url}
                                              alt={match.p2.name}
                                              fill
                                              className="object-cover"
                                            />
                                          ) : (
                                            <span className="text-[10px] font-black text-white/40">
                                              {match.p2?.name?.[0]?.toUpperCase() ||
                                                "?"}
                                            </span>
                                          )}
                                        </div>
                                        <span
                                          className={`truncate font-bold uppercase tracking-tight text-xs md:text-sm ${
                                            match.winner_id ===
                                            match.participant2_id
                                              ? "text-white"
                                              : "text-text-tertiary"
                                          }`}
                                        >
                                          {match.p2?.name ||
                                            (index === 0 ? t("bye") : t("tbd"))}
                                        </span>
                                        {match.winner_id ===
                                          match.participant2_id && (
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
                                            defaultValue={
                                              match.score_participant2 ??
                                              undefined
                                            }
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
                                      match.status !== "completed" && (
                                        <SaveButton />
                                      )}
                                    {match.status === "completed" && (
                                      <div className="w-full py-3 flex items-center justify-center gap-2 text-[10px] font-bold text-success/70 uppercase tracking-widest">
                                        <CheckCircle2 className="h-3 w-3" />{" "}
                                        {t("match_recorded")}
                                      </div>
                                    )}
                                  </form>
                                );
                              })()}

                              {/* MATHEMATICAL SQUARE BRACKET CONNECTORS */}
                              {index < roundNumbers.length - 1 &&
                                (() => {
                                  const topMatch =
                                    matchIdx % 2 === 0
                                      ? match
                                      : sortedMatches[matchIdx - 1];
                                  const bottomMatch =
                                    matchIdx % 2 === 0
                                      ? sortedMatches[matchIdx + 1]
                                      : match;

                                  const isTopTracked =
                                    trackedTeamId &&
                                    topMatch &&
                                    (topMatch.participant1_id ===
                                      trackedTeamId ||
                                      topMatch.participant2_id ===
                                        trackedTeamId);
                                  const isTopAdvancing =
                                    isTopTracked &&
                                    topMatch &&
                                    (topMatch.status !== "completed" ||
                                      topMatch.winner_id === trackedTeamId);

                                  const isBottomTracked =
                                    trackedTeamId &&
                                    bottomMatch &&
                                    (bottomMatch.participant1_id ===
                                      trackedTeamId ||
                                      bottomMatch.participant2_id ===
                                        trackedTeamId);
                                  const isBottomAdvancing =
                                    isBottomTracked &&
                                    bottomMatch &&
                                    (bottomMatch.status !== "completed" ||
                                      bottomMatch.winner_id === trackedTeamId);

                                  const isJointTracked =
                                    isTopAdvancing || isBottomAdvancing;
                                  const isCurrentAdvancing =
                                    matchIdx % 2 === 0
                                      ? isTopAdvancing
                                      : isBottomAdvancing;

                                  return (
                                    <>
                                      {matchIdx % 2 === 0 ? (
                                        /* Top card of the pair: line goes right, then turns down to the midpoint */
                                        <div
                                          className={`absolute left-full top-1/2 w-8 md:w-16 h-[calc(50%+(var(--gap)/2))] border-t-2 border-r-2 rounded-tr-2xl pointer-events-none z-0 transition-all duration-300 ${
                                            isCurrentAdvancing
                                              ? "border-brand-primary/80 drop-shadow-[0_0_8px_rgba(244,0,9,0.6)]"
                                              : "border-white/10"
                                          }`}
                                        />
                                      ) : (
                                        /* Bottom card of the pair: line goes right, then turns up to the midpoint */
                                        <div
                                          className={`absolute left-full bottom-1/2 w-8 md:w-16 h-[calc(50%+(var(--gap)/2))] border-b-2 border-r-2 rounded-br-2xl pointer-events-none z-0 transition-all duration-300 ${
                                            isCurrentAdvancing
                                              ? "border-brand-primary/80 drop-shadow-[0_0_8px_rgba(244,0,9,0.6)]"
                                              : "border-white/10"
                                          }`}
                                        />
                                      )}
                                      {/* Joint horizontal line from the midpoint going right into the next round card */}
                                      {matchIdx % 2 === 0 && (
                                        <div
                                          className={`absolute left-[calc(100%+32px)] md:left-[calc(100%+64px)] top-[calc(100%+(var(--gap)/2))] -translate-y-1/2 w-8 md:w-16 h-[2px] pointer-events-none z-0 transition-all duration-300 ${
                                            isJointTracked
                                              ? "bg-brand-primary/80 drop-shadow-[0_0_8px_rgba(244,0,9,0.6)]"
                                              : "bg-white/10"
                                          }`}
                                        />
                                      )}
                                    </>
                                  );
                                })()}
                            </div>
                          );
                        },
                      );
                    })()}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        {/* Floating Swap Confirmation dialog bar */}
        {isOrganizer && swapState && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-6 bg-[#0c0c0e]/95 backdrop-blur-md border-2 border-brand-primary p-4 px-6 rounded-3xl shadow-2xl animate-in slide-in-from-bottom-5 duration-300 max-w-lg w-11/12 md:w-auto">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">
                {t("pending_swap")}
              </span>
              <p className="text-xs text-white font-bold tracking-tight">
                {t.rich("swap_question", {
                  team1: () => (
                    <span className="text-brand-primary uppercase font-black">
                      {swapState.teamName1}
                    </span>
                  ),
                  team2: () => (
                    <span className="text-brand-primary uppercase font-black">
                      {swapState.teamName2}
                    </span>
                  ),
                })}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={async () => {
                  const result = await swapTeamsInMatches(
                    tournamentId,
                    swapState.matchId1,
                    swapState.field1,
                    swapState.matchId2,
                    swapState.field2,
                  );
                  if (result.success) {
                    await fetchMatches();
                    setSwapCandidate(null);
                    setSwapState(null);
                    setTrackedTeamId(null);
                    router.refresh();
                  } else {
                    alert(result.error || "Failed to swap teams");
                  }
                }}
                className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/80 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                {t("confirm_swap")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSwapCandidate(null);
                  setSwapState(null);
                  setTrackedTeamId(null);
                }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                {t("cancel_swap")}
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedMatch && (
        <MatchDetailModal
          isOpen={!!selectedMatch}
          onClose={() => setSelectedMatch(null)}
          match={selectedMatch}
          tournamentId={tournamentId}
        />
      )}
    </div>
  );
}
