import { ShieldCheck, Settings, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";
import { updateSettings } from "./actions";
import { SiteLogoUploadField } from "./SiteLogoUploadField";
import { SettingsSubmitButton } from "./SettingsSubmitButton";
import { getTranslations } from "next-intl/server";
import {
  CONTENT_BLOCK_KEYS,
  type ContentBlockKey,
} from "@/lib/cms/content-blocks";
import {
  DEFAULT_FEATURE_FLAGS,
  FEATURE_FLAG_KEYS,
  type FeatureFlagKey,
} from "@/lib/cms/feature-flags";
import {
  NAVIGATION_PLACEMENTS,
  PUBLIC_NAVIGATION_DEFINITIONS,
  type NavigationPlacement,
} from "@/lib/cms/navigation";

const CONTENT_LOCALES = ["en", "th"] as const;

interface ContentBlockAdminRow {
  key: ContentBlockKey;
  locale: (typeof CONTENT_LOCALES)[number];
  title: string | null;
  subtitle: string | null;
  body: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_href: string | null;
  is_active: boolean | null;
}

interface NavigationAdminRow {
  placement: NavigationPlacement;
  key: string;
  label_en: string;
  label_th: string;
  href: string;
  is_visible: boolean | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return { title: t("admin_settings") };
}

export default async function AdminSettingsPage() {
  const t = await getTranslations("Admin.settings_page");
  const supabase = await createClient();

  // Fetch settings from DB
  const { data: settings } = await supabase.from("system_settings").select("*");
  const { data: contentBlocks, error: contentBlocksError } = await supabase
    .from("content_blocks")
    .select(
      "key, locale, title, subtitle, body, image_url, cta_label, cta_href, is_active",
    )
    .in("key", [...CONTENT_BLOCK_KEYS])
    .in("locale", [...CONTENT_LOCALES]);
  const { data: navigationItems, error: navigationItemsError } = await supabase
    .from("navigation_items")
    .select("placement, key, label_en, label_th, href, is_visible")
    .in("placement", [...NAVIGATION_PLACEMENTS]);
  const cmsSchemaReady = !contentBlocksError && !navigationItemsError;

  const getSetting = (key: string, defaultValue: string | boolean | number) => {
    const setting = settings?.find((s) => s.key === key);
    return setting ? setting.value : defaultValue;
  };

  const getTextSetting = (key: string, defaultValue: string): string => {
    const value = getSetting(key, defaultValue);
    return typeof value === "string" ? value : defaultValue;
  };

  const getBooleanSetting = (key: string, defaultValue: boolean): boolean => {
    const value = getSetting(key, defaultValue);
    return typeof value === "boolean" ? value : defaultValue;
  };

  const siteLogoUrl = getTextSetting("site_logo_url", "/logo.png");
  const siteNameEn = getTextSetting(
    "site_name_en",
    "Samutprakan Esports Association",
  );
  const siteNameTh = getTextSetting(
    "site_name_th",
    "สมาคมกีฬาอีสปอร์ตสมุทรปราการ",
  );
  const siteTaglineEn = getTextSetting(
    "site_tagline_en",
    "The ultimate tournament platform for Samutprakan Esport Association.",
  );
  const siteTaglineTh = getTextSetting(
    "site_tagline_th",
    "แพลตฟอร์มจัดการแข่งขันกีฬาอีสปอร์ตที่ครบวงจรที่สุดสำหรับสมาคมกีฬาอีสปอร์ตจังหวัดสมุทรปราการ",
  );
  const footerTextEn = getTextSetting(
    "footer_text_en",
    "© 2026 Samutprakan Esports Association. All rights reserved.",
  );
  const footerTextTh = getTextSetting(
    "footer_text_th",
    "© 2026 สมาคมกีฬาอีสปอร์ตจังหวัดสมุทรปราการ สงวนลิขสิทธิ์",
  );
  const contactEmail = getTextSetting("contact_email", "");
  const facebookUrl = getTextSetting("facebook_url", "");
  const discordUrl = getTextSetting("discord_url", "");
  const featureFlags: Record<FeatureFlagKey, boolean> = {
    module_games_enabled: getBooleanSetting(
      "module_games_enabled",
      DEFAULT_FEATURE_FLAGS.gamesEnabled,
    ),
    module_tournaments_enabled: getBooleanSetting(
      "module_tournaments_enabled",
      DEFAULT_FEATURE_FLAGS.tournamentsEnabled,
    ),
    module_about_enabled: getBooleanSetting(
      "module_about_enabled",
      DEFAULT_FEATURE_FLAGS.aboutEnabled,
    ),
    module_public_registration_enabled: getBooleanSetting(
      "module_public_registration_enabled",
      DEFAULT_FEATURE_FLAGS.publicRegistrationEnabled,
    ),
    maintenance_mode: getBooleanSetting(
      "maintenance_mode",
      DEFAULT_FEATURE_FLAGS.maintenanceMode,
    ),
  };
  const contentRows = (contentBlocks || []) as ContentBlockAdminRow[];
  const navigationRows = (navigationItems || []) as NavigationAdminRow[];
  const contentFallbacks = {
    home_hero: {
      en: {
        title: "COMPETE. CONQUER. CLAIM GLORY.",
        subtitle:
          "The ultimate tournament platform for Samutprakan Esport Association.",
        cta_label: "Browse Tournaments",
        cta_href: "/tournaments",
      },
      th: {
        title: "แหล่งรวมการแข่งขัน\nเพื่อชิงชัยความเป็นหนึ่ง",
        subtitle:
          "แพลตฟอร์มจัดการแข่งขันกีฬาอีสปอร์ตที่ครบวงจรที่สุดสำหรับสมาคมกีฬาอีสปอร์ตจังหวัดสมุทรปราการ",
        cta_label: "หาทัวร์นาเมนต์",
        cta_href: "/tournaments",
      },
    },
    about_intro: {
      en: {
        title: "About Samutprakan Esport",
        subtitle:
          "We are dedicated to building a professional ecosystem for competitive gaming in Samutprakan. Our platform empowers organizers to host world-class tournaments and players to discover their potential.",
        cta_label: "",
        cta_href: "",
      },
      th: {
        title: "เกี่ยวกับสมาคมกีฬาอีสปอร์ตสมุทรปราการ",
        subtitle:
          "เรามุ่งมั่นที่จะสร้างระบบนิเวศระดับมืออาชีพสำหรับการแข่งขันเกมในสมุทรปราการ แพลตฟอร์มของเราช่วยให้นักจัดการแข่งขันสามารถจัดงานระดับโลก และให้ผู้เล่นได้ค้นพบศักยภาพของตนเอง",
        cta_label: "",
        cta_href: "",
      },
    },
    partner_cta: {
      en: {
        title: "Interested in partnering?",
        subtitle:
          "If you are an organization or sponsor looking to support the Samutprakan Esports Association, we would love to hear from you.",
        cta_label: "Contact Us",
        cta_href: "mailto:contact@spk-tournaments.com",
      },
      th: {
        title: "สนใจร่วมเป็นพันธมิตรกับเรา?",
        subtitle:
          "หากคุณเป็นองค์กรหรือสปอนเซอร์ที่ต้องการสนับสนุนสมาคมกีฬาอีสปอร์ตจังหวัดสมุทรปราการ เรายินดีที่จะร่วมงานกับคุณ",
        cta_label: "ติดต่อเรา",
        cta_href: "mailto:contact@spk-tournaments.com",
      },
    },
  } satisfies Record<
    ContentBlockKey,
    Record<
      (typeof CONTENT_LOCALES)[number],
      { title: string; subtitle: string; cta_label: string; cta_href: string }
    >
  >;

  const getContentValue = (
    key: ContentBlockKey,
    locale: (typeof CONTENT_LOCALES)[number],
    field:
      | "title"
      | "subtitle"
      | "body"
      | "image_url"
      | "cta_label"
      | "cta_href",
  ): string => {
    const row = contentRows.find(
      (item) => item.key === key && item.locale === locale,
    );
    const fallback = contentFallbacks[key][locale];
    const value = row?.[field];

    if (typeof value === "string" && value.trim()) {
      return value;
    }

    return field in fallback ? fallback[field as keyof typeof fallback] : "";
  };

  const getNavigationRow = (
    placement: NavigationPlacement,
    key: string,
  ): NavigationAdminRow | undefined =>
    navigationRows.find(
      (item) => item.placement === placement && item.key === key,
    );
  const contentLabels: Record<ContentBlockKey, string> = {
    home_hero: t("content_labels.home_hero"),
    about_intro: t("content_labels.about_intro"),
    partner_cta: t("content_labels.partner_cta"),
  };
  const featureLabels: Record<
    FeatureFlagKey,
    { title: string; description: string }
  > = {
    module_games_enabled: {
      title: t("features.games.title"),
      description: t("features.games.description"),
    },
    module_tournaments_enabled: {
      title: t("features.tournaments.title"),
      description: t("features.tournaments.description"),
    },
    module_about_enabled: {
      title: t("features.about.title"),
      description: t("features.about.description"),
    },
    module_public_registration_enabled: {
      title: t("features.public_registration.title"),
      description: t("features.public_registration.description"),
    },
    maintenance_mode: {
      title: t("features.maintenance.title"),
      description: t("features.maintenance.description"),
    },
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div>
        <h1 className="font-display text-5xl font-black uppercase tracking-tighter text-white">
          {t("title")}
        </h1>
        <p className="text-text-secondary mt-2 font-medium">{t("subtitle")}</p>
      </div>

      {!cmsSchemaReady && (
        <div className="rounded-[2rem] border border-warning/30 bg-warning/10 p-6 text-warning">
          <div className="font-display text-lg font-black uppercase tracking-tight">
            {t("cms_warning.title")}
          </div>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest leading-relaxed text-warning/80">
            {t("cms_warning.description")}
          </p>
        </div>
      )}

      <form
        action={async (formData) => {
          "use server";
          await updateSettings(formData);
        }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-10"
      >
        {/* BRAND SETTINGS */}
        <div className="lg:col-span-2 space-y-8 bg-[#0c0c0e] border border-white/5 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Settings className="h-24 w-24" />
          </div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center text-warning border border-warning/20">
              <Globe className="h-5 w-5" />
            </div>
            <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white">
              {t("brand.title")}
            </h2>
          </div>

          <div className="space-y-6 relative z-10">
            <SiteLogoUploadField
              initialValue={siteLogoUrl}
              labels={{
                title: t("logo.title"),
                description: t("logo.description"),
                upload: t("logo.upload"),
                autoSave: t("logo.auto_save"),
                saving: t("logo.saving"),
                success: t("logo.success"),
                error: t("logo.error"),
                previewTitle: t("logo.preview_title"),
                previewDescription: t("logo.preview_description"),
                navbarPreview: t("logo.navbar_preview"),
                navbarPreviewDescription: t("logo.navbar_preview_desc"),
                iconPreview: t("logo.icon_preview"),
                iconPreviewDescription: t("logo.icon_preview_desc"),
                previewAlt: t("logo.preview_alt"),
                smallPreviewAlt: t("logo.small_preview_alt"),
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label
                  htmlFor="site_name_en"
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary"
                >
                  {t("brand.site_name_en")}
                </Label>
                <Input
                  key={`site-name-en-${siteNameEn}`}
                  id="site_name_en"
                  name="site_name_en"
                  defaultValue={siteNameEn}
                  className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="site_name_th"
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary"
                >
                  {t("brand.site_name_th")}
                </Label>
                <Input
                  key={`site-name-th-${siteNameTh}`}
                  id="site_name_th"
                  name="site_name_th"
                  defaultValue={siteNameTh}
                  className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="site_tagline_en"
                className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary"
              >
                {t("brand.tagline_en")}
              </Label>
              <Input
                key={`site-tagline-en-${siteTaglineEn}`}
                id="site_tagline_en"
                name="site_tagline_en"
                defaultValue={siteTaglineEn}
                className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold"
                required
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="site_tagline_th"
                className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary"
              >
                {t("brand.tagline_th")}
              </Label>
              <Input
                key={`site-tagline-th-${siteTaglineTh}`}
                id="site_tagline_th"
                name="site_tagline_th"
                defaultValue={siteTaglineTh}
                className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold"
                required
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="footer_text_en"
                className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary"
              >
                {t("brand.footer_text_en")}
              </Label>
              <Input
                key={`footer-text-en-${footerTextEn}`}
                id="footer_text_en"
                name="footer_text_en"
                defaultValue={footerTextEn}
                className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold"
                required
              />
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="footer_text_th"
                className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary"
              >
                {t("brand.footer_text_th")}
              </Label>
              <Input
                key={`footer-text-th-${footerTextTh}`}
                id="footer_text_th"
                name="footer_text_th"
                defaultValue={footerTextTh}
                className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label
                  htmlFor="contact_email"
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary"
                >
                  {t("brand.contact_email")}
                </Label>
                <Input
                  key={`contact-email-${contactEmail}`}
                  id="contact_email"
                  name="contact_email"
                  defaultValue={contactEmail}
                  className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold"
                />
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="facebook_url"
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary"
                >
                  {t("brand.facebook_url")}
                </Label>
                <Input
                  key={`facebook-url-${facebookUrl}`}
                  id="facebook_url"
                  name="facebook_url"
                  defaultValue={facebookUrl}
                  className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold"
                />
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="discord_url"
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary"
                >
                  {t("brand.discord_url")}
                </Label>
                <Input
                  key={`discord-url-${discordUrl}`}
                  id="discord_url"
                  name="discord_url"
                  defaultValue={discordUrl}
                  className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT SETTINGS */}
        <div className="lg:col-span-2 space-y-8 bg-[#0c0c0e] border border-white/5 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Globe className="h-24 w-24" />
          </div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="h-10 w-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white">
                {t("public_content.title")}
              </h2>
              <p className="text-xs font-bold uppercase tracking-widest text-text-tertiary mt-1">
                {t("public_content.description")}
              </p>
            </div>
          </div>

          <div className="space-y-8 relative z-10">
            {CONTENT_BLOCK_KEYS.map((blockKey) => (
              <section
                key={blockKey}
                className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 space-y-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display text-lg font-black uppercase tracking-tight text-white">
                      {contentLabels[blockKey]}
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary mt-1">
                      {t("public_content.locale_note")}
                    </p>
                  </div>
                  {CONTENT_LOCALES.map((locale) => (
                    <input
                      key={`${blockKey}-${locale}-active`}
                      type="hidden"
                      name={`content_${blockKey}_${locale}_active`}
                      value="on"
                    />
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {CONTENT_LOCALES.map((locale) => (
                    <div key={`${blockKey}-${locale}`} className="space-y-4">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">
                        {locale === "en" ? t("locale.en") : t("locale.th")}
                      </div>

                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">
                          {t("fields.title")}
                        </Label>
                        <Textarea
                          name={`content_${blockKey}_${locale}_title`}
                          defaultValue={getContentValue(
                            blockKey,
                            locale,
                            "title",
                          )}
                          className="min-h-24 bg-white/5 border-white/10 rounded-xl text-white font-bold"
                          required
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">
                          {t("fields.subtitle")}
                        </Label>
                        <Textarea
                          name={`content_${blockKey}_${locale}_subtitle`}
                          defaultValue={getContentValue(
                            blockKey,
                            locale,
                            "subtitle",
                          )}
                          className="min-h-28 bg-white/5 border-white/10 rounded-xl text-white font-bold"
                          required
                        />
                      </div>

                      <input
                        type="hidden"
                        name={`content_${blockKey}_${locale}_body`}
                        value={getContentValue(blockKey, locale, "body")}
                      />
                      <input
                        type="hidden"
                        name={`content_${blockKey}_${locale}_image_url`}
                        value={getContentValue(blockKey, locale, "image_url")}
                      />

                      {(blockKey === "home_hero" ||
                        blockKey === "partner_cta") && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">
                              {t("fields.cta_label")}
                            </Label>
                            <Input
                              name={`content_${blockKey}_${locale}_cta_label`}
                              defaultValue={getContentValue(
                                blockKey,
                                locale,
                                "cta_label",
                              )}
                              className="bg-white/5 border-white/10 h-12 rounded-xl text-white font-bold"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">
                              {t("fields.cta_link")}
                            </Label>
                            <Input
                              name={`content_${blockKey}_${locale}_cta_href`}
                              defaultValue={getContentValue(
                                blockKey,
                                locale,
                                "cta_href",
                              )}
                              className="bg-white/5 border-white/10 h-12 rounded-xl text-white font-bold"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* NAVIGATION SETTINGS */}
        <div className="lg:col-span-2 space-y-8 bg-[#0c0c0e] border border-white/5 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="h-10 w-10 rounded-xl bg-info/10 flex items-center justify-center text-info border border-info/20">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white">
                {t("navigation.title")}
              </h2>
              <p className="text-xs font-bold uppercase tracking-widest text-text-tertiary mt-1">
                {t("navigation.description")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
            {NAVIGATION_PLACEMENTS.map((placement) => (
              <section
                key={placement}
                className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 space-y-5"
              >
                <h3 className="font-display text-lg font-black uppercase tracking-tight text-white">
                  {placement === "public_navbar"
                    ? t("navigation.public_navbar")
                    : t("navigation.footer")}
                </h3>

                {PUBLIC_NAVIGATION_DEFINITIONS.map((item) => {
                  const row = getNavigationRow(placement, item.key);
                  const visible = row?.is_visible !== false;

                  return (
                    <div
                      key={`${placement}-${item.key}`}
                      className="rounded-2xl border border-white/5 bg-black/20 p-4 space-y-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-sm font-black uppercase tracking-tight text-white">
                            {item.labelEn}
                          </div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                            {item.href}
                          </div>
                        </div>
                        <Switch
                          key={`${placement}-${item.key}-${String(visible)}`}
                          name={`nav_${placement}_${item.key}_visible`}
                          defaultChecked={visible}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          name={`nav_${placement}_${item.key}_label_en`}
                          defaultValue={row?.label_en || item.labelEn}
                          className="bg-white/5 border-white/10 h-12 rounded-xl text-white font-bold"
                          aria-label={`${item.labelEn} ${t("navigation.english_label")}`}
                        />
                        <Input
                          name={`nav_${placement}_${item.key}_label_th`}
                          defaultValue={row?.label_th || item.labelTh}
                          className="bg-white/5 border-white/10 h-12 rounded-xl text-white font-bold"
                          aria-label={`${item.labelEn} ${t("navigation.thai_label")}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </section>
            ))}
          </div>
        </div>

        {/* MODULE SETTINGS */}
        <div className="lg:col-span-2 space-y-8 bg-[#0c0c0e] border border-white/5 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center text-success border border-success/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white">
                {t("modules.title")}
              </h2>
              <p className="text-xs font-bold uppercase tracking-widest text-text-tertiary mt-1">
                {t("modules.description")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
            {FEATURE_FLAG_KEYS.map((key) => (
              <div
                key={key}
                className="flex items-center justify-between gap-6 rounded-2xl border border-white/5 bg-white/[0.02] p-5"
              >
                <div className="space-y-1">
                  <Label className="text-sm font-black uppercase tracking-tight text-white">
                    {featureLabels[key].title}
                  </Label>
                  <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest leading-relaxed">
                    {featureLabels[key].description}
                  </p>
                </div>
                <Switch
                  key={`${key}-${String(featureFlags[key])}`}
                  name={`flag_${key}`}
                  defaultChecked={featureFlags[key]}
                />
              </div>
            ))}
          </div>
        </div>

        {/* SAVE */}
        <div className="space-y-10">
          <div className="bg-[#0c0c0e] border border-white/5 p-10 rounded-[3rem] shadow-xl space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center text-success border border-success/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white">
                {t("publish.title")}
              </h2>
            </div>
            <div className="space-y-6">
              <p className="text-xs font-bold text-text-secondary uppercase tracking-widest leading-relaxed">
                {t("publish.description")}
              </p>
              <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest leading-relaxed">
                {t("publish.warning")}
              </p>
            </div>
          </div>

          <SettingsSubmitButton
            disabled={!cmsSchemaReady}
            labels={{ saving: t("publish.saving"), save: t("publish.save") }}
          />
        </div>
      </form>
    </div>
  );
}
