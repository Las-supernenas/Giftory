import { describe, expect, it } from "vitest";
import { normalizeText } from "../src/features/shared/normalize-text";

describe("normalizeText", () => {
  it("ignores case, accents and extra spaces", () => {
    expect(normalizeText("  MaRíA José ")).toBe("maria jose");
  });

  it("keeps an empty text empty", () => {
    expect(normalizeText("   ")).toBe("");
  });
});
