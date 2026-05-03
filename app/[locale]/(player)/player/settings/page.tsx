import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/app/[locale]/(player)/player/settings/actions";
import { User, Shield, Bell } from "lucide-react";

export default async function PlayerSettingsPage() {
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
    <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl">
      <div>
        <h1 className="font-display text-3xl font-bold">Account Settings</h1>
        <p className="text-text-secondary mt-1">
          Manage your identity and preferences.
        </p>
      </div>

      <form
        action={async (formData) => {
          "use server";
          await updateProfile(formData);
        }}
        className="space-y-6"
      >
        <section className="bg-bg-secondary border border-border-primary rounded-xl p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2 text-brand-primary mb-2">
            <User className="h-5 w-5" />
            <h2 className="font-display font-bold uppercase tracking-widest text-sm">
              Public Profile
            </h2>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nickname">Display Name / Nickname</Label>
            <Input
              id="nickname"
              name="nickname"
              defaultValue={profile?.nickname || ""}
              className="bg-bg-tertiary border-border-primary"
              placeholder="e.g. ProGamer99"
            />
            <p className="text-[10px] text-text-tertiary">
              This is how other players and organizers will see you in brackets.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="email">Email Address (Read-only)</Label>
            <Input
              id="email"
              disabled
              value={user.email || ""}
              className="bg-bg-tertiary border-border-primary opacity-50 cursor-not-allowed"
            />
          </div>
        </section>

        <section className="bg-bg-secondary border border-border-primary rounded-xl p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2 text-warning mb-2">
            <Shield className="h-5 w-5" />
            <h2 className="font-display font-bold uppercase tracking-widest text-sm">
              Role & Security
            </h2>
          </div>

          <div className="flex justify-between items-center py-2">
            <div>
              <div className="text-sm font-bold">Platform Role</div>
              <div className="text-xs text-text-tertiary uppercase">
                {profile?.role || "player"}
              </div>
            </div>
            <div
              className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${profile?.role === "organizer" ? "bg-brand-primary text-white" : "bg-bg-tertiary text-text-secondary"}`}
            >
              {profile?.role}
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            className="bg-brand-primary text-white hover:bg-brand-hover px-10"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
