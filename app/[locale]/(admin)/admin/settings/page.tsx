import { ShieldCheck, Settings, Globe, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";
import { updateSettings } from "./actions";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return { title: t("admin_settings") };
}

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  // Fetch settings from DB
  const { data: settings } = await supabase.from("system_settings").select("*");

  const getSetting = (
    key: string,
    defaultValue: string | boolean | number,
  ) => {
    const setting = settings?.find((s) => s.key === key);
    return setting ? setting.value : defaultValue;
  };

  const platformName = getSetting(
    "platform_name",
    "Samutprakan Esports Association",
  );
  const maintenanceMode = getSetting("maintenance_mode", false);
  const publicRegistration = getSetting("public_registration", true);

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div>
        <h1 className="font-display text-5xl font-black uppercase tracking-tighter text-white">
          System Config
        </h1>
        <p className="text-text-secondary mt-2 font-medium">
          Global platform parameters and configurations.
        </p>
      </div>

      <form
        action={async (formData) => {
          "use server";
          await updateSettings(formData);
        }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-10"
      >
        {/* CORE SETTINGS */}
        <div className="space-y-8 bg-[#0c0c0e] border border-white/5 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Globe className="h-24 w-24" />
          </div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="h-10 w-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
              <Settings className="h-5 w-5" />
            </div>
            <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white">
              General Config
            </h2>
          </div>

          <div className="space-y-8 relative z-10">
            <div className="flex items-center justify-between p-6 bg-white/2 rounded-2xl border border-white/5 group hover:border-brand-primary/30 transition-all">
              <div className="space-y-1">
                <Label
                  htmlFor="maintenance_mode"
                  className="text-sm font-black uppercase tracking-tight text-white cursor-pointer"
                >
                  Maintenance Mode
                </Label>
                <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest">
                  Disable public access during updates
                </p>
              </div>
              <Switch
                id="maintenance_mode"
                name="maintenance_mode"
                defaultChecked={maintenanceMode}
              />
            </div>

            <div className="flex items-center justify-between p-6 bg-white/2 rounded-2xl border border-white/5 group hover:border-brand-primary/30 transition-all">
              <div className="space-y-1">
                <Label
                  htmlFor="public_registration"
                  className="text-sm font-black uppercase tracking-tight text-white cursor-pointer"
                >
                  Public Registration
                </Label>
                <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest">
                  Allow new players to sign up
                </p>
              </div>
              <Switch
                id="public_registration"
                name="public_registration"
                defaultChecked={publicRegistration}
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="platform_name"
                className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary"
              >
                Platform Name
              </Label>
              <Input
                id="platform_name"
                name="platform_name"
                defaultValue={platformName}
                className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold"
                required
              />
            </div>
          </div>
        </div>

        {/* SECURITY & SAVE */}
        <div className="space-y-10">
          <div className="bg-[#0c0c0e] border border-white/5 p-10 rounded-[3rem] shadow-xl space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center text-success border border-success/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white">
                Security Status
              </h2>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                  Two-Factor Auth (Admins)
                </span>
                <span className="text-[10px] px-3 py-1 rounded-full bg-success/10 text-success font-black uppercase tracking-widest border border-success/20">
                  Enabled
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                  Global Rate Limiting
                </span>
                <span className="text-[10px] px-3 py-1 rounded-full bg-brand-primary text-white font-black uppercase tracking-widest">
                  Active
                </span>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-brand-primary text-white hover:bg-white hover:text-black h-16 rounded-2xl font-black uppercase tracking-widest shadow-[0_0_30px_rgba(244,0,9,0.4)] transition-all"
          >
            <Save className="mr-2 h-5 w-5" /> Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
