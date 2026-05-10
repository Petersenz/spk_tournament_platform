"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/lib/i18n/routing";
import { login } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
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
  const locale = useLocale();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await login(formData, locale);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardHeader className="space-y-1.5 pb-6 pt-4 px-6 md:px-10">
        <div className="flex items-center gap-3 mb-1 opacity-50">
          <span className="h-[2px] w-6 bg-brand-primary"></span>
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-primary">
            {t("badge")}
          </span>
        </div>
        <CardTitle className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight">
          {t("title")}
        </CardTitle>
        <CardDescription className="font-bold text-text-tertiary uppercase tracking-widest text-xs md:text-sm opacity-80">
          {t("subtitle")}
        </CardDescription>
      </CardHeader>

      <form action={handleSubmit}>
        <CardContent className="space-y-6 px-6 md:px-10">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-2xl flex items-start gap-3 animate-shake shadow-[0_0_20px_rgba(244,0,9,0.1)]">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-destructive/80">
                  {t("error_title") || "การเข้าถึงถูกปฏิเสธ"}
                </p>
                <p className="text-sm font-bold text-destructive leading-tight">
                  {error}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2.5">
            <Label
              htmlFor="email"
              className="text-sm md:text-base font-bold uppercase tracking-wide text-white/70 ml-1"
            >
              {t("email")}
            </Label>
            <div className="relative group">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t("email_placeholder")}
                required
                className="bg-white/[0.03] border-white/5 h-14 rounded-2xl focus:border-brand-primary focus:bg-white/[0.05] transition-all text-white px-6 text-base placeholder:text-white/20"
              />
              <div className="absolute inset-0 rounded-2xl bg-brand-primary/5 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity"></div>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between items-center px-1">
              <Label
                htmlFor="password"
                className="text-sm md:text-base font-bold uppercase tracking-wide text-white/70"
              >
                {t("password")}
              </Label>
              <Link
                href="#"
                className="text-xs font-bold uppercase tracking-widest text-brand-primary/60 hover:text-brand-primary transition-colors"
              >
                {t("forgot_password")}
              </Link>
            </div>
            <div className="relative group">
              <Input
                id="password"
                name="password"
                type="password"
                placeholder={t("password_placeholder")}
                required
                className="bg-white/[0.03] border-white/5 h-14 rounded-2xl focus:border-brand-primary focus:bg-white/[0.05] transition-all text-white px-6 text-base placeholder:text-white/20"
              />
              <div className="absolute inset-0 rounded-2xl bg-brand-primary/5 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity"></div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-6 p-6 md:p-10 pt-8">
          <Button
            className="w-full bg-brand-primary text-white hover:bg-white hover:text-black h-16 rounded-2xl font-black uppercase tracking-widest transition-all shadow-2xl text-base relative overflow-hidden group/btn"
            type="submit"
            disabled={pending}
          >
            <span className="relative z-10">
              {pending ? t("processing") : t("submit")}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
          </Button>

          <div className="text-center text-xs font-black text-text-tertiary uppercase tracking-[0.2em] opacity-60">
            {t("no_account")}{" "}
            <Link
              href="/register"
              className="text-brand-primary hover:text-white transition-colors ml-1 border-b border-brand-primary/30 hover:border-white"
            >
              {t("register")}
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
