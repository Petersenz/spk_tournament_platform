import { Link } from "@/lib/i18n/routing";
import { getFeatureFlags } from "@/lib/cms/feature-flags";
import { Button } from "@/components/ui/button";
import { LockKeyhole } from "lucide-react";
import { RegisterForm } from "./RegisterForm";

export default async function RegisterPage() {
  const featureFlags = await getFeatureFlags();

  if (!featureFlags.publicRegistrationEnabled) {
    return (
      <div className="p-6 md:p-10 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-primary/20 bg-brand-primary/10 text-brand-primary">
          <LockKeyhole className="h-6 w-6" />
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-black uppercase tracking-tight text-white">
          Registration Closed
        </h1>
        <p className="mt-4 text-sm font-medium leading-relaxed text-text-secondary">
          New account registration is currently disabled. Existing users can
          still sign in.
        </p>
        <Link href="/login">
          <Button className="mt-8 bg-brand-primary text-white hover:bg-white hover:text-black font-black uppercase tracking-widest">
            Go to Login
          </Button>
        </Link>
      </div>
    );
  }

  return <RegisterForm />;
}
