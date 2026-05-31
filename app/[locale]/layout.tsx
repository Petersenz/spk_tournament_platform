import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/lib/i18n/routing";
import { getSiteSettings } from "@/lib/cms/site-settings";
import { Kanit, Inter } from "next/font/google";
import "../globals.css";

const kanit = Kanit({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-kanit",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const siteSettings = await getSiteSettings(locale);

  return {
    title: {
      template: `%s | ${siteSettings.siteName || t("default_title")}`,
      default: siteSettings.siteName || t("default_title"),
    },
    description: siteSettings.tagline || t("default_desc"),
    icons: {
      icon: siteSettings.logoUrl,
      shortcut: siteSettings.logoUrl,
      apple: siteSettings.logoUrl,
    },
  };
}

import { Toaster } from "sonner";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as "en" | "th")) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${kanit.variable} ${inter.variable} dark`}>
      <body className="antialiased font-display bg-background text-foreground">
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster position="top-center" richColors theme="dark" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
