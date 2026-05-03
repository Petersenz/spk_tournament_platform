import { createClient } from "@/lib/supabase/server";
import { Link } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";
import { Folder, Plus, Calendar, Trophy, ChevronRight } from "lucide-react";
import Image from "next/image";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: projects } = await supabase
    .from("projects")
    .select("*, tournaments(count)")
    .eq("owner_id", user?.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="font-display text-4xl font-black uppercase tracking-tighter text-white">
            Your Projects
          </h1>
          <p className="text-text-secondary mt-2 font-medium">
            Manage your organizations, brands, and tournament hubs.
          </p>
        </div>
        <Link href="/organizer/projects/new">
          <Button className="bg-brand-primary text-white hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all font-black uppercase tracking-widest px-8 h-14 rounded-2xl">
            <Plus className="mr-2 h-5 w-5" /> New Project
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {projects?.length === 0 ? (
          <div className="col-span-full bg-bg-secondary border border-white/5 rounded-[3rem] p-20 text-center shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <Folder className="mx-auto h-20 w-20 text-brand-primary/20 mb-8" />
            <h3 className="font-display text-2xl font-black uppercase tracking-tight text-white mb-3">
              No Projects Yet
            </h3>
            <p className="text-text-secondary mb-10 max-w-sm mx-auto font-medium leading-relaxed">
              Create your first project to start organizing tournaments and
              managing your esports brand.
            </p>
            <Link href="/organizer/projects/new">
              <Button className="bg-white text-black hover:bg-brand-primary hover:text-white transition-all font-black uppercase tracking-widest px-10 h-14 rounded-2xl">
                Create Your First Project
              </Button>
            </Link>
          </div>
        ) : (
          projects?.map((project) => (
            <Link
              key={project.id}
              href={`/organizer/projects/${project.id}`}
              className="group"
            >
              <div className="tilt-card h-full">
                <div className="tilt-card-inner bg-bg-secondary border border-white/5 rounded-[2.5rem] p-8 h-full flex flex-col hover:border-brand-primary/50 transition-all shadow-2xl relative overflow-hidden">
                  {/* Backdrop Glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-brand-primary/20 transition-all duration-700"></div>

                  <div className="flex items-start justify-between mb-8 relative z-10">
                    <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-500 shadow-xl">
                      {project.logo_url ? (
                        <Image
                          src={project.logo_url}
                          alt={project.name}
                          width={64}
                          height={64}
                          className="object-cover h-full w-full"
                        />
                      ) : (
                        <Folder className="h-8 w-8 text-brand-primary" />
                      )}
                    </div>
                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-text-tertiary group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="space-y-4 flex-1 relative z-10">
                    <h3 className="font-display text-2xl font-black text-white group-hover:text-brand-primary transition-colors uppercase tracking-tight leading-none">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-text-tertiary text-sm line-clamp-2 font-medium leading-relaxed">
                        {project.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2 text-[10px] text-text-tertiary font-black uppercase tracking-[0.2em]">
                      <Trophy className="h-3 w-3 text-brand-primary" />
                      <span>
                        {(project.tournaments as unknown as { count: number }[])?.[0]
                          ?.count || 0}{" "}
                        Tournaments
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-text-tertiary font-black uppercase tracking-[0.2em]">
                      <Calendar className="h-3 w-3 text-brand-primary" />
                      <span>
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
