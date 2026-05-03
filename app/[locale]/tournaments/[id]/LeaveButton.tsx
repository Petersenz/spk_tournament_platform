"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { leaveTournament } from "./actions";
import { LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function LeaveButton({
  tournamentId,
  isLeaveRequest = false,
}: {
  tournamentId: string;
  isLeaveRequest?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLeave() {
    if (
      !confirm(
        isLeaveRequest
          ? "Are you sure you want to request to leave? The organizer will need to approve this."
          : "Are you sure you want to leave this tournament?",
      )
    ) {
      return;
    }

    setLoading(true);
    const result = await leaveTournament(tournamentId);

    if (result?.error) {
      alert(result.error);
      setLoading(false);
    } else {
      router.refresh();
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleLeave}
      disabled={loading}
      className="w-full mt-4 h-12 px-4 border-white/5 text-text-tertiary hover:bg-destructive hover:text-white hover:border-destructive transition-all font-bold text-[11px] uppercase tracking-widest rounded-2xl group"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2 shrink-0" />
      ) : (
        <LogOut className="h-4 w-4 mr-2 shrink-0 group-hover:translate-x-1 transition-transform" />
      )}
      <span className="truncate">
        {isLeaveRequest ? "Request Leave" : "Leave Tournament"}
      </span>
    </Button>
  );
}
