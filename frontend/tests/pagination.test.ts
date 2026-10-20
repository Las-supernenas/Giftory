import { describe, expect, it } from "vitest";

import {
  clampPage,
  getPageItems,
  getTotalPages,
} from "../src/features/shared/pagination";

const items = Array.from({ length: 20 }, (_, index) => index + 1);

describe("getTotalPages", () => {
  it("rounds up to fit every item", () => {
    expect(getTotalPages(20, 9)).toBe(3);
    expect(getTotalPages(9, 9)).toBe(1);
  });

  it("returns at least one page", () => {
    expect(getTotalPages(0, 9)).toBe(1);
  });
});

describe("clampPage", () => {
  it("keeps the page inside the valid range", () => {
    expect(clampPage(3, 2)).toBe(2);
    expect(clampPage(0, 2)).toBe(1);
    expect(clampPage(2, 3)).toBe(2);
  });
});

describe("getPageItems", () => {
  it("returns the items of the requested page", () => {
    expect(getPageItems(items, 1, 9)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(getPageItems(items, 3, 9)).toEqual([19, 20]);
  });

  it("does not modify the original list", () => {
    const original = [...items];
    getPageItems(items, 2, 9);
    expect(items).toEqual(original);
  });
});
