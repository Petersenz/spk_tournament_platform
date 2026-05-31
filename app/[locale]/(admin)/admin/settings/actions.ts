"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import {
  CONTENT_BLOCK_KEYS,
  normalizeCmsHref,
  type ContentBlockKey,
} from "@/lib/cms/content-blocks";
import { FEATURE_FLAG_KEYS } from "@/lib/cms/feature-flags";
import {
  NAVIGATION_PLACEMENTS,
  PUBLIC_NAVIGATION_DEFINITIONS,
  type NavigationPlacement,
} from "@/lib/cms/navigation";

const CONTENT_LOCALES = ["en", "th"] as const;

function getText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getCheckbox(
  formData: FormData,
  key: string,
  fallback = false,
): boolean {
  if (!formData.has(key)) {
    return fallback;
  }

  return formData.get(key) === "on";
}

function getContentFieldName(
  key: ContentBlockKey,
  locale: (typeof CONTENT_LOCALES)[number],
  field: string,
): string {
  return `content_${key}_${locale}_${field}`;
}

function getNavigationFieldName(
  placement: NavigationPlacement,
  key: string,
  field: string,
): string {
  return `nav_${placement}_${key}_${field}`;
}

function assertDbSuccess(
  result: { error: { message: string } | null },
  context: string,
): void {
  if (result.error) {
    throw new Error(`${context}: ${result.error.message}`);
  }
}

function normalizeAssetUrl(value: string, fallback = "/logo.png"): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }

  if (trimmed.startsWith("/") || /^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return fallback;
}

function revalidateCmsPaths(): void {
  revalidatePath("/admin/settings");
  revalidatePath("/en/admin/settings");
  revalidatePath("/th/admin/settings");
  revalidatePath("/maintenance");
  revalidatePath("/en/maintenance");
  revalidatePath("/th/maintenance");
  revalidatePath("/");
  revalidatePath("/en");
  revalidatePath("/th");
  revalidatePath("/games");
  revalidatePath("/en/games");
  revalidatePath("/th/games");
  revalidatePath("/tournaments");
  revalidatePath("/en/tournaments");
  revalidatePath("/th/tournaments");
  revalidatePath("/about");
  revalidatePath("/en/about");
  revalidatePath("/th/about");
  revalidatePath("/register");
  revalidatePath("/en/register");
  revalidatePath("/th/register");
  revalidatePath("/", "layout");
}

export async function updateSiteLogoUrl(logoUrl: string) {
  const adminUserId = await requireAdmin();
  const supabase = await createClient();
  const safeLogoUrl = normalizeAssetUrl(logoUrl);

  assertDbSuccess(
    await supabase.from("system_settings").upsert({
      key: "site_logo_url",
      value: safeLogoUrl,
      updated_at: new Date().toISOString(),
      updated_by: adminUserId,
    }),
    "Failed to save site logo",
  );

  revalidateCmsPaths();

  return { logoUrl: safeLogoUrl };
}

export async function updateSettings(formData: FormData) {
  const adminUserId = await requireAdmin();
  const supabase = await createClient();

  const siteLogoUrl = normalizeAssetUrl(getText(formData, "site_logo_url"));
  const siteNameEn = getText(formData, "site_name_en");
  const siteNameTh = getText(formData, "site_name_th");
  const siteTaglineEn = getText(formData, "site_tagline_en");
  const siteTaglineTh = getText(formData, "site_tagline_th");
  const footerTextEn = getText(formData, "footer_text_en");
  const footerTextTh = getText(formData, "footer_text_th");
  const contactEmail = getText(formData, "contact_email");
  const facebookUrl = getText(formData, "facebook_url");
  const discordUrl = getText(formData, "discord_url");

  // We will upsert each setting
  const updates = [
    { key: "site_logo_url", value: siteLogoUrl },
    { key: "site_name_en", value: siteNameEn },
    { key: "site_name_th", value: siteNameTh },
    { key: "site_tagline_en", value: siteTaglineEn },
    { key: "site_tagline_th", value: siteTaglineTh },
    { key: "footer_text_en", value: footerTextEn },
    { key: "footer_text_th", value: footerTextTh },
    { key: "contact_email", value: contactEmail },
    { key: "facebook_url", value: facebookUrl },
    { key: "discord_url", value: discordUrl },
    ...FEATURE_FLAG_KEYS.map((key) => ({
      key,
      value: getCheckbox(formData, `flag_${key}`) || false,
    })),
  ];

  for (const update of updates) {
    assertDbSuccess(
      await supabase.from("system_settings").upsert({
        ...update,
        updated_at: new Date().toISOString(),
        updated_by: adminUserId,
      }),
      `Failed to save ${update.key}`,
    );
  }

  for (const key of CONTENT_BLOCK_KEYS) {
    for (const locale of CONTENT_LOCALES) {
      const fallbackHref = key === "home_hero" ? "/tournaments" : "";
      const ctaHref = normalizeCmsHref(
        getText(formData, getContentFieldName(key, locale, "cta_href")),
        fallbackHref,
      );

      assertDbSuccess(
        await supabase.from("content_blocks").upsert(
          {
            key,
            locale,
            title: getText(formData, getContentFieldName(key, locale, "title")),
            subtitle: getText(
              formData,
              getContentFieldName(key, locale, "subtitle"),
            ),
            body: getText(formData, getContentFieldName(key, locale, "body")),
            image_url: getText(
              formData,
              getContentFieldName(key, locale, "image_url"),
            ),
            cta_label: getText(
              formData,
              getContentFieldName(key, locale, "cta_label"),
            ),
            cta_href: ctaHref,
            is_active: getCheckbox(
              formData,
              getContentFieldName(key, locale, "active"),
              true,
            ),
            updated_at: new Date().toISOString(),
            updated_by: adminUserId,
          },
          { onConflict: "key,locale" },
        ),
        `Failed to save ${key} ${locale} content`,
      );
    }
  }

  for (const placement of NAVIGATION_PLACEMENTS) {
    for (const item of PUBLIC_NAVIGATION_DEFINITIONS) {
      assertDbSuccess(
        await supabase.from("navigation_items").upsert(
          {
            placement,
            key: item.key,
            label_en:
              getText(
                formData,
                getNavigationFieldName(placement, item.key, "label_en"),
              ) || item.labelEn,
            label_th:
              getText(
                formData,
                getNavigationFieldName(placement, item.key, "label_th"),
              ) || item.labelTh,
            href: item.href,
            is_visible: getCheckbox(
              formData,
              getNavigationFieldName(placement, item.key, "visible"),
            ),
            sort_order: item.sortOrder,
            required_role: "",
            updated_at: new Date().toISOString(),
            updated_by: adminUserId,
          },
          { onConflict: "placement,key" },
        ),
        `Failed to save ${placement} ${item.key} navigation`,
      );
    }
  }

  revalidateCmsPaths();
}
