import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/project/ProjectForm";
import { updateProject } from "../../actions";
import { Link } from "@/lib/i18n/routing";
import { ChevronLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const t = await getTranslations("Organizer.projects");
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

  // Bind the ID to the action
  const boundUpdateAction = async (formData: FormData) => {
    "use server";
    return updateProject(projectId, formData);
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4">
        <Link
          href={`/organizer/projects/${projectId}`}
          className="text-[10px] font-black uppercase tracking-[0.3em] text-text-tertiary hover:text-brand-primary flex items-center transition-colors"
        >
          <ChevronLeft className="mr-1 h-3 w-3" /> {t("back")}
        </Link>
        <h1 className="font-display text-5xl font-black uppercase tracking-tighter text-white">
          {t("new_title")}
        </h1>
        <p className="text-text-secondary font-medium">{t("new_subtitle")}</p>
      </div>

      <ProjectForm
        initialData={project}
        submitAction={boundUpdateAction}
        cancelHref={`/organizer/projects/${projectId}`}
      />
    </div>
  );
}
