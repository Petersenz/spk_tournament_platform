"use client";

import { useState } from "react";
import { Check, X, Loader2, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { approveRegistration, rejectRegistration } from "./actions";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface Registration {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  profiles?: {
    nickname: string;
    avatar_url: string | null;
  };
}

export function RegistrationsList({
  registrations,
  tournamentId,
}: {
  registrations: Registration[];
  tournamentId: string;
}) {
  const t = useTranslations("Organizer.participants.requests");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const handleAction = async (regId: string, action: "approve" | "reject") => {
    setLoadingId(regId);
    const formData = new FormData();
    formData.append("registration_id", regId);
    formData.append("tournament_id", tournamentId);

    try {
      if (action === "approve") {
        await approveRegistration(formData);
      } else {
        await rejectRegistration(formData);
      }
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  if (registrations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center opacity-40">
        <Clock className="h-16 w-16 mb-6" />
        <h3 className="font-display text-2xl font-black uppercase tracking-tight text-white mb-2">
          {t("empty_title")}
        </h3>
        <p className="text-sm font-medium">{t("empty_desc")}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="space-y-6">
        {registrations.map((reg) => {
          const profile = Array.isArray(reg.profiles)
            ? reg.profiles[0]
            : reg.profiles;
          const nickname =
            profile?.nickname || `Player #${reg.user_id.slice(0, 5)}`;

          return (
            <div
              key={reg.id}
              className="bg-white/2 border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-white/10 transition-all group"
            >
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={nickname}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-text-tertiary" />
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-black text-white uppercase tracking-tight mb-1 group-hover:text-brand-primary transition-colors">
                    {nickname}
                  </h4>
                  <div className="flex items-center gap-4 text-xs font-bold text-text-tertiary uppercase tracking-widest">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {t("applied_on")}{" "}
                      {new Date(reg.created_at).toLocaleDateString()}
                    </span>
                    <span className="h-1 w-1 bg-white/10 rounded-full" />
                    <span className="flex items-center gap-1.5">
                      ID: {reg.user_id.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <Button
                  onClick={() => handleAction(reg.id, "reject")}
                  disabled={!!loadingId}
                  variant="ghost"
                  className="flex-1 md:flex-none h-14 px-8 rounded-xl border border-white/5 text-text-tertiary hover:text-error hover:bg-error/5 font-black uppercase tracking-widest text-xs transition-all"
                >
                  {loadingId === reg.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <X className="mr-2 h-4 w-4" /> {t("reject")}
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleAction(reg.id, "approve")}
                  disabled={!!loadingId}
                  className="flex-1 md:flex-none h-14 px-10 rounded-xl bg-success text-white hover:bg-white hover:text-black font-black uppercase tracking-widest text-xs shadow-lg shadow-success/10 transition-all"
                >
                  {loadingId === reg.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" /> {t("approve")}
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
