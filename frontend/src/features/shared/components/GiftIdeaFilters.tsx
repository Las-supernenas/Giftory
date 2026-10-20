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
};

// Search on top, filter panel on the left (desktop) and collapsible above (mobile)
export function GiftIdeaFilters({
  filters,
  onFiltersChange,
  availableInterests,
  allInterests,
  resultCount,
  children,
}: GiftIdeaFiltersProps) {
  // mobile only: the panel starts collapsed. On desktop is always visible
  const [isPanelOpen, setIsPanelOpen] = useState(false);

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

  return (
    <div className="space-y-4">
      {/* Search: always visible, also on mobile */}
      <Input
        id="gift-filter-search"
        label="Buscar por nombre"
        type="search"
        placeholder="Ej.: taza, libro, viaje..."
        value={filters.search}
        onChange={(event) => updateFilters({ search: event.target.value })}
      />

      {/* Mobile only: shows or hides the filter panel */}
      <Button
        variant="secondary"
        className="w-full md:hidden"
        aria-expanded={isPanelOpen}
        aria-controls="gift-filter-panel"
        onClick={() => setIsPanelOpen((isOpen) => !isOpen)}
      >
        {isPanelOpen ? "Ocultar filtros" : "Filtros"}
        {panelFilterCount > 0 && ` (${panelFilterCount})`}
      </Button>

      <div className="md:grid md:grid-cols-[15rem_minmax(0,1fr)] md:items-start md:gap-6">
        <aside
          id="gift-filter-panel"
          aria-label="Filtros"
          className={`${isPanelOpen ? "block" : "hidden"} mb-4 space-y-4 rounded-2xl border border-solid border-foreground/10 bg-surface p-4 shadow-sm md:mb-0 md:block`}
        >
          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className="mb-2 p-0 text-sm font-semibold text-primary">
              Intereses
            </legend>

            <div className="space-y-2">
              {categories.map((category) => {
                const selectedInCategory = category.interests.filter(
                  (interest) => filters.interests.includes(interest),
                ).length;

                return (
                  <details
                    key={category.label}
                    className="group rounded-xl border border-solid border-foreground/10"
                  >
                    <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-primary hover:bg-accent-lavender/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
                      {category.label}
                      {selectedInCategory > 0 && (
                        <span className="rounded-full bg-accent-lavender/30 px-2 py-0.5 text-xs">
                          {selectedInCategory}
                        </span>
                      )}
                      <span
                        aria-hidden="true"
                        className="ml-auto inline-block transition-transform group-open:rotate-180"
                      >
                        ▾
                      </span>
                    </summary>

                    {category.interests.length === 0 ? (
                      <p className="m-0 px-3 pb-3 text-sm text-muted">
                        Aún no hay ideas aquí.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2 px-3 pb-3">
                        {category.interests.map((interest) => {
                          const isSelected =
                            filters.interests.includes(interest);
                          // No idea has this interest yet. A selected one stays clickable so it can be removed
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
                                    ? `border-solid border-primary ring-2 ring-primary/25 ${getInterestColorStyle(interest)}`
                                    : "border-solid border-primary/30 bg-surface text-foreground hover:border-primary"
                              }`}
                            >
                              {INTEREST_LABELS[interest] ?? interest}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </details>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className="mb-2 p-0 text-sm font-semibold text-primary">
              Precio
            </legend>
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
          </fieldset>

          {canClear && (
            <Button variant="accent" className="w-full" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          )}
        </aside>

        <div id="gift-idea-results" className="min-w-0">
          <p className="mt-0 mb-3 text-sm text-muted" aria-live="polite">
            {resultCount === 1 ? "1 idea" : `${resultCount} ideas`}
          </p>

          {resultCount === 0 ? (
            <div className="space-y-3">
              <EmptyState message="No encontramos ideas con estos filtros." />
              <Button variant="accent" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
