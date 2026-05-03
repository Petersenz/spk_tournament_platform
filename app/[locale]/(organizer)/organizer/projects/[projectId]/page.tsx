import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Link } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";
import { deleteProject } from "../actions";
import {
  Edit3,
  ChevronLeft,
  Plus,
  Trophy,
  Calendar,
  Swords,
  Info,
} from "lucide-react";
import { DeleteProjectButton } from "./DeleteProjectButton";
import Image from "next/image";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch Project
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("owner_id", user?.id)
    .single();

  if (!project) {
    notFound();
  }

  // Fetch Tournaments in this project
  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("*, games(name, logo_url), participants(count)")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20">
      {/* NAVIGATION & BREADCRUMB */}
      <Link
        href="/organizer/projects"
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary hover:text-brand-primary transition-colors group"
      >
        <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />{" "}
        Back to Projects
      </Link>

      {/* HERO HEADER */}
      <div className="relative overflow-hidden rounded-[3rem] border border-white/5 bg-[#0c0c0e] shadow-2xl p-10 lg:p-16">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 blur-[120px] rounded-full -mr-64 -mt-64"></div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
          <div className="flex flex-col md:flex-row items-center gap-10">
            {/* Logo Container */}
            <div className="relative h-40 w-40 shrink-0 group">
              <div className="absolute inset-0 bg-brand-primary rounded-[2.5rem] blur-2xl opacity-10 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative h-full w-full rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl backdrop-blur-xl">
                {project.logo_url ? (
                  <Image
                    src={project.logo_url}
                    alt={project.name}
                    width={120}
                    height={120}
                    className="object-contain"
                  />
                ) : (
                  <Trophy className="h-16 w-16 text-brand-primary/40" />
                )}
              </div>
            </div>

            <div className="space-y-4 text-center md:text-left">
              <h1 className="font-display text-5xl lg:text-7xl font-black uppercase tracking-tighter text-white drop-shadow-2xl">
                {project.name}
              </h1>
              {project.description ? (
                <p className="text-text-secondary max-w-2xl text-lg font-medium leading-relaxed">
                  {project.description}
                </p>
              ) : (
                <p className="text-text-tertiary italic">
                  No description provided for this project.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            <Link href={`/organizer/projects/${projectId}/edit`}>
              <Button
                variant="outline"
                className="h-14 px-8 rounded-2xl border-white/10 hover:bg-white/5 font-black uppercase tracking-widest text-[10px]"
              >
                <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            </Link>
            <DeleteProjectButton projectId={projectId} />
          </div>
        </div>
      </div>

      {/* TOURNAMENTS SECTION */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-1 bg-brand-primary rounded-full"></div>
            <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white">
              Active Tournaments
            </h2>
          </div>
          <Link href={`/organizer/projects/${project.id}/tournaments/new`}>
            <Button className="bg-brand-primary text-white hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all font-black uppercase tracking-widest px-8 h-14 rounded-2xl">
              <Plus className="mr-2 h-5 w-5" /> Create Tournament
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {tournaments?.length === 0 ? (
            <div className="col-span-full py-24 text-center border border-dashed border-white/10 rounded-[3rem] bg-white/2 backdrop-blur-sm group">
              <Swords className="mx-auto h-16 w-16 text-white/10 mb-6 group-hover:scale-110 transition-transform duration-700" />
              <h3 className="font-display text-xl font-black uppercase tracking-tight text-white mb-2">
                No tournaments found
              </h3>
              <p className="text-text-tertiary font-medium">
                Start hosting competitions within this project.
              </p>
            </div>
          ) : (
            tournaments?.map((t) => (
              <Link
                key={t.id}
                href={`/organizer/tournaments/${t.id}`}
                className="group"
              >
                <div className="tilt-card h-full">
                  <div className="tilt-card-inner bg-bg-secondary border border-white/5 rounded-[2.5rem] p-10 h-full flex flex-col justify-between hover:border-brand-primary transition-all shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Trophy className="h-32 w-32" />
                    </div>

                    <div className="space-y-6 relative z-10">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] text-brand-primary font-black uppercase tracking-[0.3em] mb-2 block">
                            {t.games?.name || "Custom Game"}
                          </span>
                          <h3 className="font-display text-2xl font-black text-white group-hover:text-brand-primary transition-colors uppercase tracking-tight">
                            {t.name}
                          </h3>
                        </div>
                        <span
                          className={`text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-[0.2em] shadow-lg ${
                            t.status === "registration_open"
                              ? "bg-success text-white"
                              : "bg-white/10 text-text-tertiary"
                          }`}
                        >
                          {t.status.replace("_", " ")}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                        <div className="space-y-1">
                          <div className="text-[9px] text-text-tertiary font-black uppercase tracking-[0.2em]">
                            Format
                          </div>
                          <div className="text-xs font-black text-white uppercase">
                            {t.match_type}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[9px] text-text-tertiary font-black uppercase tracking-[0.2em]">
                            Participant
                          </div>
                          <div className="text-xs font-black text-white uppercase">
                            {t.participant_type}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-2 text-[10px] text-text-tertiary font-black uppercase tracking-[0.2em]">
                        <Plus className="h-3 w-3 text-brand-primary" />
                        <span>
                          {(t.participants as unknown as { count: number }[])?.[0]
                            ?.count || 0}{" "}
                          / {t.size} Slots Filled
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-text-tertiary font-black uppercase tracking-[0.2em]">
                        <Calendar className="h-3 w-3 text-brand-primary" />
                        <span>
                          {new Date(t.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* QUICK STATS / INFO BOX */}
      <div className="bg-[#0c0c0e] border border-white/5 rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
            <Info className="h-8 w-8" />
          </div>
          <div>
            <h4 className="font-display text-xl font-black uppercase tracking-tight text-white">
              Project Insights
            </h4>
            <p className="text-sm text-text-tertiary font-medium">
              Detailed reports and player analytics are available in the main
              dashboard.
            </p>
          </div>
        </div>
        <Link href="/organizer/dashboard">
          <Button
            variant="outline"
            className="border-white/10 hover:bg-white/5 font-black uppercase tracking-widest text-[10px] px-8 h-12 rounded-xl transition-all"
          >
            View Dashboard Stats
          </Button>
        </Link>
      </div>
    </div>
  );
}
