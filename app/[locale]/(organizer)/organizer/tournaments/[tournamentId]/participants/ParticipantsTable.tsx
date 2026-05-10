"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteParticipantButton } from "./DeleteParticipantButton";
import { deleteMultipleParticipants } from "./actions";
import { useRouter } from "next/navigation";
import { PremiumModal } from "@/components/ui/PremiumModal";
import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { ParticipantEditModal } from "./ParticipantEditModal";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { Participant } from "./types";

export function ParticipantsTable({
  participants,
  tournamentId,
  tournamentSize,
  pendingCount = 0,
}: {
  participants: Participant[];
  tournamentId: string;
  tournamentSize: number;
  pendingCount?: number;
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

  const handleRefresh = () => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 800);
  };

  const filteredAndSortedParticipants = useMemo(() => {
    let result = [...participants];

    // Filter
    if (searchTerm) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.main_contact_email
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    // Sort
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
    <div className="flex flex-col">
      {/* HEADER */}
      <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white flex items-center gap-4">
          {t("title")}
          {pendingCount > 0 && (
            <span className="text-xs bg-brand-primary text-white px-3 py-1 rounded-full font-black animate-pulse">
              {pendingCount} {t("pending_label")}
            </span>
          )}
        </h2>

        <div className="flex items-center gap-6">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-tertiary hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? t("refreshing") : t("refresh")}
          </button>
          <button
            onClick={() => setIsFilterVisible(!isFilterVisible)}
            className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${
              isFilterVisible
                ? "text-brand-primary"
                : "text-text-tertiary hover:text-white"
            }`}
          >
            <Filter className="h-3.5 w-3.5" />{" "}
            {isFilterVisible ? t("hide_filters") : t("show_filters")}
          </button>
        </div>
      </div>

      {/* FILTER PANEL */}
      {isFilterVisible && (
        <div className="p-8 border-b border-white/5 bg-white/[0.01] animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-text-tertiary">
                {t("search_placeholder")}
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                <Input
                  placeholder={t("search_placeholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 h-12 bg-white/5 border-white/5 rounded-xl text-sm font-bold text-white focus:ring-brand-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-text-tertiary">
                {t("sort_by")}
              </label>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setSortBy("name")}
                  className={`flex-1 h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    sortBy === "name"
                      ? "bg-brand-primary text-white"
                      : "bg-white/5 text-text-tertiary hover:bg-white/10"
                  }`}
                >
                  <User className="mr-2 h-3.5 w-3.5" /> {t("name")}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setSortBy("date")}
                  className={`flex-1 h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    sortBy === "date"
                      ? "bg-brand-primary text-white"
                      : "bg-white/5 text-text-tertiary hover:bg-white/10"
                  }`}
                >
                  <Calendar className="mr-2 h-3.5 w-3.5" /> {t("created_at")}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setSortBy("seed")}
                  className={`flex-1 h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    sortBy === "seed"
                      ? "bg-brand-primary text-white"
                      : "bg-white/5 text-text-tertiary hover:bg-white/10"
                  }`}
                >
                  <Trophy className="mr-2 h-3.5 w-3.5" /> {t("seed")}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-text-tertiary">
                {t("order")}
              </label>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setSortOrder("asc")}
                  className={`flex-1 h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    sortOrder === "asc"
                      ? "bg-brand-primary text-white"
                      : "bg-white/5 text-text-tertiary hover:bg-white/10"
                  }`}
                >
                  <ArrowUpDown className="mr-2 h-3.5 w-3.5" />{" "}
                  {sortBy === "name" ? t("az") : t("oldest")}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setSortOrder("desc")}
                  className={`flex-1 h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    sortOrder === "desc"
                      ? "bg-brand-primary text-white"
                      : "bg-white/5 text-text-tertiary hover:bg-white/10"
                  }`}
                >
                  <ArrowUpDown className="mr-2 h-3.5 w-3.5" />{" "}
                  {sortBy === "name" ? t("za") : t("newest")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="text-sm font-bold text-text-tertiary uppercase tracking-widest flex items-center gap-4">
            <div>
              <span className="text-white">
                {filteredAndSortedParticipants.length}{" "}
                {t("player", { count: filteredAndSortedParticipants.length })}
              </span>{" "}
              {t("out_of")} {tournamentSize}
            </div>
            {selectedIds.length > 0 && (
              <div className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                <CheckCircle2 className="h-3 w-3" />
                <span>
                  {selectedIds.length} {t("selected")}
                </span>
              </div>
            )}
          </div>

          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowConfirm(true)}
              className="bg-brand-primary text-white hover:bg-white hover:text-black px-6 h-10 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(244,0,9,0.2)] animate-in zoom-in-95"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" /> {t("delete_selected")}
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-black uppercase tracking-[0.2em] text-text-tertiary border-b border-white/5">
                <th className="pb-6 px-4 w-12">
                  <button
                    onClick={toggleSelectAll}
                    className={`h-5 w-5 border rounded transition-all flex items-center justify-center ${
                      selectedIds.length ===
                        filteredAndSortedParticipants.length &&
                      filteredAndSortedParticipants.length > 0
                        ? "bg-brand-primary border-brand-primary"
                        : "border-white/20 bg-white/5 hover:border-white/40"
                    }`}
                  >
                    {selectedIds.length ===
                      filteredAndSortedParticipants.length &&
                      filteredAndSortedParticipants.length > 0 && (
                        <div className="h-2 w-2 bg-white rounded-sm" />
                      )}
                  </button>
                </th>
                <th className="pb-6 px-4">{t("name")}</th>
                <th className="pb-6 px-4">{t("email")}</th>
                <th className="pb-6 px-4">{t("seed")}</th>
                <th className="pb-6 px-4 text-right">{t("created_at")}</th>
                <th className="pb-6 px-4 w-10 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filteredAndSortedParticipants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <Users className="h-12 w-12" />
                      <span className="font-black uppercase tracking-widest text-sm">
                        {t("no_participants")}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedParticipants.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  const playerNames = p.players
                    ?.map((pl) => pl.name)
                    .join(", ");
                  return (
                    <tr
                      key={p.id}
                      onClick={() => toggleSelect(p.id)}
                      className={`group transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-brand-primary/[0.03]"
                          : "hover:bg-white/[0.02]"
                      }`}
                    >
                      <td
                        className="py-6 px-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => toggleSelect(p.id)}
                          className={`h-5 w-5 border rounded transition-all flex items-center justify-center ${
                            isSelected
                              ? "bg-brand-primary border-brand-primary"
                              : "border-white/20 bg-white/5 group-hover:border-brand-primary/50"
                          }`}
                        >
                          {isSelected && (
                            <div className="h-2 w-2 bg-white rounded-sm" />
                          )}
                        </button>
                      </td>
                      <td className="py-6 px-4">
                        <div className="flex items-center gap-5">
                          <div
                            className={`h-14 w-14 rounded-2xl bg-white/[0.03] border flex items-center justify-center overflow-hidden shrink-0 transition-all duration-500 shadow-lg ${
                              isSelected
                                ? "border-brand-primary/50"
                                : "border-white/10 group-hover:border-brand-primary/30"
                            }`}
                          >
                            {p.logo_url ? (
                              <Image
                                src={p.logo_url}
                                alt={p.name}
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-brand-primary/20 to-transparent flex items-center justify-center">
                                <Trophy
                                  className={`h-6 w-6 transition-colors duration-500 ${
                                    isSelected
                                      ? "text-brand-primary"
                                      : "text-brand-primary/40 group-hover:text-brand-primary"
                                  }`}
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span
                              className={`text-[17px] font-black uppercase tracking-tight leading-tight transition-colors ${
                                isSelected
                                  ? "text-brand-primary"
                                  : "text-white group-hover:text-brand-primary"
                              }`}
                            >
                              {p.name}
                            </span>
                            {playerNames && (
                              <span className="text-xs text-text-tertiary font-medium line-clamp-1 max-w-[400px]">
                                {playerNames}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-4">
                        <span
                          className={`text-sm font-medium transition-colors ${
                            isSelected
                              ? "text-white"
                              : "text-text-secondary group-hover:text-white"
                          }`}
                        >
                          {p.main_contact_email || "—"}
                        </span>
                      </td>
                      <td className="py-6 px-4">
                        <div
                          className={`inline-flex items-center justify-center h-8 min-w-[32px] px-2 rounded-lg text-xs font-black tabular-nums transition-all ${
                            p.seed
                              ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20"
                              : "bg-white/5 text-text-tertiary border border-white/5"
                          }`}
                        >
                          {p.seed ? `#${p.seed}` : "—"}
                        </div>
                      </td>
                      <td className="py-6 px-4 text-right">
                        <span className="text-xs font-bold text-text-tertiary tabular-nums uppercase">
                          {new Date(p.created_at).toLocaleDateString(locale, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                      <td
                        className="py-6 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <DeleteParticipantButton
                            participantId={p.id}
                            tournamentId={tournamentId}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingParticipant(p)}
                            className="h-10 w-10 text-text-tertiary hover:text-white"
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
        <p className="text-sm">{delT("desc", { count: selectedIds.length })}</p>
      </PremiumModal>

      {editingParticipant && (
        <ParticipantEditModal
          participant={editingParticipant}
          tournamentId={tournamentId}
          isOpen={!!editingParticipant}
          onClose={() => setEditingParticipant(null)}
        />
      )}
    </div>
  );
}
