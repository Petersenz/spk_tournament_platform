import { createClient } from "@/lib/supabase/server";
import { CheckCircle2, Trash2, User, Trophy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/routing";
import { updateReportStatus, deleteReport } from "./actions";

export default async function AdminIssuesPage() {
  const supabase = await createClient();
  const { data: reports } = await supabase
    .from("reports")
    .select(
      `
      *,
      tournaments(name),
      reporter:profiles!reporter_id(nickname)
    `,
    )
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="font-display text-5xl font-black uppercase tracking-tighter text-white">
            Conflict Issues
          </h1>
          <p className="text-text-secondary mt-2 font-medium">
            Manage and resolve reports submitted by the community.
          </p>
        </div>
      </div>

      {/* ISSUES LIST */}
      <div className="space-y-6">
        {reports?.length === 0 ? (
          <div className="bg-[#0c0c0e] border border-white/5 rounded-[3rem] p-20 text-center shadow-2xl">
            <CheckCircle2 className="mx-auto h-20 w-20 text-success/20 mb-8" />
            <h3 className="font-display text-2xl font-black uppercase tracking-tight text-white mb-3">
              All Clear
            </h3>
            <p className="text-text-secondary font-medium">
              No pending reports or conflicts at this time.
            </p>
          </div>
        ) : (
          reports?.map((report) => (
            <div
              key={report.id}
              className="bg-[#0c0c0e] border border-white/5 rounded-[2.5rem] p-8 hover:border-brand-primary/30 transition-all shadow-2xl group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-brand-primary/10 transition-all duration-700"></div>

              <div className="flex flex-col md:flex-row justify-between gap-8 relative z-10">
                <div className="space-y-6 flex-1">
                  <div className="flex flex-wrap items-center gap-4">
                    <div
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        report.status === "pending"
                          ? "bg-warning/10 text-warning border-warning/20"
                          : "bg-success/10 text-success border-success/20"
                      }`}
                    >
                      {report.status}
                    </div>
                    <span className="text-xs font-bold text-text-tertiary tabular-nums">
                      {new Date(report.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-brand-primary transition-colors">
                      {report.reason}
                    </h3>
                    <div className="flex flex-wrap gap-6 mt-4">
                      <div className="flex items-center gap-2 text-[10px] text-text-tertiary font-black uppercase tracking-widest">
                        <Trophy className="h-3.5 w-3.5 text-brand-primary" />
                        {report.tournaments?.name || "Unknown Tournament"}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-text-tertiary font-black uppercase tracking-widest">
                        <User className="h-3.5 w-3.5 text-brand-primary" />
                        Reported by: {report.reporter?.nickname || "System"}
                      </div>
                    </div>
                  </div>

                  {report.match_id && (
                    <Link
                      href={`/admin/matches/${report.match_id}`}
                      className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-primary hover:text-white transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> View Related
                      Match
                    </Link>
                  )}
                </div>

                <div className="flex flex-col gap-3 justify-center md:min-w-[200px]">
                  {report.status === "pending" && (
                    <form
                      action={async () => {
                        "use server";
                        await updateReportStatus(report.id, "resolved");
                      }}
                    >
                      <Button className="w-full bg-success text-white hover:bg-white hover:text-black font-black uppercase tracking-widest text-[11px] h-12 rounded-xl transition-all">
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Resolve Issue
                      </Button>
                    </form>
                  )}
                  <form
                    action={async () => {
                      "use server";
                      await deleteReport(report.id);
                    }}
                  >
                    <Button
                      variant="ghost"
                      className="w-full text-text-tertiary hover:text-error hover:bg-error/5 font-black uppercase tracking-widest text-[11px] h-12 rounded-xl transition-all"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Dismiss Report
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
