import { normalizeText } from "./normalize-text";

// Filtering rules shared by Discovery and Library
// filtering is done in the browser on the lists that are already loaded
//The original lists are never modified: callers use Array.filter, which returns a new array

export type GiftIdeaFilterValues = {
  search: string;
  // backend interest keys. An idea matches if it has ANY of the selected interests
  interests: string[];
  //kept as typed in the inputs. Empty means "no limit"
  minPrice: string;
  maxPrice: string;
};

export const EMPTY_GIFT_IDEA_FILTERS: GiftIdeaFilterValues = {
  search: "",
  interests: [],
  minPrice: "",
  maxPrice: "",
};

// only the fields the filters need, so both GiftIdea and Library items giftIdea fit
type FilterableGiftIdea = {
  name: string;
  price: number;
  interests: string[];
};

// Empty or ivalid input means "no limit"
function parsePrice(value: string): number | null {
  if (value.trim() === "") {
    return null;
  }
  const price = Number(value);
  return Number.isFinite(price) ? price : null;
}
// An idea is visible only if it matches ALL the active filters
export function matchesGiftIdeaFilters(
  idea: FilterableGiftIdea,
  filters: GiftIdeaFilterValues,
): boolean {
  const search = normalizeText(filters.search);
  if (search && !normalizeText(idea.name).includes(search)) {
    return false;
  }

  if (
    filters.interests.length > 0 &&
    !filters.interests.some((interest) => idea.interests.includes(interest))
  ) {
    return false;
  }

  const minPrice = parsePrice(filters.minPrice);
  if (minPrice !== null && idea.price < minPrice) {
    return false;
  }

  const maxPrice = parsePrice(filters.maxPrice);
  if (maxPrice !== null && idea.price > maxPrice) {
    return false;
  }

  return true;
}

export function hasActiveFilters(filters: GiftIdeaFilterValues): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.interests.length > 0 ||
    filters.minPrice.trim() !== "" ||
    filters.maxPrice.trim() !== ""
  );
}

// Unique interests present in a list of ideas: the options of the interest filter
export function collectInterests(ideas: FilterableGiftIdea[]): string[] {
  return [...new Set(ideas.flatMap((idea) => idea.interests))];
}
