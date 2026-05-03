import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Link } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProject } from "../../actions";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("owner_id", user?.id)
    .single();

  if (!project) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link
          href={`/organizer/projects/${projectId}`}
          className="text-sm text-text-tertiary hover:text-brand-primary"
        >
          ← Back to Project
        </Link>
        <h1 className="font-display text-3xl font-bold mt-4">Edit Project</h1>
      </div>

      <div className="bg-bg-secondary border border-border-primary rounded-xl p-8">
        <form
          action={async (formData) => {
            await updateProject(projectId, formData);
          }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={project.name}
              required
              className="bg-bg-tertiary border-border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={project.description || ""}
              className="w-full rounded-md bg-bg-tertiary border border-border-primary p-3 text-sm focus:border-brand-primary outline-none transition-all"
            />
          </div>

          <div className="pt-4 flex gap-4">
            <Button
              type="submit"
              className="flex-1 bg-brand-primary text-white hover:bg-brand-hover"
            >
              Save Changes
            </Button>
            <Link href={`/organizer/projects/${projectId}`} className="flex-1">
              <Button
                type="button"
                variant="outline"
                className="w-full border-border-primary"
              >
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
