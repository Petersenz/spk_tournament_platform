import { createClient } from "@/lib/supabase/server";
import { BarChart3, Users, Trophy, Calendar } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return { title: t("admin_reports") };
}

export default async function AdminReportsPage() {
  const supabase = await createClient();

  // Fetch real data for reports
  const { count: player_count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "player");
  const { count: organizer_count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "organizer");
  const { count: active_tournaments } = await supabase
    .from("tournaments")
    .select("*", { count: "exact", head: true })
    .in("status", ["registration_open", "in_progress"]);
  const { count: total_registrations } = await supabase
    .from("registrations")
    .select("*", { count: "exact", head: true });

  const reports = [
    {
      title: "Total Players",
      value: player_count || 0,
      icon: Users,
      color: "text-brand-primary",
    },
    {
      title: "Total Organizers",
      value: organizer_count || 0,
      icon: Users,
      color: "text-info",
    },
    {
      title: "Active Tournaments",
      value: active_tournaments || 0,
      icon: Trophy,
      color: "text-warning",
    },
    {
      title: "Total Registrations",
      value: total_registrations || 0,
      icon: BarChart3,
      color: "text-success",
    },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-5xl font-black uppercase tracking-tighter text-white">
            Global Reports
          </h1>
          <p className="text-text-secondary mt-2 font-medium">
            Real-time platform analytics and metrics.
          </p>
        </div>
        <div className="bg-white/5 border border-white/5 px-6 py-3 rounded-2xl flex items-center gap-3">
          <Calendar className="h-5 w-5 text-brand-primary" />
          <span className="text-xs font-black uppercase tracking-widest text-white">
            {new Date().toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* REPORT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {reports.map((report, i) => (
          <div
            key={i}
            className="bg-[#0c0c0e] border border-white/5 rounded-[2.5rem] p-10 hover:border-brand-primary/30 transition-all group relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all">
              <report.icon className="h-20 w-20" />
            </div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] text-text-tertiary font-black uppercase tracking-[0.2em]">
                {report.title}
              </span>
              <report.icon className={`h-5 w-5 ${report.color}`} />
            </div>
            <div className="font-display text-4xl font-black text-white mb-2">
              {report.value}
            </div>
          </div>
        ))}
      </div>

      {/* ADDITIONAL DATA */}
      <div className="bg-[#0c0c0e] border border-white/5 rounded-[3rem] p-10 flex flex-col items-center justify-center space-y-6 shadow-2xl h-64">
        <BarChart3 className="h-16 w-16 text-white/5" />
        <div className="text-center">
          <p className="font-black uppercase tracking-widest text-white">
            Advanced Telemetry
          </p>
          <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest mt-2">
            More detailed analytics modules will be deployed in future updates.
          </p>
        </div>
      </div>
    </div>
  );
}
