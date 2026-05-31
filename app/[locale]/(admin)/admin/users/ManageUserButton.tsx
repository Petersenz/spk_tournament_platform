"use client";

import { useState, useTransition } from "react";
import {
  AlertTriangle,
  Calendar,
  Fingerprint,
  Loader2,
  ShieldCheck,
  Trash2,
  UserCog,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PremiumModal } from "@/components/ui/PremiumModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteUserAccount, updateUserRole } from "./actions";

type UserRole = "admin" | "organizer" | "player";

interface ManageUserButtonProps {
  profile: {
    id: string;
    nickname: string | null;
    role: UserRole;
    created_at: string | null;
  };
  isSelf: boolean;
}

const roleDescriptions: Record<UserRole, string> = {
  admin:
    "Full admin access to system settings, games, users, and platform controls.",
  organizer:
    "Can create projects, tournaments, participants, and manage matches.",
  player: "Can browse tournaments, register, and manage their player profile.",
};

export function ManageUserButton({ profile, isSelf }: ManageUserButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState<UserRole>(profile.role);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [pendingAction, setPendingAction] = useState<"role" | "delete" | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();
  const hasRoleChanged = role !== profile.role;
  const canDelete = deleteText === "DELETE" && !isSelf;

  function resetModalState(): void {
    setIsOpen(false);
    setRole(profile.role);
    setConfirmDelete(false);
    setDeleteText("");
    setPendingAction(null);
  }

  function handleSave(): void {
    setPendingAction("role");
    startTransition(async () => {
      const result = await updateUserRole(profile.id, role);

      if (result.error) {
        toast.error(result.error);
        setPendingAction(null);
        return;
      }

      toast.success("User role updated");
      resetModalState();
    });
  }

  function handleDelete(): void {
    setPendingAction("delete");
    startTransition(async () => {
      const result = await deleteUserAccount(profile.id, deleteText);

      if (result.error) {
        toast.error(result.error);
        setPendingAction(null);
        return;
      }

      toast.success("User deleted");
      resetModalState();
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        onClick={() => setIsOpen(true)}
        className="text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:text-brand-primary transition-colors"
      >
        <UserCog className="mr-2 h-3.5 w-3.5" />
        Manage
      </Button>

      <PremiumModal
        isOpen={isOpen}
        onClose={() => {
          if (!isPending) {
            resetModalState();
          }
        }}
        title="Manage User"
        description={profile.nickname || profile.id.slice(0, 8)}
        size="lg"
        footer={
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={resetModalState}
              className="h-12 rounded-xl font-black uppercase tracking-widest text-text-tertiary hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isPending || !hasRoleChanged}
              onClick={handleSave}
              className="h-12 rounded-xl bg-brand-primary text-white font-black uppercase tracking-widest hover:bg-white hover:text-black disabled:pointer-events-none disabled:opacity-60"
            >
              {isPending && pendingAction === "role" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : (
                "Save Role"
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-tertiary">
                <Fingerprint className="h-3.5 w-3.5" />
                User ID
              </div>
              <p className="break-all text-sm font-bold text-white">
                {profile.id}
              </p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-tertiary">
                <Calendar className="h-3.5 w-3.5" />
                Joined
              </div>
              <p className="text-sm font-bold text-white">
                {profile.created_at
                  ? new Date(profile.created_at).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-tertiary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Platform Role
            </div>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as UserRole)}
            >
              <SelectTrigger className="h-14 rounded-2xl border-white/10 bg-white/[0.03] px-5 font-bold text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[100010] border-white/10 bg-bg-secondary text-white">
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="organizer">Organizer</SelectItem>
                <SelectItem value="player">Player</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs font-semibold leading-relaxed text-text-secondary">
              {roleDescriptions[role]}
            </p>
            {isSelf && (
              <p className="rounded-xl border border-warning/20 bg-warning/10 p-3 text-[10px] font-black uppercase tracking-widest text-warning">
                You are editing your own account. Removing your own admin role
                is blocked.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-error/20 bg-error/10 p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-tight text-error">
              <AlertTriangle className="h-4 w-4" />
              Danger Zone
            </div>
            <p className="text-xs font-semibold leading-relaxed text-text-secondary">
              Delete is only allowed when this user has no linked projects,
              tournaments, registrations, participants, match reports, or CMS
              updates. This removes the Supabase Auth user and cannot be undone.
            </p>

            {confirmDelete ? (
              <div className="mt-5 space-y-3">
                <Input
                  value={deleteText}
                  onChange={(event) => setDeleteText(event.target.value)}
                  placeholder="Type DELETE to confirm"
                  disabled={isPending || isSelf}
                  className="h-12 rounded-xl border-error/20 bg-black/20 text-white"
                />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={isPending}
                    onClick={() => {
                      setConfirmDelete(false);
                      setDeleteText("");
                    }}
                    className="h-11 rounded-xl font-black uppercase tracking-widest text-text-tertiary hover:text-white"
                  >
                    Keep User
                  </Button>
                  <Button
                    type="button"
                    disabled={isPending || !canDelete}
                    onClick={handleDelete}
                    className="h-11 rounded-xl bg-error text-white font-black uppercase tracking-widest hover:bg-white hover:text-black disabled:pointer-events-none disabled:opacity-60"
                  >
                    {isPending && pendingAction === "delete" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete User
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="ghost"
                disabled={isPending || isSelf}
                onClick={() => setConfirmDelete(true)}
                className="mt-5 h-11 rounded-xl border border-error/20 bg-error/10 text-error font-black uppercase tracking-widest hover:bg-error hover:text-white disabled:pointer-events-none disabled:opacity-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </Button>
            )}
          </div>
        </div>
      </PremiumModal>
    </>
  );
}
