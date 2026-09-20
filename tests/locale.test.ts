import { describe, expect, it } from "vitest";
import { LOCALES, localeNames, rtlLocales, translate } from "../lib/locale";

describe("locale configuration", () => {
  it("contains exactly ten supported locales", () => {
    expect(LOCALES).toHaveLength(10);
    expect(Object.keys(localeNames)).toHaveLength(10);
  });
  it("keeps Arabic RTL", () => {
    expect(rtlLocales).toContain("ar");
  });
  it("falls back missing keys to English/key", () => {
    expect(translate("id", "missing-key")).toBe("missing-key");
    expect(translate("id", "store")).toBe("Store");
  });
});
