import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const FEATURE_FLAG_KEYS = [
  "module_games_enabled",
  "module_tournaments_enabled",
  "module_about_enabled",
  "module_public_registration_enabled",
  "maintenance_mode",
] as const;

export type FeatureFlagKey = (typeof FEATURE_FLAG_KEYS)[number];

export interface FeatureFlags {
  gamesEnabled: boolean;
  tournamentsEnabled: boolean;
  aboutEnabled: boolean;
  publicRegistrationEnabled: boolean;
  maintenanceMode: boolean;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  gamesEnabled: true,
  tournamentsEnabled: true,
  aboutEnabled: true,
  publicRegistrationEnabled: true,
  maintenanceMode: false,
};

interface SystemSettingRow {
  key: FeatureFlagKey;
  value: unknown;
}

function getBoolean(
  values: Partial<Record<FeatureFlagKey, unknown>>,
  key: FeatureFlagKey,
  fallback: boolean,
): boolean {
  return typeof values[key] === "boolean" ? values[key] : fallback;
}

export const getFeatureFlags = cache(async (): Promise<FeatureFlags> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("system_settings")
    .select("key, value")
    .in("key", [...FEATURE_FLAG_KEYS]);

  if (error) {
    return DEFAULT_FEATURE_FLAGS;
  }

  const values: Partial<Record<FeatureFlagKey, unknown>> = {};

  (data as SystemSettingRow[] | null)?.forEach((setting) => {
    values[setting.key] = setting.value;
  });

  return {
    gamesEnabled: getBoolean(
      values,
      "module_games_enabled",
      DEFAULT_FEATURE_FLAGS.gamesEnabled,
    ),
    tournamentsEnabled: getBoolean(
      values,
      "module_tournaments_enabled",
      DEFAULT_FEATURE_FLAGS.tournamentsEnabled,
    ),
    aboutEnabled: getBoolean(
      values,
      "module_about_enabled",
      DEFAULT_FEATURE_FLAGS.aboutEnabled,
    ),
    publicRegistrationEnabled: getBoolean(
      values,
      "module_public_registration_enabled",
      DEFAULT_FEATURE_FLAGS.publicRegistrationEnabled,
    ),
    maintenanceMode: getBoolean(
      values,
      "maintenance_mode",
      DEFAULT_FEATURE_FLAGS.maintenanceMode,
    ),
  };
});
