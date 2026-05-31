import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { FeatureFlags } from "@/lib/cms/feature-flags";

export const NAVIGATION_PLACEMENTS = [
  "public_navbar",
  "public_footer",
] as const;

export type NavigationPlacement = (typeof NAVIGATION_PLACEMENTS)[number];

export interface NavigationItem {
  key: string;
  label: string;
  href: string;
  isVisible: boolean;
  sortOrder: number;
  requiredRole: string;
}

export interface NavigationDefinition {
  key: string;
  href: string;
  labelEn: string;
  labelTh: string;
  sortOrder: number;
  moduleFlag?: keyof Pick<
    FeatureFlags,
    "gamesEnabled" | "tournamentsEnabled" | "aboutEnabled"
  >;
}

export const PUBLIC_NAVIGATION_DEFINITIONS: NavigationDefinition[] = [
  {
    key: "tournaments",
    href: "/tournaments",
    labelEn: "Tournaments",
    labelTh: "ทัวร์นาเมนต์",
    sortOrder: 10,
    moduleFlag: "tournamentsEnabled",
  },
  {
    key: "games",
    href: "/games",
    labelEn: "Games",
    labelTh: "เกม",
    sortOrder: 20,
    moduleFlag: "gamesEnabled",
  },
  {
    key: "about",
    href: "/about",
    labelEn: "About",
    labelTh: "เกี่ยวกับเรา",
    sortOrder: 30,
    moduleFlag: "aboutEnabled",
  },
];

interface NavigationRow {
  key: string;
  label_en: string;
  label_th: string;
  href: string;
  is_visible: boolean | null;
  sort_order: number | null;
  required_role: string | null;
}

function normalizeHref(value: string, fallback: string): string {
  const trimmed = value.trim();
  return trimmed.startsWith("/") ? trimmed : fallback;
}

function fallbackItems(locale: string): NavigationItem[] {
  const useThai = locale === "th";
  return PUBLIC_NAVIGATION_DEFINITIONS.map((item) => ({
    key: item.key,
    label: useThai ? item.labelTh : item.labelEn,
    href: item.href,
    isVisible: true,
    sortOrder: item.sortOrder,
    requiredRole: "",
  }));
}

const getNavigationRows = cache(async (placement: NavigationPlacement) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("navigation_items")
    .select(
      "key, label_en, label_th, href, is_visible, sort_order, required_role",
    )
    .eq("placement", placement)
    .order("sort_order", { ascending: true });

  if (error) {
    return [];
  }

  return (data || []) as NavigationRow[];
});

export async function getNavigationItems(
  locale: string,
  placement: NavigationPlacement,
  featureFlags?: FeatureFlags,
): Promise<NavigationItem[]> {
  const useThai = locale === "th";
  const rows = await getNavigationRows(placement);
  const definitionByKey = new Map(
    PUBLIC_NAVIGATION_DEFINITIONS.map((item) => [item.key, item]),
  );

  const source =
    rows.length > 0
      ? rows.map((row) => {
          const definition = definitionByKey.get(row.key);

          return {
            key: row.key,
            label: useThai ? row.label_th : row.label_en,
            href: normalizeHref(row.href, definition?.href || "/"),
            isVisible: row.is_visible !== false,
            sortOrder: row.sort_order ?? definition?.sortOrder ?? 0,
            requiredRole: row.required_role || "",
          };
        })
      : fallbackItems(locale);

  return source
    .filter((item) => {
      if (!item.isVisible) {
        return false;
      }

      const definition = definitionByKey.get(item.key);
      if (!definition?.moduleFlag || !featureFlags) {
        return true;
      }

      return featureFlags[definition.moduleFlag];
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
