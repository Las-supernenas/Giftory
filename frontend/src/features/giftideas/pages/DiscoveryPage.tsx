import { useEffect, useState, type FormEvent } from "react";
import {
  getGiftIdeas,
  createGiftIdea,
  type GiftIdea,
  type Interest,
} from "../../../api/giftidea";
import { getInterests } from "../../shared/services/interests-service";
import { INTEREST_LABELS } from "../../shared/types/person";
import { Button } from "../../shared/components/Button";
import { ErrorState } from "../../shared/components/ErrorState";
import { EmptyState } from "../../shared/components/EmptyState";
import {
  addToLibrary,
  getLibraryItems,
} from "../../library/services/library-service";
import { Input } from "../../shared/components/Input";
import { getInterestColorStyle } from "../../shared/interest-colors";
import { GiftIdeaFilters } from "../../shared/components/GiftIdeaFilters";
import {
  EMPTY_GIFT_IDEA_FILTERS,
  collectInterests,
  matchesGiftIdeaFilters,
  type GiftIdeaFilterValues,
} from "../../shared/gift-idea-filters";
import { Pagination } from "../../shared/components/Pagination";
import {
  clampPage,
  getPageItems,
  getTotalPages,
  scrollToResults,
} from "../../shared/pagination";

type DiscoveryPageProps = {
  isAuthenticated: boolean;
};

