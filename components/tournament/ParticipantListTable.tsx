"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";
import { Users, Trophy, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { AddParticipantModal } from "@/app/[locale]/(organizer)/organizer/tournaments/[tournamentId]/participants/AddParticipantModal";
import { cn } from "@/lib/utils";

interface Player {
  id: string;
  name: string;
  is_captain?: boolean;
}

interface ParticipantWithPlayers {
  id: string;
  name: string;
  logo_url: string | null;
  team_identifier: string | null;
  custom_user_identifier: string | null;
  players: Player[];
}

interface ParticipantListTableProps {
  tournamentId: string;
  isOrganizer: boolean;
  participantType: "player" | "team";
  initialParticipants?: ParticipantWithPlayers[];
}

export function ParticipantListTable({
  tournamentId,
  isOrganizer,
  participantType,
  initialParticipants = [],
}: ParticipantListTableProps) {
  const t = useTranslations("Tournament");
  const [participants, setParticipants] =
    useState<ParticipantWithPlayers[]>(initialParticipants);
  const supabase = createClient();

  // Sync state with server-provided props when they change (e.g. after router.refresh())
  useEffect(() => {
    if (
      initialParticipants.length > 0 &&
      JSON.stringify(initialParticipants) !== JSON.stringify(participants)
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setParticipants(initialParticipants);
    }
  }, [initialParticipants, participants]);

  useEffect(() => {
    const fetchParticipants = async () => {
      const { data } = await supabase
        .from("participants")
        .select("*, players(*)")
        .eq("tournament_id", tournamentId)
        .eq("status", "approved")
        .order("created_at", { ascending: true });
      if (data) setParticipants(data);
    };

    // Initial fetch to sync
    fetchParticipants();

    // Subscribe to changes in participants and players
    const channel = supabase
      .channel(`participants-list-${tournamentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "participants",
          filter: `tournament_id=eq.${tournamentId}`,
        },
        () => {
          fetchParticipants();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
        },
        () => {
          // Since players don't have tournament_id, we just refetch everything
          // This could be optimized if needed
          fetchParticipants();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tournamentId, supabase]);

  const getImageUrl = (url: string | null, bucket: string) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${url}`;
  };

  return (
    <section className="bg-[#0c0c0e] border border-white/5 rounded-[3rem] p-10 lg:p-14 shadow-2xl animate-in slide-in-from-bottom-6 duration-700 delay-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white">
              {t("participants_table")}
            </h2>
            <p className="text-md font-bold text-text-tertiary uppercase tracking-[0.2em] mt-1">
              {participants.length} {t("confirmed")}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-[2rem] border border-white/5 bg-white/[0.01]">
        {participants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <Users className="h-10 w-10 text-text-tertiary" />
            </div>
            <h3 className="font-display text-xl font-black uppercase tracking-tight text-white mb-2">
              {t("no_participants_yet")}
            </h3>
            {isOrganizer && (
              <div className="mt-8">
                <AddParticipantModal
                  tournamentId={tournamentId}
                  participantType={participantType}
                />
              </div>
            )}
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.3em] text-text-tertiary border-b border-white/5 bg-white/2">
                <th className="py-6 px-8 w-16">{t("seq")}</th>
                <th className="py-6 px-8">
                  {participantType === "team"
                    ? t("participant")
                    : t("confirmed")}
                </th>
                <th className="py-6 px-8">
                  {participantType === "team" ? t("team_tag") : t("config")}
                </th>
                {participantType === "team" && (
                  <th className="py-6 px-8">{t("roster")}</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {participants.map((p, idx) => {
                const logo = getImageUrl(p.logo_url, "participant-logos");
                const isTeam = participantType === "team";

                return (
                  <tr
                    key={p.id}
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-6 px-8">
                      <span className="text-xs font-black tabular-nums text-text-tertiary group-hover:text-brand-primary transition-colors">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                    </td>
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-5">
                        <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-brand-primary/30 transition-all shadow-lg relative">
                          {logo ? (
                            <Image
                              src={logo}
                              alt={p.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <Trophy className="h-5 w-5 text-brand-primary/30 group-hover:text-brand-primary/60 transition-colors" />
                          )}
                        </div>
                        <span className="text-md font-black uppercase tracking-tight text-white group-hover:text-brand-primary transition-colors">
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">
                        {p.team_identifier || p.custom_user_identifier || "—"}
                      </span>
                    </td>
                    {isTeam && (
                      <td className="py-6 px-8">
                        <div className="flex flex-wrap gap-2 max-w-[400px]">
                          {p.players && p.players.length > 0 ? (
                            p.players.map((player: Player) => (
                              <div
                                key={player.id}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all",
                                  player.is_captain
                                    ? "bg-brand-primary/10 border-brand-primary/20 text-brand-primary"
                                    : "bg-white/5 border-white/5 text-text-secondary",
                                )}
                              >
                                {player.is_captain && (
                                  <ShieldCheck className="h-3 w-3" />
                                )}
                                {player.name}
                              </div>
                            ))
                          ) : (
                            <span className="text-[10px] text-text-tertiary italic opacity-40">
                              {t("tbd")}
                            </span>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
