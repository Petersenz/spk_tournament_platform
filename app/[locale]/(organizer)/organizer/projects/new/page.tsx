"use client";

import { useState } from "react";
import { Link } from "@/lib/i18n/routing";
import { createProject } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewProjectPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await createProject(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/organizer/projects">
          <Button variant="ghost" size="icon" className="rounded-full">
            ←
          </Button>
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold">Create Project</h1>
          <p className="text-text-secondary mt-1">
            Set up a new organization or franchise.
          </p>
        </div>
      </div>

      <div className="bg-bg-secondary border border-border-primary rounded-lg p-6">
        <form
          action={async (formData) => {
            await handleSubmit(formData);
          }}
          className="space-y-6"
        >
          {error && (
            <div className="p-4 bg-error/10 border border-error rounded-md text-error text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">
              Project Name <span className="text-error">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Samutprakan Esports Association"
              required
              className="bg-bg-tertiary border-border-primary focus-visible:ring-brand-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Tell us about this project..."
              className="w-full flex rounded-md border bg-bg-tertiary border-border-primary px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo Image</Label>
            <Input
              id="logo"
              name="logo"
              type="file"
              accept="image/png, image/jpeg, image/webp"
              className="bg-bg-tertiary border-border-primary focus-visible:ring-brand-primary cursor-pointer file:text-text-primary file:bg-bg-secondary file:border-0 file:mr-4 file:px-4 file:py-2 file:rounded-md hover:file:bg-brand-primary"
            />
          </div>

          <div className="pt-4 flex justify-end gap-4 border-t border-border-secondary">
            <Link href="/organizer/projects">
              <Button
                type="button"
                variant="ghost"
                className="text-text-secondary hover:text-text-primary hover:bg-bg-tertiary"
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={pending}
              className="bg-brand-primary text-white hover:bg-brand-hover"
            >
              {pending ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
