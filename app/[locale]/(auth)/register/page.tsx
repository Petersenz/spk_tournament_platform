"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/lib/i18n/routing";
import { signup } from "../actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RegisterPage() {
  const t = useTranslations("Auth.register");
  const locale = useLocale();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [role, setRole] = useState("player");

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await signup(formData, locale);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardHeader className="space-y-1.5 pb-4 pt-4 px-6 md:px-10">
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
        <CardContent className="space-y-4 px-6 md:px-10">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-2xl flex items-start gap-3 animate-shake shadow-[0_0_20px_rgba(244,0,9,0.1)] mb-2">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-destructive/80">
                  {t("error_title") || "การลงทะเบียนไม่สำเร็จ"}
                </p>
                <p className="text-sm font-bold text-destructive leading-tight">
                  {error}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {/* Nickname Field */}
            <div className="space-y-2">
              <Label
                htmlFor="nickname"
                className="text-sm md:text-base font-bold uppercase tracking-wide text-white/70 ml-1"
              >
                {t("nickname")}
              </Label>
              <Input
                id="nickname"
                name="nickname"
                placeholder={t("nickname_placeholder")}
                required
                className="bg-white/[0.03] border-white/5 h-12 rounded-xl focus:border-brand-primary focus:bg-white/[0.05] transition-all text-white px-5 text-sm placeholder:text-white/20"
              />
            </div>

            {/* Role Field */}
            <div className="space-y-2">
              <Label
                htmlFor="role"
                className="text-sm md:text-base font-bold uppercase tracking-wide text-white/70 ml-1"
              >
                {t("role")}
              </Label>
              <Select name="role" value={role} onValueChange={setRole}>
                <SelectTrigger className="bg-white/[0.03] border-white/5 h-12 rounded-xl focus:ring-brand-primary text-white px-5 text-sm">
                  <SelectValue placeholder={t("role_placeholder")} />
                </SelectTrigger>
                <SelectContent className="bg-bg-secondary border-white/10 text-white">
                  <SelectItem value="player">{t("role_player")}</SelectItem>
                  <SelectItem value="organizer">
                    {t("role_organizer")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom ID Field */}
            <div className="space-y-2">
              <Label
                htmlFor="custom_id"
                className="text-sm md:text-base font-bold uppercase tracking-wide text-white/70 ml-1"
              >
                {t("custom_id")}
              </Label>
              <Input
                id="custom_id"
                name="custom_id"
                placeholder={t("custom_id_placeholder")}
                className="bg-white/[0.03] border-white/5 h-12 rounded-xl focus:border-brand-primary focus:bg-white/[0.05] transition-all text-white px-5 text-sm placeholder:text-white/20"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm md:text-base font-bold uppercase tracking-wide text-white/70 ml-1"
              >
                {t("email")}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t("email_placeholder")}
                required
                className="bg-white/[0.03] border-white/5 h-12 rounded-xl focus:border-brand-primary focus:bg-white/[0.05] transition-all text-white px-5 text-sm placeholder:text-white/20"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm md:text-base font-bold uppercase tracking-wide text-white/70 ml-1"
              >
                {t("password")}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder={t("password_placeholder")}
                required
                className="bg-white/[0.03] border-white/5 h-12 rounded-xl focus:border-brand-primary focus:bg-white/[0.05] transition-all text-white px-5 text-sm placeholder:text-white/20"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 p-6 md:p-10 pt-6">
          <Button
            className="w-full bg-brand-primary text-white hover:bg-white hover:text-black h-14 rounded-xl font-black uppercase tracking-widest transition-all shadow-2xl text-sm relative overflow-hidden group/btn"
            type="submit"
            disabled={pending}
          >
            <span className="relative z-10">
              {pending ? t("processing") : t("submit")}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
          </Button>

          <div className="text-center text-xs font-black text-text-tertiary uppercase tracking-[0.2em] opacity-60">
            {t("has_account")}{" "}
            <Link
              href="/login"
              className="text-brand-primary hover:text-white transition-colors ml-1 border-b border-brand-primary/30 hover:border-white"
            >
              {t("login_link")}
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
