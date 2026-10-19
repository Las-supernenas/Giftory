// Client-side pagiantion helpers shared by Discovery and Library
// they work on the filtered list and never modify it

export const PAGE_SIZE = 9;

export function getTotalPages(itemCount: number, pageSize = PAGE_SIZE): number {
  //At least 1 page, even with no items
  return Math.max(1, Math.ceil(itemCount / pageSize));
}

//Keeps the pages inside the valid range (example after the list shrinks)
export function clampPage(page: number, totalPages: number): number {
  return Math.min(Math.max(page, 1), totalPages);
}

// The items of one page. Slice returns a new arrawy: the original list is not modified
export function getPageItems<T>(
  items: T[],
  page: number,
  pageSize = PAGE_SIZE,
): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

// Brings the results back into view after changing page
export function scrollToResults() {
  document
    .getElementById("gift-idea-results")
    ?.scrollIntoView?.({ behavior: "smooth", block: "start" });
}
