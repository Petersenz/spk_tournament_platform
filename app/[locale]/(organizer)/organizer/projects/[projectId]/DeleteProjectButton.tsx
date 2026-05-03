"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteProject } from "../actions";

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this project? This will delete all its tournaments too.",
      )
    ) {
      return;
    }
    await deleteProject(projectId);
  };

  return (
    <form
      action={async () => {
        await handleDelete();
      }}
    >
      <Button
        variant="outline"
        type="submit"
        className="border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
      >
        <Trash2 className="h-4 w-4 mr-2" /> Delete
      </Button>
    </form>
  );
}
