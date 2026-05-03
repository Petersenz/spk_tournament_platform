import { createClient } from "@/lib/supabase/server";
import {
  Users,
  Shield,
  ShieldCheck,
  Mail,
  Calendar,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return { title: t("admin_users") };
}

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="font-display text-5xl font-black uppercase tracking-tighter text-white">
            User Directory
          </h1>
          <p className="text-text-secondary mt-2 font-medium">
            Monitor and manage all platform participants and organizers.
          </p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
          <Input
            className="bg-white/5 border-white/5 pl-14 h-16 rounded-2xl text-white font-bold uppercase tracking-widest text-xs focus:border-brand-primary transition-all shadow-2xl"
            placeholder="Search nickname or email..."
          />
        </div>
      </div>

      {/* USERS LIST */}
      <div className="bg-[#0c0c0e] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="p-6 bg-white/2 border-b border-white/5 grid grid-cols-4 text-[10px] font-black uppercase tracking-widest text-text-tertiary px-10">
          <span>Profile</span>
          <span>Role</span>
          <span>Joined Date</span>
          <span className="text-right">Action</span>
        </div>
        <div className="divide-y divide-white/5">
          {profiles?.map((profile) => (
            <div
              key={profile.id}
              className="px-10 py-8 grid grid-cols-4 items-center hover:bg-white/2 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-brand-subtle flex items-center justify-center text-brand-primary border border-brand-primary/10 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6" />
                </div>
                <div className="truncate">
                  <div className="font-black text-white uppercase tracking-tight truncate">
                    {profile.nickname}
                  </div>
                  <div className="text-[10px] text-text-tertiary uppercase font-bold tracking-widest truncate">
                    {profile.id.slice(0, 8)}
                  </div>
                </div>
              </div>

              <div>
                <span
                  className={`text-[9px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest flex items-center gap-2 w-fit ${
                    profile.role === "admin"
                      ? "bg-brand-primary text-white"
                      : profile.role === "organizer"
                        ? "bg-success/10 text-success border border-success/20"
                        : "bg-white/5 text-text-tertiary"
                  }`}
                >
                  {profile.role === "admin" ? (
                    <ShieldCheck className="h-3 w-3" />
                  ) : profile.role === "organizer" ? (
                    <Shield className="h-3 w-3" />
                  ) : null}
                  {profile.role}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-text-tertiary font-medium">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(profile.created_at).toLocaleDateString()}
              </div>

              <div className="text-right">
                <Button
                  variant="ghost"
                  className="text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:text-brand-primary transition-colors"
                >
                  Manage
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
