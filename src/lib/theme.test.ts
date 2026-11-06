import { afterEach, describe, expect, it } from "vitest";
import { applyThemeColor, applyXPostColor, getStoredXPostColor, storeXPostColor } from "./theme";

afterEach(() => {
  applyThemeColor(null);
  applyXPostColor(null);
  localStorage.clear();
});

describe("independent X colors", () => {
  it("keeps the chosen post color when changing the background", () => {
    applyXPostColor("#ff0000");
    applyThemeColor("#0000ff");
    expect(document.documentElement.style.getPropertyValue("--x-post-background")).toBe("0 100% 50%");
    expect(document.documentElement.style.getPropertyValue("--background")).toBe("240 100% 50%");
  });

  it("stores and resets the independent X post color", () => {
    storeXPostColor("#00ff00");
    expect(getStoredXPostColor()).toBe("#00ff00");
    storeXPostColor(null);
    expect(getStoredXPostColor()).toBeNull();
  });
});