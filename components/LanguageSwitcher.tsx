"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/lib/i18n/routing";
import { useTransition } from "react";
import { Button } from "./ui/button";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function onToggle() {
    const nextLocale = locale === "en" ? "th" : "en";
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="font-display font-medium text-text-secondary hover:text-brand-primary w-10 px-0"
      onClick={onToggle}
      disabled={isPending}
    >
      {locale === "en" ? "TH" : "EN"}
    </Button>
  );
}
