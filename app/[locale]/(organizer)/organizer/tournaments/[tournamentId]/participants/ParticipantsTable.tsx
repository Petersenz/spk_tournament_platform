"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Users,
  Trophy,
  MoreVertical,
  Trash2,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Filter,
  Search,
  ArrowUpDown,
  Calendar,
  User,
  Plus,
} from "lucide-react";
import { deleteMultipleParticipants } from "./actions";
import { useRouter } from "next/navigation";
import { PremiumModal } from "@/components/ui/PremiumModal";
import { Input } from "@/components/ui/input";
import { ParticipantEditModal } from "./ParticipantEditModal";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { Participant } from "./types";
import { Link } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";

export function ParticipantsTable({
  participants,
  tournamentId,
  tournamentSize,
  teamMaxPlayers = 5,
}: {
  participants: Participant[];
  tournamentId: string;
  tournamentSize: number;
  teamMaxPlayers?: number;
}) {
  const t = useTranslations("Organizer.participants.table");
  const delT = useTranslations("Organizer.participants.delete_confirm");
  const common = useTranslations("Common");
  const locale = useLocale();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "seed">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [editingParticipant, setEditingParticipant] =
    useState<Participant | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (editingParticipant) {
      const freshData = participants.find(
        (p) => p.id === editingParticipant.id,
      );
      if (
        freshData &&
        JSON.stringify(freshData) !== JSON.stringify(editingParticipant)
      ) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setEditingParticipant(freshData);
      }
    }
  }, [participants, editingParticipant, setEditingParticipant]);

  const handleRefresh = () => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 800);
  };

  const filteredAndSortedParticipants = useMemo(() => {
    let result = [...participants];
    if (searchTerm) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.main_contact_email
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }
    result.sort((a, b) => {
      if (sortBy === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === "seed") {
        const seedA = a.seed ?? 999;
        const seedB = b.seed ?? 999;
        return sortOrder === "asc" ? seedA - seedB : seedB - seedA;
      } else {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }
    });
    return result;
  }, [participants, searchTerm, sortBy, sortOrder]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAndSortedParticipants.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAndSortedParticipants.map((p) => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("participant_ids", JSON.stringify(selectedIds));
    formData.append("tournament_id", tournamentId);
    try {
      await deleteMultipleParticipants(formData);
      setSelectedIds([]);
      setShowConfirm(false);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* SUCCESS MESSAGE AREA (IF NEEDED) */}
      {participants.length === tournamentSize && (
        <div className="p-4 bg-success-subtle border border-success/20 rounded-xl text-success font-bold text-base flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5" />
          {t("full_message")}
        </div>
      )}

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-bg-secondary border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-lg">
          <span className="text-4xl font-display font-black text-white mb-2">
            {participants.length}
          </span>
          <span className="text-text-tertiary font-bold uppercase tracking-[0.1em] text-base">
            {t("participants_label")}
          </span>
        </div>
        <div className="bg-bg-secondary border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-lg">
          <span className="text-4xl font-display font-black text-white mb-2">
            {tournamentSize}
          </span>
          <span className="text-text-tertiary font-bold uppercase tracking-[0.1em] text-base">
            {t("tournament_size_label")}
          </span>
        </div>
      </div>

      <div className="bg-bg-secondary border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        {/* HEADER */}
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-white/[0.01]">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white flex items-center gap-4">
              {t("list_title")}
            </h2>
            <div className="text-base font-bold text-text-tertiary">
              <span className="text-white">
                {filteredAndSortedParticipants.length}
              </span>{" "}
              {t("out_of")} {tournamentSize}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-12 px-5 flex items-center gap-2 text-base font-bold text-text-tertiary hover:text-white transition-all bg-white/5 rounded-xl border border-white/5"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {t("refresh")}
            </button>
            <button
              onClick={() => setIsFilterVisible(!isFilterVisible)}
              className={`h-12 px-5 flex items-center gap-2 text-base font-bold transition-all rounded-xl border ${
                isFilterVisible
                  ? "bg-brand-primary/10 border-brand-primary text-brand-primary"
                  : "bg-white/5 border-white/5 text-text-tertiary hover:text-white"
              }`}
            >
              <Filter className="h-4 w-4" />
              {t("show_filters")}
            </button>
            <Link
              href={`/organizer/tournaments/${tournamentId}/participants/new`}
            >
              <Button className="h-12 px-6 bg-white text-black hover:bg-brand-primary hover:text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg flex items-center gap-2">
                <Plus className="h-4 w-4" /> {common("add")}
              </Button>
            </Link>
          </div>
        </div>

        {/* FILTER PANEL */}
        {isFilterVisible && (
          <div className="p-8 border-b border-white/5 bg-white/[0.02] animate-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <label className="text-base font-bold text-text-tertiary uppercase tracking-wider">
                  {t("search_placeholder")}
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
                  <Input
                    placeholder={t("search_placeholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 bg-white/5 border-white/10 rounded-xl text-base font-bold text-white focus:ring-brand-primary"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-base font-bold text-text-tertiary uppercase tracking-wider">
                  {t("sort_by")}
                </label>
                <div className="flex gap-2">
                  {[
                    { key: "name", icon: User, label: t("name") },
                    { key: "date", icon: Calendar, label: t("created_at") },
                    { key: "seed", icon: Trophy, label: t("seed") },
                  ].map((item) => (
                    <Button
                      key={item.key}
                      variant="ghost"
                      onClick={() => setSortBy(item.key as typeof sortBy)}
                      className={`flex-1 h-14 rounded-xl text-base font-bold transition-all ${
                        sortBy === item.key
                          ? "bg-brand-primary text-white shadow-lg"
                          : "bg-white/5 text-text-tertiary hover:bg-white/10"
                      }`}
                    >
                      <item.icon className="mr-2 h-4 w-4" /> {item.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-base font-bold text-text-tertiary uppercase tracking-wider">
                  {t("order")}
                </label>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                    className="flex-1 h-14 rounded-xl text-base font-bold bg-white/5 text-text-tertiary hover:bg-white/10 border border-white/5"
                  >
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    {sortOrder === "asc" ? t("asc") : t("desc")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-base font-bold uppercase tracking-[0.1em] text-text-tertiary bg-white/[0.02]">
                <th className="py-6 px-8 w-16">
                  <button
                    onClick={toggleSelectAll}
                    className={`h-6 w-6 border-2 rounded-lg transition-all flex items-center justify-center ${
                      selectedIds.length ===
                        filteredAndSortedParticipants.length &&
                      filteredAndSortedParticipants.length > 0
                        ? "bg-brand-primary border-brand-primary shadow-lg shadow-brand-primary/30"
                        : "border-white/10 bg-white/5 hover:border-white/30"
                    }`}
                  >
                    {selectedIds.length ===
                      filteredAndSortedParticipants.length &&
                      filteredAndSortedParticipants.length > 0 && (
                        <div className="h-2.5 w-2.5 bg-white rounded-sm" />
                      )}
                  </button>
                </th>
                <th className="py-6 px-4">{t("name")}</th>
                <th className="py-6 px-4">{t("email")}</th>
                <th className="py-6 px-4 text-right">{t("created_at")}</th>
                <th className="py-6 px-8 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filteredAndSortedParticipants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-6 opacity-20">
                      <Users className="h-16 w-16" />
                      <span className="font-black uppercase tracking-[0.2em] text-base">
                        {t("no_participants")}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedParticipants.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  const playerNames = p.players
                    ?.sort((a, b) => (a.position || 99) - (b.position || 99))
                    .map((pl) => pl.name)
                    .join(", ");

                  return (
                    <tr
                      key={p.id}
                      onClick={() => toggleSelect(p.id)}
                      className={`group transition-all cursor-pointer border-l-4 ${
                        isSelected
                          ? "bg-brand-primary/[0.05] border-brand-primary"
                          : "hover:bg-white/[0.02] border-transparent"
                      }`}
                    >
                      <td
                        className="py-8 px-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => toggleSelect(p.id)}
                          className={`h-6 w-6 border-2 rounded-lg transition-all flex items-center justify-center ${
                            isSelected
                              ? "bg-brand-primary border-brand-primary shadow-lg"
                              : "border-white/10 bg-white/5 group-hover:border-brand-primary/40"
                          }`}
                        >
                          {isSelected && (
                            <div className="h-2.5 w-2.5 bg-white rounded-sm" />
                          )}
                        </button>
                      </td>
                      <td className="py-8 px-4">
                        <div className="flex items-center gap-6">
                          <div className="h-16 w-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-300 relative">
                            {p.logo_url ? (
                              <Image
                                src={p.logo_url}
                                alt={p.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <Trophy className="h-7 w-7 text-brand-primary/40" />
                            )}
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-3">
                              <span className="text-xl font-black uppercase tracking-tight text-white group-hover:text-brand-primary transition-colors">
                                {p.name}
                              </span>
                              {p.seed && (
                                <span className="bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded text-xs font-black">
                                  #{p.seed}
                                </span>
                              )}
                            </div>
                            {playerNames && (
                              <span className="text-base text-text-tertiary font-medium line-clamp-1 max-w-[500px]">
                                {playerNames}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-8 px-4">
                        <span className="text-base font-bold text-text-secondary group-hover:text-white transition-colors">
                          {p.main_contact_email || "—"}
                        </span>
                      </td>
                      <td className="py-8 px-4 text-right">
                        <span className="text-base font-bold text-text-tertiary tabular-nums uppercase">
                          {new Date(p.created_at).toLocaleDateString(locale, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </td>
                      <td
                        className="py-8 px-8 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingParticipant(p)}
                            className="h-12 w-12 bg-white/5 hover:bg-white/10 rounded-xl text-text-tertiary hover:text-white"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-8 border-t border-white/5 bg-white/[0.01] flex justify-end">
          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setShowConfirm(true)}
              className="h-14 px-8 bg-brand-primary text-white hover:bg-white hover:text-black rounded-2xl font-black uppercase tracking-widest text-base transition-all shadow-xl shadow-brand-primary/20"
            >
              <Trash2 className="mr-3 h-5 w-5" /> {t("delete_selected")} (
              {selectedIds.length})
            </Button>
          )}
        </div>
      </div>

      <PremiumModal
        isOpen={showConfirm}
        onClose={() => !loading && setShowConfirm(false)}
        title={delT("title")}
        description={t("delete_selected")}
        variant="destructive"
        footer={
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleBulkDelete}
              disabled={loading}
              className="bg-brand-primary text-white hover:bg-white hover:text-black transition-all font-display font-bold uppercase tracking-widest h-14 rounded-2xl w-full"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                `${t("delete_selected")} (${selectedIds.length})`
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowConfirm(false)}
              disabled={loading}
              className="text-text-tertiary hover:text-white transition-all font-display font-bold uppercase tracking-widest h-12 rounded-xl"
            >
              {common("cancel")}
            </Button>
          </div>
        }
      >
        <p className="text-base text-text-secondary">
          {delT("desc", { count: selectedIds.length })}
        </p>
      </PremiumModal>

      {editingParticipant && (
        <ParticipantEditModal
          key={editingParticipant.id}
          participant={editingParticipant}
          tournamentId={tournamentId}
          isOpen={!!editingParticipant}
          onClose={() => setEditingParticipant(null)}
          teamMaxPlayers={teamMaxPlayers}
        />
      )}
    </div>
  );
}
