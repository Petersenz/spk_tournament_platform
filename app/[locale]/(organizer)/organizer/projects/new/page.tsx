import { ProjectForm } from "@/components/project/ProjectForm";
import { createProject } from "../actions";
import { Link } from "@/lib/i18n/routing";
import { ChevronLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function NewProjectPage() {
  const t = await getTranslations("Organizer.projects");

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4">
        <Link
          href="/organizer/projects"
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
        submitAction={createProject}
        cancelHref="/organizer/projects"
      />
    </div>
  );
}