export default function DiscoveryPage({ isAuthenticated }: DiscoveryPageProps) {
  const [giftIdeas, setGiftIdeas] = useState<GiftIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Creation form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([]);

  // Available interests from backend
  const [interests, setInterests] = useState<Interest[]>([]);
  const [interestsLoading, setInterestsLoading] = useState(false);
  const [interestsError, setInterestsError] = useState<string | null>(null);

  // Creation request state
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Library state: ids of the gift ideas already saved by the user.
  // Kept apart from `error` so a failed save never hides the Discovery List.
  const [savedGiftIdeaIds, setSavedGiftIdeaIds] = useState<number[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [savingGiftIdeaId, setSavingGiftIdeaId] = useState<number | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Filters: kept apart from the loaded ideas. The visible list is derived from both
  const [filters, setFilters] = useState<GiftIdeaFilterValues>(
    EMPTY_GIFT_IDEA_FILTERS,
  );

  // Pagination: only the page number is stored, the page items are derived
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch public GiftIdeas
  useEffect(() => {
    let cancelled = false;

    async function loadGiftIdeas() {
      try {
        const ideas = await getGiftIdeas();

        if (!cancelled) {
          setGiftIdeas(ideas);
        }
      } catch {
        if (!cancelled) {
          setError("No se pudieron cargar las ideas de regalo.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadGiftIdeas();

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch interests always: used by the creation form and by the filters
  useEffect(() => {
    let cancelled = false;

    async function loadInterests() {
      setInterestsLoading(true);
      setInterestsError(null);

      try {
        const availableInterests = await getInterests();

        if (!cancelled) {
          setInterests(availableInterests);
        }
      } catch {
        if (!cancelled) {
          setInterestsError("No se pudieron cargar los intereses.");
        }
      } finally {
        if (!cancelled) {
          setInterestsLoading(false);
        }
      }
    }

    void loadInterests();

    return () => {
      cancelled = true;
    };
  }, []);

  // fetch the users Library only when authenticated, to know which ideas are already saved
  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    async function loadLibrary() {
      setLibraryLoading(true);

      try {
        const items = await getLibraryItems();

        if (!cancelled) {
          setSavedGiftIdeaIds(items.map((item) => item.giftIdea.id));
        }
      } catch (err) {
        // the list stays usable: saving an already saved idea is handled by the 409
        if (!cancelled) {
          setSaveError(
            err instanceof Error
              ? err.message
              : "No se pudo cargar tu biblioteca.",
          );
        }
      } finally {
        if (!cancelled) {
          setLibraryLoading(false);
        }
      }
    }

    void loadLibrary();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  function toggleInterest(interest: Interest) {
    setSelectedInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isAuthenticated || creating) return;

    setCreateError(null);
    setCreateSuccess(false);

    const parsedPrice = Number(price);

    if (
      !name.trim() ||
      !price.trim() ||
      !Number.isFinite(parsedPrice) ||
      parsedPrice < 0
    ) {
      setCreateError("Introduce un nombre y un precio válidos.");
      return;
    }

    setCreating(true);

    try {
      const createdIdea = await createGiftIdea({
        name: name.trim(),
        price: parsedPrice,
        interests: selectedInterests,
      });

      // Add the new idea to the discovery list
      setGiftIdeas((current) => [createdIdea, ...current]);
      setError(null);

      // Reset the form
      setName("");
      setPrice("");
      setSelectedInterests([]);
      setCreateSuccess(true);
    } catch {
      setCreateError("No se pudo crear la idea de regalo.");
    } finally {
      setCreating(false);
    }
  }

  async function handleSaveToLibrary(idea: GiftIdea) {
    if (savingGiftIdeaId !== null) return;

    //Clear the previous result so an old error never stays after a new attempt
    setSaveMessage(null);
    setSaveError(null);
    setSavingGiftIdeaId(idea.id);

    try {
      const result = await addToLibrary(idea.id);

      setSavedGiftIdeaIds((current) =>
        current.includes(idea.id) ? current : [...current, idea.id],
      );
      setSaveMessage(
        result === "added"
          ? `«${idea.name}» se ha guardado en tu biblioteca.`
          : `«${idea.name}» ya estaba en tu biblioteca.`,
      );
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar la idea en tu biblioteca.",
      );
    } finally {
      setSavingGiftIdeaId(null);
    }
  }

  // Recalculated on every render: giftIdeas itself is never changed
  const visibleIdeas = giftIdeas.filter((idea) =>
    matchesGiftIdeaFilters(idea, filters),
  );
  const filterInterests = collectInterests(giftIdeas);

  const totalPages = getTotalPages(visibleIdeas.length);
  // If the list got shorter, show the last page that still exists
  const page = clampPage(currentPage, totalPages);
  const pageIdeas = getPageItems(visibleIdeas, page);

  // A filter change shows the first page of the new results
  function handleFiltersChange(newFilters: GiftIdeaFilterValues) {
    setFilters(newFilters);
    setCurrentPage(1);
  }

  function handlePageChange(newPage: number) {
    setCurrentPage(newPage);
    scrollToResults();
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="mb-2 font-serif text-3xl font-bold leading-tight tracking-tight text-primary sm:text-4xl">
        Descubre ideas de regalo
      </h1>

      <p className="mb-8 text-muted">
        Encuentra inspiración para tu próximo regalo.
      </p>

      {/* Creation form — authenticated users only */}
      {isAuthenticated && (
        <section className="mb-10 rounded-2xl border border-solid border-foreground/10 bg-surface p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-primary">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-6 shrink-0 text-accent-dusty-pink"
            >
              <path d="M3 10h18v3H3zM5 13v8h14v-8M12 10v11M12 10H8.5a2.5 2.5 0 1 1 2.5-2.5V10M12 10h3.5A2.5 2.5 0 1 0 13 7.5V10" />
            </svg>
            Crear una idea de regalo
          </h2>

          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              id="gift-name"
              label="Nombre del regalo"
              type="text"
              maxLength={100}
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />

            <Input
              id="gift-price"
              label="Precio (€)"
              type="number"
              min="0"
              step="0.01"
              required
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />

            <fieldset className="min-w-0 border-0 p-0">
              <legend className="sr-only">Intereses (opcional)</legend>

              {interestsLoading ? (
                <p role="status" className="text-sm text-muted">
                  Cargando intereses...
                </p>
              ) : interestsError ? (
                <ErrorState message={interestsError} />
              ) : interests.length === 0 ? (
                <EmptyState message="No hay intereses disponibles." />
              ) : (
                <details className="group rounded-xl border border-solid border-foreground/10 bg-surface p-3">
                  <summary className="flex cursor-pointer list-none items-center rounded-lg bg-accent-lavender/15 px-3 py-2 font-medium text-primary hover:bg-accent-lavender/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
                    Elige temática (opcional)
                    {selectedInterests.length > 0 && (
                      <span className="ml-2 rounded-full bg-surface px-2 py-0.5 text-xs text-primary">
                        {selectedInterests.length}
                      </span>
                    )}
                    <span
                      aria-hidden="true"
                      className="ml-auto inline-block transition-transform group-open:rotate-180"
                    >
                      ▾
                    </span>
                  </summary>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {interests.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        aria-pressed={selectedInterests.includes(interest)}
                        onClick={() => toggleInterest(interest)}
                        className={`min-h-11 rounded-full border px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                          selectedInterests.includes(interest)
                            ? `border-primary ring-2 ring-primary/25 ${getInterestColorStyle(interest)}`
                            : "border-primary/30 bg-surface text-foreground hover:border-primary"
                        }`}
                      >
                        {INTEREST_LABELS[interest] ?? interest}
                      </button>
                    ))}
                  </div>
                </details>
              )}
            </fieldset>

            {createError && <ErrorState message={createError} />}

            {createSuccess && (
              <p
                role="status"
                className="rounded-xl border-l-4 border-success bg-surface px-4 py-3 text-sm text-foreground"
              >
                ¡Idea de regalo creada correctamente!
              </p>
            )}

            <Button type="submit" disabled={creating}>
              {creating ? "Creando..." : "Crear idea de regalo"}
            </Button>
          </form>
        </section>
      )}

      {/* Public discovery list */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-primary">
          Ideas de regalo
        </h2>
        {/* Result of saving to the Library: shown above the list, never instead of it */}
        {saveMessage && (
          <p
            role="status"
            className="mb-4 rounded-xl border-l-4 border-success bg-surface px-4 py-3 text-sm text-foreground"
          >
            {saveMessage}
          </p>
        )}
        {saveError && (
          <div className="mb-4">
            <ErrorState message={saveError} />
          </div>
        )}
        {loading ? (
          <p role="status" className="text-sm text-muted">
            Cargando ideas de regalo...
          </p>
        ) : error ? (
          <ErrorState message={error} />
        ) : giftIdeas.length === 0 ? (
          <EmptyState message="Todavía no hay ideas de regalo." />
        ) : (
          <GiftIdeaFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            availableInterests={filterInterests}
            allInterests={interests}
            resultCount={visibleIdeas.length}
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pageIdeas.map((idea) => {
                const isSaved = savedGiftIdeaIds.includes(idea.id);

                return (
                  <article
                    key={idea.id}
                    className="rounded-2xl border border-solid border-accent-gold/60 bg-surface p-5 shadow-sm flex flex-col"
                  >
                    <h3 className="mb-2 text-xl font-semibold text-primary">
                      {idea.name}
                    </h3>

                    <p className="mb-3 font-medium text-muted">
                      {idea.price.toFixed(2)} €
                    </p>

                    <div className="flex flex-wrap gap-2 pb-4">
                      {idea.interests.map((interest) => (
                        <span
                          key={interest}
                          className={`rounded-full px-3 py-1 text-sm ${getInterestColorStyle(interest)}`}
                        >
                          {INTEREST_LABELS[interest] ?? interest}
                        </span>
                      ))}
                    </div>

                    {/* Save to Library — authenticated users only */}
                    {isAuthenticated && (
                      <Button
                        variant="secondary"
                        className="mt-auto w-full sm:w-auto"
                        disabled={
                          libraryLoading || savingGiftIdeaId !== null || isSaved
                        }
                        onClick={() => void handleSaveToLibrary(idea)}
                      >
                        {savingGiftIdeaId === idea.id
                          ? "Guardando..."
                          : isSaved
                            ? "En tu biblioteca"
                            : "Guardar en biblioteca"}
                      </Button>
                    )}
                  </article>
                );
              })}
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </GiftIdeaFilters>
        )}
      </section>
    </main>
  );
}
