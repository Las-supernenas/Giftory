import { useState, type ReactNode } from "react";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { Input } from "./Input";
import { INTEREST_LABELS } from "../types/person";
import { getInterestColorStyle } from "../interest-colors";
import { groupInterestsByCategory } from "../interest-categories";
import {
  EMPTY_GIFT_IDEA_FILTERS,
  hasActiveFilters,
  type GiftIdeaFilterValues,
} from "../gift-idea-filters";

type GiftIdeaFiltersProps = {
  filters: GiftIdeaFilterValues;
  onFiltersChange: (filters: GiftIdeaFilterValues) => void;
  // Interest keys present in the loaded ideas: the options of the interest filter
  availableInterests: string[];
  // All the interests from the API. The ones without ideas are shown disabled.
  // Empty (not loaded or failed): only availableInterests are shown
  allInterests: string[];
  //Number of ideas that match the filters
  resultCount: number;
  //The filtered list, rendered next to the filter panel
  children: ReactNode;
  // Optional content shown next to the search field (ex. the Library "Created by me" switch)
  searchAside?: ReactNode;
  // Optional message when there are no results (default: no matches for the filters)
  emptyMessage?: string;
  // Optional texts of the search field, so each page can describe what it searches
  searchLabel?: string;
  searchPlaceholder?: string;
  // Optional placement for pages that show filters above the result list
  layout?: "sidebar" | "top";
};

type ActiveFilterChip = {
  key: string;
  label: string;
  onRemove: () => void;
};

