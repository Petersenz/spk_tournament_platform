"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/routing";
import { signup } from "../actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RegisterPage() {
  const t = useTranslations("Auth.register");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await signup(formData);
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
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold p-4 rounded-xl text-center uppercase tracking-widest">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label
              htmlFor="nickname"
              className="text-xs font-black uppercase tracking-widest text-text-tertiary"
            >
              {t("nickname")}
            </Label>
            <Input
              id="nickname"
              name="nickname"
              required
              className="bg-white/5 border-white/10 h-12 rounded-xl focus:border-brand-primary transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-xs font-black uppercase tracking-widest text-text-tertiary"
            >
              Email
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
            <Label htmlFor="password text-xs font-black uppercase tracking-widest text-text-tertiary">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="bg-white/5 border-white/10 h-12 rounded-xl focus:border-brand-primary transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="role"
              className="text-xs font-black uppercase tracking-widest text-text-tertiary"
            >
              {t("role")}
            </Label>
            <Select name="role" defaultValue="player">
              <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-brand-primary">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="bg-bg-secondary border-white/10 text-white">
                <SelectItem value="player">Player</SelectItem>
                <SelectItem value="organizer">Organizer</SelectItem>
              </SelectContent>
            </Select>
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
            {t("has_account")}{" "}
            <Link
              href="/login"
              className="text-brand-primary hover:text-white transition-colors ml-1"
            >
              Login
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
