import { cache } from "react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

export type SupportedLocale = "en" | "th";

export interface SiteSettings {
  logoUrl: string;
  siteName: string;
  siteNamePrimary: string;
  siteNameSecondary: string;
  tagline: string;
  footerText: string;
  contactEmail: string;
  facebookUrl: string;
  discordUrl: string;
}

const SETTING_KEYS = [
  "site_logo_url",
  "site_name_en",
  "site_name_th",
  "site_tagline_en",
  "site_tagline_th",
  "footer_text_en",
  "footer_text_th",
  "contact_email",
  "facebook_url",
  "discord_url",
] as const;

type SettingKey = (typeof SETTING_KEYS)[number];

interface SystemSettingRow {
  key: SettingKey;
  value: unknown;
}

function getStringSetting(
  values: Partial<Record<SettingKey, unknown>>,
  key: SettingKey,
  fallback: string,
): string {
  const value = values[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function splitSiteName(siteName: string): {
  siteNamePrimary: string;
  siteNameSecondary: string;
} {
  const words = siteName.trim().split(/\s+/);
  if (words.length <= 1) {
    return { siteNamePrimary: siteName, siteNameSecondary: "" };
  }

  return {
    siteNamePrimary: words[0] || siteName,
    siteNameSecondary: words.slice(1).join(" "),
  };
}

export const getSiteSettings = cache(
  async (locale: string): Promise<SiteSettings> => {
    const normalizedLocale: SupportedLocale = locale === "th" ? "th" : "en";
    const metadataT = await getTranslations({
      locale: normalizedLocale,
      namespace: "Metadata",
    });
    const homeT = await getTranslations({
      locale: normalizedLocale,
      namespace: "HomePage",
    });

    const fallbackSiteName = metadataT("default_title");
    const fallbackTagline = metadataT("default_desc");
    const fallbackFooterText = homeT("footer.copyright");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("system_settings")
      .select("key, value")
      .in("key", [...SETTING_KEYS]);

    const values: Partial<Record<SettingKey, unknown>> = {};

    if (!error) {
      (data as SystemSettingRow[] | null)?.forEach((setting) => {
        values[setting.key] = setting.value;
      });
    }

    const siteName = getStringSetting(
      values,
      normalizedLocale === "th" ? "site_name_th" : "site_name_en",
      fallbackSiteName,
    );
    const { siteNamePrimary, siteNameSecondary } = splitSiteName(siteName);

    return {
      logoUrl: getStringSetting(values, "site_logo_url", "/logo.png"),
      siteName,
      siteNamePrimary,
      siteNameSecondary,
      tagline: getStringSetting(
        values,
        normalizedLocale === "th" ? "site_tagline_th" : "site_tagline_en",
        fallbackTagline,
      ),
      footerText: getStringSetting(
        values,
        normalizedLocale === "th" ? "footer_text_th" : "footer_text_en",
        fallbackFooterText,
      ),
      contactEmail: getStringSetting(values, "contact_email", ""),
      facebookUrl: getStringSetting(values, "facebook_url", ""),
      discordUrl: getStringSetting(values, "discord_url", ""),
    };
  },
);
