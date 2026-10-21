import { describe, expect, it } from "vitest";
import { formatPrice } from "../src/features/shared/format-price";

// Intl puts a non-breaking space before "€": normalize spaces to compare
function normalizeSpaces(text: string): string {
  return text.replace(/\s/g, " ");
}

describe("formatPrice", () => {
  it("shows two decimals with a comma and the euro sign", () => {
    expect(normalizeSpaces(formatPrice(39))).toBe("39,00 €");
    expect(normalizeSpaces(formatPrice(18.5))).toBe("18,50 €");
  });
});