// Search on top, filter panel on the left (desktop) and collapsible above (mobile)
export function GiftIdeaFilters({
  filters,
  onFiltersChange,
  availableInterests,
  allInterests,
  resultCount,
  children,
  searchAside,
  emptyMessage,
  searchLabel = "Buscar ideas de regalo",
  searchPlaceholder = "Busca por nombre: taza, libro, viaje...",
  layout = "sidebar",
}: GiftIdeaFiltersProps) {
  // mobile only: the panel starts collapsed. On desktop is always visible
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [openInterestCategory, setOpenInterestCategory] = useState<string | null>(
    null,
  );

  const categories = groupInterestsByCategory(
    allInterests.length > 0 ? allInterests : availableInterests,
  );

  const panelFilterCount =
    filters.interests.length +
    (filters.minPrice.trim() ? 1 : 0) +
    (filters.maxPrice.trim() ? 1 : 0);
  const canClear = hasActiveFilters(filters);

  function updateFilters(changes: Partial<GiftIdeaFilterValues>) {
    onFiltersChange({ ...filters, ...changes });
  }

  function toggleInterest(interest: string) {
    updateFilters({
      interests: filters.interests.includes(interest)
        ? filters.interests.filter((item) => item !== interest)
        : [...filters.interests, interest],
    });
  }

  function clearFilters() {
    onFiltersChange(EMPTY_GIFT_IDEA_FILTERS);
  }

  // Active filters shown as removable chips above the results
  const activeChips: ActiveFilterChip[] = [
    ...(filters.search.trim()
      ? [
          {
            key: "search",
            label: `"${filters.search.trim()}"`,
            onRemove: () => updateFilters({ search: "" }),
          },
        ]
      : []),
    ...filters.interests.map((interest) => ({
      key: `interest-${interest}`,
      label: INTEREST_LABELS[interest] ?? interest,
      onRemove: () => toggleInterest(interest),
    })),
    ...(filters.minPrice.trim()
      ? [
          {
            key: "min-price",
            label: `Desde ${filters.minPrice} €`,
            onRemove: () => updateFilters({ minPrice: "" }),
          },
        ]
      : []),
    ...(filters.maxPrice.trim()
      ? [
          {
            key: "max-price",
            label: `Hasta ${filters.maxPrice} €`,
            onRemove: () => updateFilters({ maxPrice: "" }),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      {/* Search: always visible, also on mobile. searchAside sits next to it */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          {/* The label is visually hidden but still read by screen readers */}
          <label htmlFor="gift-filter-search" className="sr-only">
            {searchLabel}
          </label>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            id="gift-filter-search"
            type="search"
            placeholder={searchPlaceholder}
            value={filters.search}
            onChange={(event) => updateFilters({ search: event.target.value })}
            className="box-border block min-h-12 w-full rounded-2xl border border-solid border-primary/20 bg-surface py-3 pr-4 pl-12 text-base text-foreground shadow-sm placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </div>
        {searchAside}
      </div>

      {/* Mobile only: shows or hides the filter panel */}
      <Button
        variant="secondary"
        className="w-full md:hidden"
        aria-expanded={isPanelOpen}
        aria-controls="gift-filter-panel"
        onClick={() => setIsPanelOpen((isOpen) => !isOpen)}
      >
        {isPanelOpen ? "Ocultar filtros" : "Filtrar"}
        {panelFilterCount > 0 && ` (${panelFilterCount})`}
      </Button>

      <div
        className={
          layout === "top"
            ? "space-y-5"
            : "md:grid md:grid-cols-[15rem_minmax(0,1fr)] md:items-start md:gap-6"
        }
      >
        <aside
          id="gift-filter-panel"
          aria-label="Filtros"
          className={`${isPanelOpen ? "block" : "hidden"} ${layout === "top" ? "mb-0" : "mb-4"} rounded-2xl border border-solid border-foreground/10 bg-surface shadow-sm md:mb-0 md:block ${
            layout === "top"
              ? "space-y-2 p-2.5 md:grid md:grid-cols-[minmax(0,1fr)_20rem] md:items-start md:gap-2 md:space-y-0"
              : "space-y-4 p-4"
          }`}
        >
          <div
            className={`flex items-center justify-between ${layout === "top" ? "md:col-span-full" : ""}`}
          >
            <h2 className="m-0 text-base font-semibold text-primary">
              Filtrar
            </h2>
            {/* Always visible; disabled while there is nothing to clear */}
            <button
              type="button"
              onClick={clearFilters}
              disabled={!canClear}
              className={`min-h-11 rounded-lg border-0 text-sm text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed ${
                layout === "top"
                  ? "bg-accent-lavender/15 px-3 font-semibold transition-colors hover:bg-accent-lavender/25 disabled:opacity-50"
                  : "bg-transparent px-2 font-medium underline disabled:opacity-40"
              }`}
            >
              Limpiar
            </button>
          </div>

          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend
              className={`${layout === "top" ? "sr-only" : "mb-2 text-xs font-bold uppercase tracking-wider text-muted"} p-0`}
            >
              Intereses
            </legend>

            {layout === "top" ? (
              <details className="group relative">
                <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-xl border border-solid border-foreground/10 bg-surface px-3 py-2 text-sm font-medium text-primary hover:bg-accent-lavender/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
                  {filters.interests.length === 0
                    ? "Todas las temáticas"
                    : "Temáticas seleccionadas"}
                  {filters.interests.length > 0 && (
                    <span className="text-xs font-semibold text-muted">
                      · {filters.interests.length}
                    </span>
                  )}
                  <span
                    aria-hidden="true"
                    className="ml-auto inline-block transition-transform group-open:rotate-180"
                  >
                    ▾
                  </span>
                </summary>
                <div className="absolute top-full left-0 z-20 mt-2 max-h-52 w-full min-w-64 overflow-y-auto rounded-xl border border-solid border-primary/15 bg-surface p-4 shadow-md">
                  <div className="space-y-4">
                    {categories.map((category) => (
                      <section key={category.label}>
                        <h3 className="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                          {category.label}
                        </h3>
                        {category.interests.length === 0 ? (
                          <p className="m-0 text-sm text-muted">
                            Aún no hay ideas aquí.
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {category.interests.map((interest) => {
                              const isSelected =
                                filters.interests.includes(interest);
                              const isEmpty =
                                !availableInterests.includes(interest) &&
                                !isSelected;

                              return (
                                <button
                                  key={interest}
                                  type="button"
                                  aria-pressed={isSelected}
                                  aria-disabled={isEmpty}
                                  title={
                                    isEmpty
                                      ? "Aún no hay ideas con este interés"
                                      : undefined
                                  }
                                  onClick={() => {
                                    if (!isEmpty) {
                                      toggleInterest(interest);
                                    }
                                  }}
                                  className={`min-h-11 rounded-full border px-2.5 py-1 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                                    isEmpty
                                      ? "cursor-not-allowed border-dashed border-foreground/20 bg-surface text-muted"
                                      : isSelected
                                        ? `border-solid border-primary font-semibold ring-2 ring-primary/40 hover:brightness-90 ${getInterestColorStyle(interest)}`
                                        : "border-transparent bg-accent-lavender/15 text-foreground hover:border-primary/20 hover:bg-accent-lavender/25"
                                  }`}
                                >
                                  {INTEREST_LABELS[interest] ?? interest}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </section>
                    ))}
                  </div>
                </div>
              </details>
            ) : (
              <div className="space-y-2">
                {categories.map((category, index) => {
                  const selectedInCategory = category.interests.filter(
                    (interest) => filters.interests.includes(interest),
                  ).length;
                  const isCategoryOpen =
                    openInterestCategory === category.label;
                  const interestListId = `gift-interest-category-${index}`;

                  return (
                    <div
                      key={category.label}
                      className="rounded-xl border border-solid border-foreground/10"
                    >
                      <button
                        type="button"
                        aria-expanded={isCategoryOpen}
                        aria-controls={interestListId}
                        onClick={() =>
                          setOpenInterestCategory((currentCategory) =>
                            currentCategory === category.label
                              ? null
                              : category.label,
                          )
                        }
                        className={`flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-xl border-0 bg-transparent px-3 py-2 text-left text-sm font-medium leading-tight text-primary hover:bg-accent-lavender/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}
                      >
                        {category.label}
                        {selectedInCategory > 0 && (
                          <span className="rounded-full bg-accent-lavender/20 px-1.5 py-0.5 text-xs text-muted">
                            {selectedInCategory}
                          </span>
                        )}
                        <span
                          aria-hidden="true"
                          className={`ml-auto inline-block transition-transform ${isCategoryOpen ? "rotate-180" : ""}`}
                        >
                          ▾
                        </span>
                      </button>

                      <div
                        id={interestListId}
                        className={`${isCategoryOpen ? "flex" : "hidden"} max-h-36 flex-wrap gap-2 overflow-y-auto px-3 pb-3`}
                      >
                        {category.interests.length === 0 ? (
                          <p className="m-0 text-sm text-muted">
                            Aún no hay ideas aquí.
                          </p>
                        ) : (
                          category.interests.map((interest) => {
                            const isSelected =
                              filters.interests.includes(interest);
                            const isEmpty =
                              !availableInterests.includes(interest) &&
                              !isSelected;

                            return (
                              <button
                                key={interest}
                                type="button"
                                aria-pressed={isSelected}
                                aria-disabled={isEmpty}
                                title={
                                  isEmpty
                                    ? "Aún no hay ideas con este interés"
                                    : undefined
                                }
                                onClick={() => {
                                  if (!isEmpty) {
                                    toggleInterest(interest);
                                  }
                                }}
                                className={`min-h-11 rounded-full border px-3 py-1 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                                  isEmpty
                                    ? "cursor-not-allowed border-dashed border-foreground/20 bg-surface text-muted"
                                    : isSelected
                                      ? `border-solid border-primary ring-2 ring-primary/25 hover:brightness-90 ${getInterestColorStyle(interest)}`
                                      : "border-solid border-primary/30 bg-surface text-foreground hover:border-primary"
                                }`}
                              >
                                {INTEREST_LABELS[interest] ?? interest}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </fieldset>

          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend
              className={`${layout === "top" ? "sr-only" : "mb-2 text-xs font-bold uppercase tracking-wider text-muted"} p-0`}
            >
              Precio
            </legend>
            {layout === "top" ? (
              <div className="flex flex-col gap-2 md:flex-row">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <label
                    htmlFor="gift-filter-min-price"
                    className="shrink-0 text-sm font-medium text-foreground"
                  >
                    Mínimo (€)
                  </label>
                  <input
                    id="gift-filter-min-price"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={filters.minPrice}
                    onChange={(event) =>
                      updateFilters({ minPrice: event.target.value })
                    }
                    className="box-border min-h-11 min-w-0 flex-1 rounded-xl border border-solid border-muted bg-surface px-3 py-2.5 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  />
                </div>
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <label
                    htmlFor="gift-filter-max-price"
                    className="shrink-0 text-sm font-medium text-foreground"
                  >
                    Máximo (€)
                  </label>
                  <input
                    id="gift-filter-max-price"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={filters.maxPrice}
                    onChange={(event) =>
                      updateFilters({ maxPrice: event.target.value })
                    }
                    className="box-border min-h-11 min-w-0 flex-1 rounded-xl border border-solid border-muted bg-surface px-3 py-2.5 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="gift-filter-min-price"
                  label="Mínimo (€)"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={filters.minPrice}
                  onChange={(event) =>
                    updateFilters({ minPrice: event.target.value })
                  }
                />
                <Input
                  id="gift-filter-max-price"
                  label="Máximo (€)"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={filters.maxPrice}
                  onChange={(event) =>
                    updateFilters({ maxPrice: event.target.value })
                  }
                />
              </div>
            )}
          </fieldset>
        </aside>

        <div id="gift-idea-results" className="min-w-0">
          <div
            className={`flex flex-wrap items-center gap-2 ${layout === "top" ? "mb-4 mt-1" : "mb-3"}`}
          >
            <p
              className={`m-0 ${layout === "top" ? "text-base font-medium text-primary" : "text-sm text-muted"}`}
              aria-live="polite"
            >
              <strong
                className={
                  layout === "top"
                    ? "text-lg font-bold text-primary"
                    : "text-foreground"
                }
              >
                {resultCount}
              </strong>{" "}
              {resultCount === 1 ? "idea" : "ideas"}
            </p>
            {activeChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1 rounded-full border border-solid border-primary/20 bg-surface py-1 pr-1 pl-3 text-sm text-foreground"
              >
                {chip.label}
                <button
                  type="button"
                  aria-label={`Quitar filtro ${chip.label}`}
                  onClick={chip.onRemove}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border-0 bg-accent-lavender/20 text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {resultCount === 0 ? (
            <div className="space-y-3">
              <EmptyState
                message={
                  emptyMessage ?? "No encontramos ideas con estos filtros."
                }
              />
              {canClear && (
                <Button variant="accent" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              )}
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
