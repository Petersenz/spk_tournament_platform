"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/routing";
import { login } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const t = useTranslations("Auth.login");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardHeader className="space-y-2 pb-8">
        <CardTitle className="text-3xl font-black uppercase tracking-tighter text-white text-center">
          {t("title")}
        </CardTitle>
        <CardDescription className="text-center font-medium text-text-tertiary">
          {t("subtitle")}
        </CardDescription>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent className="space-y-6 px-8">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold p-4 rounded-xl text-center uppercase tracking-widest animate-shake">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-xs font-black uppercase tracking-widest text-text-tertiary"
            >
              {t("email")}
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
              className="bg-white/5 border-white/10 h-12 rounded-xl focus:border-brand-primary transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-xs font-black uppercase tracking-widest text-text-tertiary"
            >
              {t("password")}
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="bg-white/5 border-white/10 h-12 rounded-xl focus:border-brand-primary transition-all"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-6 p-8">
          <Button
            className="w-full bg-brand-primary text-white hover:bg-white hover:text-black h-14 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg"
            type="submit"
            disabled={pending}
          >
            {pending ? "..." : t("submit")}
          </Button>
          <div className="text-center text-xs font-bold text-text-tertiary uppercase tracking-widest">
            {t("no_account")}{" "}
            <Link
              href="/register"
              className="text-brand-primary hover:text-white transition-colors ml-1"
            >
              {t("register")}
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
