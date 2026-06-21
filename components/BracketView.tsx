"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  ArrowUpDown,
  Loader2,
  ListOrdered,
} from "lucide-react";
import {
  reportMatchScore,
  swapMatchesInRound,
  swapTeamsInMatches,
} from "@/app/[locale]/(organizer)/organizer/tournaments/[tournamentId]/match-actions";
import { MatchDetailModal } from "./MatchDetailModal";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/routing";
import Image from "next/image";
import { appToast } from "@/lib/app-toast";
import { computeStandings } from "@/lib/bracket-engine/standings";

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

// Compact submit used by the round-robin fixture list (one button per row)
function CompactSaveButton() {
  const t = useTranslations("Tournament");
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={t("confirm_results")}
      title={t("confirm_results")}
      className="h-9 px-3 rounded-lg bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white border border-brand-primary/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
    >
      {pending ? (
        <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent animate-spin rounded-full" />
      ) : (
        <Save className="h-3.5 w-3.5" />
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
  rounds?: { number: number; name: string; group_name?: string | null };
  next_match_id?: string | null;
  next_match_slot?: number | null;
}

export function BracketView({
  initialMatches,
  tournamentId,
  isOrganizer = false,
  stageType,
}: {
  initialMatches: Match[];
  tournamentId: string;
  isOrganizer?: boolean;
  stageType?: string | null;
}) {
  const t = useTranslations("Tournament");
  const router = useRouter();
  // Round-robin (league) stages render as a standings table + flat fixtures
  // list rather than an elimination bracket with advancement connectors.
  const isRoundRobin = stageType === "round_robin";
  // Double elimination renders the two brackets + grand final as switchable
  // sections (Winners / Losers / Grand Final), each as flat round columns.
  const isDoubleElim = stageType === "double_elimination";
  const [matches, setMatches] = useState(initialMatches);
  const [bracketSection, setBracketSection] = useState<
    "winners" | "losers" | "grand_final"
  >("winners");
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
  const [isTeamSwapPending, setIsTeamSwapPending] = useState(false);

  interface MatchSwapCandidate {
    matchId: string;
    matchLabel: string;
    matchupName: string;
  }
  const [matchSwapCandidate, setMatchSwapCandidate] =
    useState<MatchSwapCandidate | null>(null);

  interface MatchSwapState {
    matchId1: string;
    matchLabel1: string;
    matchupName1: string;
    matchId2: string;
    matchLabel2: string;
    matchupName2: string;
  }
  const [matchSwapState, setMatchSwapState] = useState<MatchSwapState | null>(
    null,
  );
  const [isMatchSwapPending, setIsMatchSwapPending] = useState(false);

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
    if (isTeamSwapPending || isMatchSwapPending) return;

    // Determine active name
    const m = matches.find((match) => match.id === matchId);
    const teamName = field === "participant1_id" ? m?.p1?.name : m?.p2?.name;

    if (
      isOrganizer &&
      !isRoundRobin &&
      !isDoubleElim &&
      roundNumber === 1 &&
      m?.status !== "completed"
    ) {
      setMatchSwapCandidate(null);
      setMatchSwapState(null);

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

  const getMatchupName = (match: Match): string => {
    const firstName = match.p1?.name || t("bye");
    const secondName = match.p2?.name || t("bye");
    return `${firstName} vs ${secondName}`;
  };

  const getMatchLabel = (match: Match): string =>
    `#${match.match_number || "-"}`;

  const clearMatchSwap = () => {
    setMatchSwapCandidate(null);
    setMatchSwapState(null);
  };

  const handleMatchSwapClick = (match: Match) => {
    if (isTeamSwapPending || isMatchSwapPending) return;

    if (
      !isOrganizer ||
      isRoundRobin ||
      isDoubleElim ||
      match.rounds?.number !== 1 ||
      match.status === "completed"
    ) {
      return;
    }

    const candidate = {
      matchId: match.id,
      matchLabel: getMatchLabel(match),
      matchupName: getMatchupName(match),
    };

    setSwapCandidate(null);
    setSwapState(null);
    setTrackedTeamId(null);

    if (!matchSwapCandidate) {
      setMatchSwapCandidate(candidate);
      return;
    }

    if (matchSwapCandidate.matchId === match.id) {
      clearMatchSwap();
      return;
    }

    setMatchSwapState({
      matchId1: matchSwapCandidate.matchId,
      matchLabel1: matchSwapCandidate.matchLabel,
      matchupName1: matchSwapCandidate.matchupName,
      matchId2: candidate.matchId,
      matchLabel2: candidate.matchLabel,
      matchupName2: candidate.matchupName,
    });
  };

  const handleConfirmMatchSwap = async () => {
    if (!matchSwapState || isMatchSwapPending) return;

    setIsMatchSwapPending(true);
    const toastId = appToast.loading(t("match_swap_loading"));
    const result = await swapMatchesInRound(
      tournamentId,
      matchSwapState.matchId1,
      matchSwapState.matchId2,
    );
    appToast.dismiss(toastId);
    setIsMatchSwapPending(false);

    if (result.success) {
      appToast.success(t("match_swap_success"));
      await fetchMatches();
      clearMatchSwap();
      router.refresh();
      return;
    }

    appToast.error(result.error || t("match_swap_failed"));
  };

  const handleConfirmTeamSwap = async () => {
    if (!swapState || isTeamSwapPending) return;

    setIsTeamSwapPending(true);
    const toastId = appToast.loading(t("swap_loading"));
    const result = await swapTeamsInMatches(
      tournamentId,
      swapState.matchId1,
      swapState.field1,
      swapState.matchId2,
      swapState.field2,
    );
    appToast.dismiss(toastId);
    setIsTeamSwapPending(false);

    if (result.success) {
      appToast.success(t("swap_success"));
      await fetchMatches();
      setSwapCandidate(null);
      setSwapState(null);
      setTrackedTeamId(null);
      router.refresh();
      return;
    }

    appToast.error(result.error || t("swap_failed"));
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

  // Double elimination: map each round to its bracket section and expose the
  // sections present so we can render Winners / Losers / Grand Final tabs.
  const groupOfRound: Record<string, string> = {};
  matches.forEach((m) => {
    const rn = (m.rounds?.number || 999).toString();
    if (m.rounds?.group_name) groupOfRound[rn] = m.rounds.group_name;
  });
  const deSections = (["winners", "losers", "grand_final"] as const).filter(
    (g) => roundNumbers.some((rn) => groupOfRound[rn] === g),
  );
  const effectiveSection = deSections.includes(bracketSection)
    ? bracketSection
    : (deSections[0] ?? "winners");
  const visibleRoundNumbers = isDoubleElim
    ? roundNumbers.filter((rn) => groupOfRound[rn] === effectiveSection)
    : selectedRound
      ? [selectedRound]
      : roundNumbers;

  // League table — only meaningful for round-robin, but cheap to keep memoized.
  const standings = useMemo(() => computeStandings(matches), [matches]);
  const leagueComplete =
    isRoundRobin &&
    matches.length > 0 &&
    matches.every((m) => m.status === "completed");

  // PODIUM LOGIC
  let isFinished: boolean;
  let firstPlace: { name: string; logo_url?: string | null } | null;
  let secondPlace: { name: string; logo_url?: string | null } | null;
  let displayedThirdPlaces: { name: string; logo_url?: string | null }[];

  if (isRoundRobin) {
    // League winners come from the final standings, not a single final match.
    isFinished = leagueComplete;
    firstPlace = isFinished ? (standings[0] ?? null) : null;
    secondPlace = isFinished ? (standings[1] ?? null) : null;
    displayedThirdPlaces = isFinished && standings[2] ? [standings[2]] : [];
  } else {
    const finalRoundNum = roundNumbers[roundNumbers.length - 1];
    const finalMatch = roundsMap[finalRoundNum]?.matches?.[0];
    isFinished = finalMatch?.status === "completed";

    firstPlace = isFinished
      ? finalMatch.winner_id === finalMatch.participant1_id
        ? (finalMatch.p1 ?? null)
        : (finalMatch.p2 ?? null)
      : null;
    secondPlace = isFinished
      ? finalMatch.winner_id === finalMatch.participant1_id
        ? (finalMatch.p2 ?? null)
        : (finalMatch.p1 ?? null)
      : null;

    // Find 3rd place (losers of semi-finals)
    const semiFinalRoundNum = roundNumbers[roundNumbers.length - 2];
    const semiFinalMatches = roundsMap[semiFinalRoundNum]?.matches || [];
    displayedThirdPlaces = semiFinalMatches
      .filter((m: Match) => m.status === "completed")
      .map((m: Match) => {
        return m.winner_id === m.participant1_id ? m.p2 : m.p1;
      })
      .filter((p): p is { name: string; logo_url?: string | null } => !!p)
      .slice(0, 2);
  }

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
                  <div className="text-xs font-bold text-[#CD7F32] uppercase tracking-widest mb-2">
                    {t("bronze")}
                  </div>
                  <div className="flex w-full flex-row flex-wrap items-start justify-center gap-3">
                    {displayedThirdPlaces.length > 0 ? (
                      displayedThirdPlaces.map((p, i: number) => (
                        <div
                          key={`${p.name}-${i}`}
                          className="flex w-[88px] min-w-0 flex-col items-center gap-2 sm:w-[104px]"
                        >
                          <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-[#CD7F32]/20 bg-white/5 text-[#CD7F32] shadow-[0_0_15px_rgba(205,127,50,0.2)]">
                            {p.logo_url ? (
                              <Image
                                src={p.logo_url}
                                alt={p.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <Medal className="h-8 w-8" />
                            )}
                          </div>
                          <div className="font-display w-full truncate px-1 text-center text-sm font-black uppercase text-white sm:text-base">
                            {p.name}
                          </div>
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

      {/* LEAGUE STANDINGS TABLE (round-robin only) */}
      {isRoundRobin && (
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
              <ListOrdered className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-black uppercase tracking-tight text-white">
                {t("standings_title")}
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-text-tertiary mt-0.5">
                {t("standings_desc")}
              </p>
            </div>
          </div>

          {standings.length === 0 ? (
            <div className="w-full py-12 text-center border-2 border-dashed border-white/5 rounded-[2rem] bg-white/2">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-text-tertiary">
                {t("standings_empty")}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-[2rem] border border-white/5 bg-[#0c0c0e] shadow-xl">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-widest text-text-tertiary border-b border-white/10">
                    <th className="py-4 pl-6 pr-2 text-left w-12">
                      {t("standings_rank")}
                    </th>
                    <th className="py-4 px-2 text-left">
                      {t("standings_team")}
                    </th>
                    <th
                      className="py-4 px-2 text-center w-12"
                      title={t("standings_played_full")}
                    >
                      {t("standings_played")}
                    </th>
                    <th
                      className="py-4 px-2 text-center w-12"
                      title={t("standings_won_full")}
                    >
                      {t("standings_won")}
                    </th>
                    <th
                      className="py-4 px-2 text-center w-12"
                      title={t("standings_drawn_full")}
                    >
                      {t("standings_drawn")}
                    </th>
                    <th
                      className="py-4 px-2 text-center w-12"
                      title={t("standings_lost_full")}
                    >
                      {t("standings_lost")}
                    </th>
                    <th
                      className="py-4 px-2 text-center w-14 hidden sm:table-cell"
                      title={t("standings_scored_full")}
                    >
                      {t("standings_scored")}
                    </th>
                    <th
                      className="py-4 px-2 text-center w-14 hidden sm:table-cell"
                      title={t("standings_conceded_full")}
                    >
                      {t("standings_conceded")}
                    </th>
                    <th
                      className="py-4 px-2 text-center w-14"
                      title={t("standings_diff_full")}
                    >
                      {t("standings_diff")}
                    </th>
                    <th
                      className="py-4 pl-2 pr-6 text-center w-16"
                      title={t("standings_points_full")}
                    >
                      {t("standings_points")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row, idx) => {
                    const isLeader = idx === 0;
                    return (
                      <tr
                        key={row.id}
                        onClick={() =>
                          setTrackedTeamId((prev) =>
                            prev === row.id ? null : row.id,
                          )
                        }
                        className={`border-b border-white/5 last:border-0 cursor-pointer transition-colors ${
                          trackedTeamId === row.id
                            ? "bg-brand-primary/15"
                            : "hover:bg-white/5"
                        }`}
                      >
                        <td className="py-3 pl-6 pr-2">
                          <span
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black ${
                              isLeader
                                ? "bg-[#FFD700]/15 text-[#FFD700] border border-[#FFD700]/30"
                                : "bg-white/5 text-text-tertiary"
                            }`}
                          >
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                              {row.logo_url ? (
                                <Image
                                  src={row.logo_url}
                                  alt={row.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <span className="text-[10px] font-black text-white/40">
                                  {row.name?.[0]?.toUpperCase() || "?"}
                                </span>
                              )}
                            </div>
                            <span className="truncate font-bold uppercase tracking-tight text-white text-xs md:text-sm">
                              {row.name}
                            </span>
                            {leagueComplete && isLeader && (
                              <Crown className="h-3.5 w-3.5 text-[#FFD700] shrink-0" />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center font-bold text-text-tertiary">
                          {row.played}
                        </td>
                        <td className="py-3 px-2 text-center font-bold text-success">
                          {row.won}
                        </td>
                        <td className="py-3 px-2 text-center font-bold text-text-tertiary">
                          {row.drawn}
                        </td>
                        <td className="py-3 px-2 text-center font-bold text-brand-primary/80">
                          {row.lost}
                        </td>
                        <td className="py-3 px-2 text-center font-bold text-text-tertiary hidden sm:table-cell">
                          {row.scored}
                        </td>
                        <td className="py-3 px-2 text-center font-bold text-text-tertiary hidden sm:table-cell">
                          {row.conceded}
                        </td>
                        <td className="py-3 px-2 text-center font-bold text-white/80">
                          {row.diff > 0 ? `+${row.diff}` : row.diff}
                        </td>
                        <td className="py-3 pl-2 pr-6 text-center">
                          <span className="font-black text-lg text-white">
                            {row.points}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-10 mb-2 flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse"></span>
            <h3 className="font-display text-lg font-black uppercase tracking-tight text-white">
              {t("fixtures_title")}
            </h3>
          </div>
        </div>
      )}

      {/* SECTION / ROUND SELECTOR TABS */}
      {isDoubleElim ? (
        // Double elimination: switch between Winners / Losers / Grand Final
        <div className="flex flex-wrap gap-2 justify-center mb-8 border-b border-white/5 pb-6">
          {deSections.map((sec) => (
            <button
              key={sec}
              onClick={() => setBracketSection(sec)}
              className={`px-5 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all border ${
                effectiveSection === sec
                  ? "bg-brand-primary border-brand-primary text-white shadow-[0_0_15px_rgba(244,0,9,0.3)]"
                  : "bg-white/5 border-white/10 text-text-tertiary hover:bg-white/10 hover:text-white"
              }`}
            >
              {t(`de_${sec}`)}
            </button>
          ))}
        </div>
      ) : (
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
      )}

      {/* INTERACTIVE WORKSPACE VIEWPORT (elimination brackets only) */}
      {!isRoundRobin && (
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
              {visibleRoundNumbers.map((roundNum, index) => (
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
                      // Single-elim rounds fan out exponentially so connectors
                      // meet at midpoints; league and double-elim sections use a
                      // flat, even column instead.
                      paddingTop:
                        isRoundRobin || isDoubleElim
                          ? 0
                          : `${(Math.pow(2, index) - 1) * (CARD_HEIGHT / 2 + BASE_GAP / 2)}px`,
                      gap:
                        isRoundRobin || isDoubleElim
                          ? `${BASE_GAP}px`
                          : `${(Math.pow(2, index) - 1) * CARD_HEIGHT + Math.pow(2, index) * BASE_GAP}px`,
                      // Store the exact gap value in a CSS variable for precise connector drawing
                      ...({
                        "--gap":
                          isRoundRobin || isDoubleElim
                            ? `${BASE_GAP}px`
                            : `${(Math.pow(2, index) - 1) * CARD_HEIGHT + Math.pow(2, index) * BASE_GAP}px`,
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
                          const isMatchSwapSelected =
                            matchSwapCandidate?.matchId === match.id ||
                            matchSwapState?.matchId1 === match.id ||
                            matchSwapState?.matchId2 === match.id;
                          const canSwapWholeMatch =
                            isOrganizer &&
                            !isRoundRobin &&
                            !isDoubleElim &&
                            match.rounds?.number === 1 &&
                            match.status !== "completed";

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
                                      isMatchSwapSelected
                                        ? "border-warning/80 shadow-[0_0_20px_rgba(245,158,11,0.25)] scale-[1.02]"
                                        : isMatchTracked
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
                                        <div className="flex items-center gap-1.5">
                                          {canSwapWholeMatch && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleMatchSwapClick(match)
                                              }
                                              className={`h-7 w-7 rounded-lg border flex items-center justify-center transition-all shadow-lg ${
                                                isMatchSwapSelected
                                                  ? "bg-warning text-black border-warning"
                                                  : "bg-white/5 border-white/10 text-text-tertiary hover:bg-warning hover:text-black hover:border-warning"
                                              }`}
                                              title={t("swap_match_title")}
                                              aria-label={t("swap_match_title")}
                                            >
                                              <ArrowUpDown className="h-3.5 w-3.5" />
                                            </button>
                                          )}
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setSelectedMatch(match)
                                            }
                                            className="h-7 w-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-text-tertiary hover:bg-brand-primary hover:text-white transition-all shadow-lg"
                                            title={t("match_settings")}
                                            aria-label={t("match_settings")}
                                          >
                                            <Settings2 className="h-3.5 w-3.5" />
                                          </button>
                                        </div>
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
                              {/* Only single elimination is a clean binary tree;
                                  league and double-elim sections skip connectors. */}
                              {!isRoundRobin &&
                                !isDoubleElim &&
                                index < roundNumbers.length - 1 &&
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
              ))}
            </div>
          </div>

          {/* Floating Swap Confirmation dialog bar */}
          {isOrganizer && matchSwapCandidate && !matchSwapState && (
            <div className="absolute bottom-6 left-1/2 z-40 flex w-11/12 max-w-xl -translate-x-1/2 items-center justify-between gap-4 rounded-3xl border border-warning/50 bg-[#0c0c0e]/95 p-4 px-6 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300 md:w-auto">
              <div className="min-w-0">
                <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-warning">
                  {t("pending_match_swap")} {matchSwapCandidate.matchLabel}
                </span>
                <p className="mt-1 truncate text-xs font-bold text-text-tertiary">
                  {t("select_match_to_swap")}
                </p>
              </div>
              <button
                type="button"
                onClick={clearMatchSwap}
                disabled={isMatchSwapPending}
                className="shrink-0 rounded-xl bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {t("cancel_swap")}
              </button>
            </div>
          )}

          {isOrganizer && matchSwapState && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex w-11/12 max-w-2xl flex-col gap-4 rounded-3xl border-2 border-warning bg-[#0c0c0e]/95 p-4 px-6 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300 md:w-auto md:flex-row md:items-center md:gap-6">
              <div className="flex min-w-0 flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-warning">
                  {t("pending_match_swap")}
                </span>
                <p className="text-xs font-bold tracking-tight text-white">
                  {t.rich("match_swap_question", {
                    match1: () => (
                      <span className="font-black uppercase text-warning">
                        {matchSwapState.matchLabel1}
                      </span>
                    ),
                    match2: () => (
                      <span className="font-black uppercase text-warning">
                        {matchSwapState.matchLabel2}
                      </span>
                    ),
                  })}
                </p>
                <div className="grid gap-2 text-[10px] font-bold uppercase tracking-wider text-text-tertiary sm:grid-cols-2">
                  <span className="truncate rounded-xl border border-white/5 bg-white/5 px-3 py-2">
                    {matchSwapState.matchupName1}
                  </span>
                  <span className="truncate rounded-xl border border-white/5 bg-white/5 px-3 py-2">
                    {matchSwapState.matchupName2}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={handleConfirmMatchSwap}
                  disabled={isMatchSwapPending}
                  className="rounded-xl bg-warning px-4 py-2 text-[10px] font-black uppercase tracking-widest text-black transition-all hover:bg-warning/80 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                >
                  {isMatchSwapPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      {t("match_swap_loading")}
                    </span>
                  ) : (
                    t("confirm_match_swap")
                  )}
                </button>
                <button
                  type="button"
                  onClick={clearMatchSwap}
                  disabled={isMatchSwapPending}
                  className="rounded-xl bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  {t("cancel_swap")}
                </button>
              </div>
            </div>
          )}

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
                  onClick={handleConfirmTeamSwap}
                  disabled={isTeamSwapPending}
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/80 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                >
                  {isTeamSwapPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      {t("swap_loading")}
                    </span>
                  ) : (
                    t("confirm_swap")
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSwapCandidate(null);
                    setSwapState(null);
                    setTrackedTeamId(null);
                  }}
                  disabled={isTeamSwapPending}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  {t("cancel_swap")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ROUND-ROBIN FIXTURE LIST — compact, scrollable, inline score entry.
          Scales to large leagues (16-32 teams) without a pan/zoom canvas. */}
      {isRoundRobin && (
        <div className="space-y-8">
          {(selectedRound ? [selectedRound] : roundNumbers).map((roundNum) => {
            const roundMatches = [...roundsMap[roundNum].matches].sort(
              (a: Match, b: Match) => a.match_number - b.match_number,
            );
            return (
              <div key={roundNum} className="space-y-3">
                <div className="flex items-center gap-3 px-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse" />
                  <h4 className="font-display text-sm font-black uppercase tracking-[0.25em] text-white">
                    {roundsMap[roundNum].name}
                  </h4>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                </div>
                <div className="space-y-2">
                  {roundMatches.map((match: Match) => {
                    const completed = match.status === "completed";
                    const canEnter =
                      isOrganizer &&
                      !!match.participant1_id &&
                      !!match.participant2_id &&
                      !completed;
                    const p1win = match.winner_id === match.participant1_id;
                    const p2win = match.winner_id === match.participant2_id;
                    return (
                      <form
                        key={match.id}
                        action={async (formData) => {
                          const res = await reportMatchScore(formData);
                          if (res?.success) {
                            await fetchMatches();
                            router.refresh();
                          }
                        }}
                        className={`flex items-center gap-2 md:gap-4 rounded-2xl border px-3 md:px-5 py-3 bg-[#0c0c0e] transition-colors ${
                          completed
                            ? "border-success/15"
                            : "border-white/5 hover:border-brand-primary/20"
                        }`}
                      >
                        <input type="hidden" name="match_id" value={match.id} />
                        <input
                          type="hidden"
                          name="tournament_id"
                          value={tournamentId}
                        />
                        <span className="hidden sm:flex h-7 min-w-7 px-1.5 items-center justify-center rounded-lg bg-white/5 text-[10px] font-black text-text-tertiary shrink-0">
                          #{match.match_number}
                        </span>

                        {/* Team A (right-aligned) */}
                        <div className="flex items-center gap-2 justify-end flex-1 min-w-0">
                          <span
                            className={`truncate font-bold uppercase tracking-tight text-xs md:text-sm ${
                              p1win ? "text-white" : "text-text-tertiary"
                            }`}
                          >
                            {match.p1?.name || t("tbd")}
                          </span>
                          {p1win && (
                            <Trophy className="h-3.5 w-3.5 text-success shrink-0" />
                          )}
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
                                {match.p1?.name?.[0]?.toUpperCase() || "?"}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Score / inputs */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {canEnter ? (
                            <>
                              <input
                                type="number"
                                name="score1"
                                placeholder="0"
                                aria-label={t("score_participant1")}
                                defaultValue={
                                  match.score_participant1 ?? undefined
                                }
                                className="w-11 h-9 bg-white/5 border border-white/10 rounded-lg text-center text-white font-bold focus:border-brand-primary/50 outline-none transition-all"
                              />
                              <span className="text-white/30 font-black">
                                :
                              </span>
                              <input
                                type="number"
                                name="score2"
                                placeholder="0"
                                aria-label={t("score_participant2")}
                                defaultValue={
                                  match.score_participant2 ?? undefined
                                }
                                className="w-11 h-9 bg-white/5 border border-white/10 rounded-lg text-center text-white font-bold focus:border-brand-primary/50 outline-none transition-all"
                              />
                            </>
                          ) : (
                            <div className="flex items-center gap-2 px-2">
                              <span
                                className={`font-black text-lg ${
                                  p1win ? "text-success" : "text-white/30"
                                }`}
                              >
                                {match.score_participant1 ?? "-"}
                              </span>
                              <span className="text-white/20 text-xs font-black">
                                :
                              </span>
                              <span
                                className={`font-black text-lg ${
                                  p2win ? "text-success" : "text-white/30"
                                }`}
                              >
                                {match.score_participant2 ?? "-"}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Team B (left-aligned) */}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
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
                                {match.p2?.name?.[0]?.toUpperCase() || "?"}
                              </span>
                            )}
                          </div>
                          {p2win && (
                            <Trophy className="h-3.5 w-3.5 text-success shrink-0" />
                          )}
                          <span
                            className={`truncate font-bold uppercase tracking-tight text-xs md:text-sm ${
                              p2win ? "text-white" : "text-text-tertiary"
                            }`}
                          >
                            {match.p2?.name || t("tbd")}
                          </span>
                        </div>

                        {/* Action / status */}
                        <div className="shrink-0 w-24 md:w-28 flex justify-end">
                          {canEnter ? (
                            <CompactSaveButton />
                          ) : completed ? (
                            <span className="flex items-center gap-1.5 text-[9px] font-black text-success/70 uppercase tracking-widest">
                              <CheckCircle2 className="h-3 w-3" />
                              <span className="hidden md:inline">
                                {t("match_recorded")}
                              </span>
                            </span>
                          ) : (
                            <span className="text-[9px] font-black text-text-tertiary/60 uppercase tracking-widest">
                              {t("tbd")}
                            </span>
                          )}
                        </div>
                      </form>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
