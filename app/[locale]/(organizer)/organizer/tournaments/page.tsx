import { createClient } from "@/lib/supabase/server";
import { Link } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, Layout } from "lucide-react";

export default async function OrganizerTournamentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch all tournaments where the owner of the project is the current user
  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("*, projects!inner(owner_id, name), games(name)")
    .eq("projects.owner_id", user?.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">All Tournaments</h1>
        <p className="text-text-secondary mt-1">
          Manage all competitions across your projects.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {tournaments?.length === 0 ? (
          <div className="col-span-full py-20 text-center border border-dashed border-border-primary rounded-xl bg-bg-secondary">
            <Trophy className="mx-auto h-12 w-12 text-text-tertiary mb-4" />
            <h3 className="font-display text-xl font-bold">
              No tournaments found
            </h3>
            <p className="text-text-secondary mb-6">
              Create your first tournament inside a project.
            </p>
            <Link href="/organizer/projects">
              <Button className="bg-brand-primary text-white hover:bg-brand-hover">
                Go to Projects
              </Button>
            </Link>
          </div>
        ) : (
          tournaments?.map((t) => (
            <Link key={t.id} href={`/organizer/tournaments/${t.id}`}>
              <div className="bg-bg-secondary border border-border-primary rounded-xl p-5 hover:border-brand-primary transition-all group flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-[10px] text-brand-primary font-bold uppercase tracking-widest mb-1">
                      {t.projects?.name}
                    </div>
                    <h3 className="font-display text-xl font-bold text-text-primary group-hover:text-brand-primary transition-colors">
                      {t.name}
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider ${
                      t.status === "registration_open"
                        ? "bg-brand-primary text-white"
                        : "bg-bg-tertiary text-text-secondary"
                    }`}
                  >
                    {t.status.replace("_", " ")}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-border-secondary/50">
                  <div className="flex items-center gap-2 text-xs text-text-tertiary">
                    <Layout className="h-3 w-3" />
                    <span>{t.games?.name || "Custom"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-tertiary justify-end">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(t.created_at).toLocaleDateString()}</span>
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
