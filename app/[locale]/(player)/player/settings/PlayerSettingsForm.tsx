"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ProfileImageUpload } from "@/components/ProfileImageUpload";
import { User, Shield, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { appToast } from "@/lib/app-toast";
import { updateProfile } from "./actions";

interface SettingsProfile {
  id?: string;
  nickname?: string | null;
  custom_user_identifier?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  role?: string | null;
}

export function PlayerSettingsForm({
  profile,
  userEmail,
}: {
  profile: SettingsProfile | null;
  userEmail: string;
}) {
  const t = useTranslations("Player.settings");
  const common = useTranslations("Common");
  const [pending, setPending] = useState(false);

  return (
    <form
      key={profile?.id}
      action={async (formData) => {
        setPending(true);
        const res = await updateProfile(formData, "/player/settings");
        setPending(false);
        if (res?.error) {
          appToast.error(res.error);
        } else {
          appToast.success(t("saved"));
        }
      }}
      className="space-y-6"
    >
      <section className="bg-bg-secondary border border-border-primary rounded-xl p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-2 text-brand-primary mb-2">
          <User className="h-5 w-5" />
          <h2 className="font-display font-bold uppercase tracking-widest text-sm">
            {t("profile_section")}
          </h2>
        </div>

        {/* Avatar Upload */}
        <div className="flex justify-center pb-4">
          <ProfileImageUpload
            currentImageUrl={profile?.avatar_url}
            name="avatar"
            label={t("change_avatar")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nickname">{t("nickname_label")}</Label>
          <Input
            id="nickname"
            name="nickname"
            defaultValue={profile?.nickname || ""}
            className="bg-bg-tertiary border-border-primary"
            placeholder="e.g. ProGamer99"
          />
          <p className="text-[10px] text-text-tertiary">{t("nickname_hint")}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="custom_user_identifier">{t("custom_id_label")}</Label>
          <Input
            id="custom_user_identifier"
            name="custom_user_identifier"
            defaultValue={profile?.custom_user_identifier || ""}
            className="bg-bg-tertiary border-border-primary"
            placeholder="e.g. Username#1234"
          />
          <p className="text-[10px] text-text-tertiary">
            {t("custom_id_hint")}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">{t("bio_label")}</Label>
          <Textarea
            id="bio"
            name="bio"
            defaultValue={profile?.bio || ""}
            className="bg-bg-tertiary border-border-primary min-h-[100px] resize-none"
            placeholder={t("bio_placeholder")}
          />
        </div>

        <div className="space-y-2 pt-2">
          <Label htmlFor="email">{t("email_label")}</Label>
          <Input
            id="email"
            disabled
            value={userEmail}
            className="bg-bg-tertiary border-border-primary opacity-50 cursor-not-allowed"
          />
        </div>
      </section>

      <section className="bg-bg-secondary border border-border-primary rounded-xl p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-2 text-warning mb-2">
          <Shield className="h-5 w-5" />
          <h2 className="font-display font-bold uppercase tracking-widest text-sm">
            {t("security_section")}
          </h2>
        </div>

        <div className="flex justify-between items-center py-2">
          <div>
            <div className="text-sm font-bold">{t("role_label")}</div>
            <div className="text-xs text-text-tertiary uppercase">
              {profile?.role || "player"}
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
              profile?.role === "organizer"
                ? "bg-brand-primary text-white"
                : "bg-bg-tertiary text-text-secondary"
            }`}
          >
            {profile?.role}
          </div>
        </div>
      </section>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={pending}
          className="bg-brand-primary text-white hover:bg-brand-hover px-10 disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            common("save")
          )}
        </Button>
      </div>
    </form>
  );
}
