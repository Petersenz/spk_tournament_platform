import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const CONTENT_BLOCK_KEYS = [
  "home_hero",
  "about_intro",
  "partner_cta",
] as const;

export type ContentBlockKey = (typeof CONTENT_BLOCK_KEYS)[number];

export interface ContentBlock {
  key: ContentBlockKey;
  title: string;
  subtitle: string;
  body: string;
  imageUrl: string;
  ctaLabel: string;
  ctaHref: string;
  isActive: boolean;
}

export type ContentBlockFallbacks = Record<
  ContentBlockKey,
  Partial<Omit<ContentBlock, "key" | "isActive">>
>;

interface ContentBlockRow {
  key: ContentBlockKey;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_href: string | null;
  is_active: boolean | null;
}

function cleanText(value: string | null | undefined, fallback = ""): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

export function normalizeCmsHref(value: string, fallback = ""): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }

  if (
    trimmed.startsWith("/") ||
    /^https?:\/\//i.test(trimmed) ||
    /^mailto:[^@\s]+@[^@\s]+\.[^@\s]+$/i.test(trimmed)
  ) {
    return trimmed;
  }

  return fallback;
}

const getContentBlockRows = cache(async (locale: string) => {
  const normalizedLocale = locale === "th" ? "th" : "en";
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_blocks")
    .select(
      "key, title, subtitle, body, image_url, cta_label, cta_href, is_active",
    )
    .eq("locale", normalizedLocale)
    .in("key", [...CONTENT_BLOCK_KEYS]);

  if (error) {
    return [];
  }

  return (data || []) as ContentBlockRow[];
});

export async function getContentBlocks(
  locale: string,
  fallbacks: ContentBlockFallbacks,
): Promise<Record<ContentBlockKey, ContentBlock>> {
  const rows = await getContentBlockRows(locale);
  const byKey = new Map(rows.map((row) => [row.key, row]));

  return CONTENT_BLOCK_KEYS.reduce(
    (acc, key) => {
      const row = byKey.get(key);
      const fallback = fallbacks[key] || {};
      const rowIsActive = row?.is_active !== false;

      acc[key] = {
        key,
        title:
          row && rowIsActive
            ? cleanText(row.title, fallback.title)
            : fallback.title || "",
        subtitle:
          row && rowIsActive
            ? cleanText(row.subtitle, fallback.subtitle)
            : fallback.subtitle || "",
        body:
          row && rowIsActive
            ? cleanText(row.body, fallback.body)
            : fallback.body || "",
        imageUrl:
          row && rowIsActive
            ? cleanText(row.image_url, fallback.imageUrl)
            : fallback.imageUrl || "",
        ctaLabel:
          row && rowIsActive
            ? cleanText(row.cta_label, fallback.ctaLabel)
            : fallback.ctaLabel || "",
        ctaHref:
          row && rowIsActive
            ? normalizeCmsHref(row.cta_href || "", fallback.ctaHref)
            : fallback.ctaHref || "",
        isActive: rowIsActive,
      };

      return acc;
    },
    {} as Record<ContentBlockKey, ContentBlock>,
  );
}
