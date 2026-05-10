import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/app/[locale]/(player)/player/settings/actions";
import { User, Shield } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ProfileImageUpload } from "@/components/ProfileImageUpload";

export default async function OrganizerSettingsPage() {
  const t = await getTranslations("Player.settings");
  const common = await getTranslations("Common");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto py-10">
      <div>
        <h1 className="font-display text-4xl font-black uppercase tracking-tighter text-white">
          {t("title")}
        </h1>
        <p className="text-text-tertiary mt-2 font-bold uppercase tracking-widest text-[10px]">
          {t("subtitle")}
        </p>
      </div>

      <form
        key={profile?.id}
        action={async (formData) => {
          "use server";
          await updateProfile(formData, "/organizer/settings");
        }}
        className="space-y-6"
      >
        <section className="bg-bg-secondary border border-white/5 rounded-[2.5rem] p-8 md:p-12 space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-[80px]"></div>

          <div className="flex items-center gap-3 text-brand-primary mb-2">
            <div className="h-10 w-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <h2 className="font-display font-black uppercase tracking-tighter text-xl text-white">
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

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-3">
              <Label
                htmlFor="nickname"
                className="text-xs font-bold uppercase tracking-widest text-text-tertiary ml-1"
              >
                {t("nickname_label")}
              </Label>
              <Input
                key={profile?.nickname}
                id="nickname"
                name="nickname"
                defaultValue={profile?.nickname || ""}
                className="h-14 bg-white/5 border-white/10 rounded-2xl focus:border-brand-primary text-white font-bold"
                placeholder="e.g. Organizer_Hub"
              />
              <p className="text-[10px] text-text-tertiary font-medium px-1">
                {t("nickname_hint")}
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/5">
            <Label
              htmlFor="email"
              className="text-xs font-bold uppercase tracking-widest text-text-tertiary ml-1 opacity-50"
            >
              {t("email_label")}
            </Label>
            <Input
              id="email"
              disabled
              value={user.email || ""}
              className="h-14 bg-white/[0.02] border-white/5 rounded-2xl opacity-50 cursor-not-allowed text-text-tertiary"
            />
          </div>
        </section>

        <section className="bg-bg-secondary border border-white/5 rounded-[2.5rem] p-8 md:p-12 space-y-8 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-3 text-warning mb-2">
            <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Shield className="h-5 w-5" />
            </div>
            <h2 className="font-display font-black uppercase tracking-tighter text-xl text-white">
              {t("security_section")}
            </h2>
          </div>

          <div className="flex justify-between items-center py-4 px-6 bg-white/5 rounded-2xl border border-white/5">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-text-tertiary mb-1">
                {t("role_label")}
              </div>
              <div className="text-sm font-black text-white uppercase tracking-tight">
                {profile?.role || "organizer"}
              </div>
            </div>
            <div
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${profile?.role === "organizer" || profile?.role === "admin" ? "bg-brand-primary text-white shadow-[0_0_20px_rgba(155,27,48,0.3)]" : "bg-bg-tertiary text-text-secondary"}`}
            >
              {profile?.role}
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            className="bg-brand-primary text-white hover:bg-white hover:text-black h-16 px-12 rounded-2xl font-black uppercase tracking-widest transition-all shadow-2xl"
          >
            {common("save")}
          </Button>
        </div>
      </form>
    </div>
  );
}
