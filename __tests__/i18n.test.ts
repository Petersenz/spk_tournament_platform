import { describe, it, expect } from "vitest";
import en from "../messages/en.json";
import th from "../messages/th.json";

describe("Internationalization (i18n)", () => {
  it("should have the same keys in English and Thai translations", () => {
    const enKeys = Object.keys(en).sort();
    const thKeys = Object.keys(th).sort();

    expect(enKeys).toEqual(thKeys);
  });

  it("should have the same nested keys in all sections", () => {
    Object.keys(en).forEach((section) => {
      // @ts-expect-error - Dynamic section access
      const enSectionKeys = Object.keys(en[section as keyof typeof en]).sort();
      // @ts-expect-error - Dynamic section access
      const thSectionKeys = Object.keys(th[section as keyof typeof th]).sort();

      expect(enSectionKeys, `Section "${section}" has mismatched keys`).toEqual(
        thSectionKeys,
      );
    });
  });
});
