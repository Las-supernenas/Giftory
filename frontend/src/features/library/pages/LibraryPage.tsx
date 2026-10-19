import { useEffect, useState } from "react";
import { INTEREST_LABELS } from "../../shared/types/person";
import { Card } from "../../shared/components/Card";
import { EmptyState } from "../../shared/components/EmptyState";
import { ErrorState } from "../../shared/components/ErrorState";
import { getInterestColorStyle } from "../../shared/interest-colors";
import { GiftIdeaFilters } from "../../shared/components/GiftIdeaFilters";
import {
  EMPTY_GIFT_IDEA_FILTERS,
  collectInterests,
  matchesGiftIdeaFilters,
  type GiftIdeaFilterValues,
} from "../../shared/gift-idea-filters";
import { getInterests } from "../../shared/services/interests-service";

type LibraryItemResponse = {
  id: number;
  giftIdea: {
    id: number;
    name: string;
    price: number;
    interests: string[];
  };
};

function LibraryPage() {
  const [libraryItems, setLibraryItems] = useState<LibraryItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters: kept apart from the loaded library items. The visible list is derived from both
  const [filters, setFilters] = useState<GiftIdeaFilterValues>(
    EMPTY_GIFT_IDEA_FILTERS,
  );

  // All the interests (official list from the API), to show the empty ones disabled in the filters.
  // If it fails, the filters fall back to the interests of the saved ideas
  const [allInterests, setAllInterests] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadAllInterests() {
      try {
        const interests = await getInterests();

        if (!cancelled) {
          setAllInterests(interests);
        }
      } catch {
        // No message: the filters keep working with the interests of the saved ideas
      }
    }

    void loadAllInterests();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    async function loadLibrary() {
      try {
        const response = await fetch("/api/library");
        if (!response.ok) {
          setErrorMessage("No se pudo cargar la biblioteca.");
          setIsLoading(false);
          return;
        }
        const items = (await response.json()) as LibraryItemResponse[];
        setLibraryItems(items);
        setIsLoading(false);
      } catch {
        setErrorMessage("No se pudo conectar con el servidor.");
        setIsLoading(false);
      }
    }
    void loadLibrary();
  }, []);

  async function removeLibraryItem(itemId: number) {
    try {
      const response = await fetch(`/api/library/${itemId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        setErrorMessage("No se pudo quitar la idea de la biblioteca.");
        return;
      }
      setErrorMessage(null);
      setLibraryItems((currentItems) =>
        currentItems.filter((item) => item.id !== itemId),
      );
    } catch {
      setErrorMessage("No se pudo conectar con el servidor.");
    }
  }

  // Only the users own library items are filtered. libraryItems itself is never changed
  const visibleItems = libraryItems.filter((item) =>
    matchesGiftIdeaFilters(item.giftIdea, filters),
  );
  const filterInterests = collectInterests(
    libraryItems.map((item) => item.giftIdea),
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="mb-8 font-serif text-3xl font-bold leading-tight tracking-tight text-primary sm:text-4xl">
        Biblioteca
      </h1>
      {isLoading && (
        <p role="status" className="text-sm text-muted">
          Cargando biblioteca...
        </p>
      )}
      {errorMessage && <ErrorState message={errorMessage} />}
      {!isLoading && !errorMessage && libraryItems.length === 0 && (
        <EmptyState message="Tu biblioteca está vacía." />
      )}
      {!isLoading && libraryItems.length > 0 && (
        <GiftIdeaFilters
          filters={filters}
          onFiltersChange={setFilters}
          availableInterests={filterInterests}
          allInterests={allInterests}
          resultCount={visibleItems.length}
        >
          <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {visibleItems.map((item) => (
              <li key={item.id}>
                <Card className="border-accent-gold/60!">
                  <h2 className="mt-0 mb-2 text-lg font-semibold text-primary">
                    {item.giftIdea.name}
                  </h2>
                  <p className="mt-0 mb-2 text-sm text-muted">
                    {item.giftIdea.price} €
                  </p>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {item.giftIdea.interests.map((interest) => (
                      <span
                        key={interest}
                        className={`rounded-full px-3 py-1 text-sm ${getInterestColorStyle(interest)}`}
                      >
                        {INTEREST_LABELS[interest] ?? interest}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="min-h-11 rounded-xl border border-error bg-surface px-4 py-2 font-medium text-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
                    onClick={() => void removeLibraryItem(item.id)}
                  >
                    Eliminar de la biblioteca
                  </button>
                </Card>
              </li>
            ))}
          </ul>
        </GiftIdeaFilters>
      )}
    </main>
  );
}

export default LibraryPage;
