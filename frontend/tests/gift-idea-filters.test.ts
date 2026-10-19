import { describe, expect, it } from "vitest";
import {
  EMPTY_GIFT_IDEA_FILTERS,
  collectInterests,
  hasActiveFilters,
  matchesGiftIdeaFilters,
  type GiftIdeaFilterValues,
} from "../src/features/shared/gift-idea-filters";

const mug = {
  name: "Taza de cerámica",
  price: 15,
  interests: ["COOKING", "HOME_AND_DECOR"],
};
const book = {
  name: "Libro de viajes",
  price: 25.5,
  interests: ["BOOKS_AND_READING", "TRAVEL"],
};
const ideas = [mug, book];

function filterIdeas(changes: Partial<GiftIdeaFilterValues>) {
  return ideas.filter((idea) =>
    matchesGiftIdeaFilters(idea, { ...EMPTY_GIFT_IDEA_FILTERS, ...changes }),
  );
}

describe("matchesGiftIdeaFilters", () => {
  it("keeps every idea when there are no filters", () => {
    expect(filterIdeas({})).toEqual(ideas);
  });

  it("searches by name ignoring case, accents and extra spaces", () => {
    expect(filterIdeas({ search: "  CERAMICA " })).toEqual([mug]);
  });

  it("matches ANY of the selected interests", () => {
    expect(filterIdeas({ interests: ["COOKING", "TRAVEL"] })).toEqual(ideas);
    expect(filterIdeas({ interests: ["TRAVEL"] })).toEqual([book]);
  });

  it("filters by minimum and maximum price, both included", () => {
    expect(filterIdeas({ minPrice: "15", maxPrice: "20" })).toEqual([mug]);
    expect(filterIdeas({ minPrice: "25.5" })).toEqual([book]);
  });

  it("ignores empty or invalid prices", () => {
    expect(filterIdeas({ minPrice: " ", maxPrice: "abc" })).toEqual(ideas);
  });

  it("requires an idea to match all the active filters", () => {
    expect(filterIdeas({ search: "taza", interests: ["TRAVEL"] })).toEqual([]);
  });

  it("does not modify the original list", () => {
    const original = [...ideas];
    filterIdeas({ search: "taza" });
    expect(ideas).toEqual(original);
  });
});

describe("collectInterests", () => {
  it("returns each interest only once", () => {
    expect(collectInterests([mug, { ...mug, name: "Otra taza" }])).toEqual([
      "COOKING",
      "HOME_AND_DECOR",
    ]);
  });
});

describe("hasActiveFilters", () => {
  it("is false with no filters and true with any filter", () => {
    expect(hasActiveFilters(EMPTY_GIFT_IDEA_FILTERS)).toBe(false);
    expect(
      hasActiveFilters({ ...EMPTY_GIFT_IDEA_FILTERS, maxPrice: "30" }),
    ).toBe(true);
  });
});
