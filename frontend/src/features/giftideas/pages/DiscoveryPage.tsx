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
import {
  addToLibrary,
  getLibraryItems,
} from "../../library/services/library-service";

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

  // Fetch interests only when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

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
  }, [isAuthenticated]);

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

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-2 text-3xl font-bold">Descubre ideas de regalo</h1>

      <p className="mb-8 text-gray-600">
        Encuentra inspiración para tu próximo regalo.
      </p>

      {/* Creation form — authenticated users only */}
      {isAuthenticated && (
        <section className="mb-10 rounded-lg border border-gray-200 p-5">
          <h2 className="mb-4 text-2xl font-semibold">
            Crear una idea de regalo
          </h2>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label htmlFor="gift-name" className="mb-1 block">
                Nombre
              </label>
              <input
                id="gift-name"
                type="text"
                maxLength={100}
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded border p-2"
              />
            </div>

            <div>
              <label htmlFor="gift-price" className="mb-1 block">
                Precio (€)
              </label>
              <input
                id="gift-price"
                type="number"
                min="0"
                step="0.01"
                required
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                className="w-full rounded border p-2"
              />
            </div>

            <fieldset>
              <legend className="mb-2 font-medium">Intereses (opcional)</legend>

              {interestsLoading ? (
                <p role="status">Cargando intereses...</p>
              ) : interestsError ? (
                <p role="alert" className="text-red-600">
                  {interestsError}
                </p>
              ) : interests.length === 0 ? (
                <p>No hay intereses disponibles.</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {interests.map((interest) => (
                    <label key={interest} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedInterests.includes(interest)}
                        onChange={() => toggleInterest(interest)}
                      />
                      {INTEREST_LABELS[interest] ?? interest}
                    </label>
                  ))}
                </div>
              )}
            </fieldset>

            {createError && (
              <p role="alert" className="text-red-600">
                {createError}
              </p>
            )}

            {createSuccess && (
              <p role="status" className="text-green-700">
                ¡Idea de regalo creada correctamente!
              </p>
            )}

            <button
              type="submit"
              disabled={creating}
              className="rounded bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
            >
              {creating ? "Creando..." : "Crear idea de regalo"}
            </button>
          </form>
        </section>
      )}

      {/* Public discovery list */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold">Ideas de regalo</h2>
        {/* Result of saving to the Library: shown above the list, never instead of it */}
        {saveMessage && (
          <p role="status" className="mb-4 text-green-700">
            {saveMessage}
          </p>
        )}
        {saveError && (
          <div className="mb-4">
            <ErrorState message={saveError} />
          </div>
        )}
        {loading ? (
          <p role="status">Cargando ideas de regalo...</p>
        ) : error ? (
          <p role="alert" className="text-red-600">
            {error}
          </p>
        ) : giftIdeas.length === 0 ? (
          <p>Todavía no hay ideas de regalo.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {giftIdeas.map((idea) => {
              const isSaved = savedGiftIdeaIds.includes(idea.id);

              return (
                <article
                  key={idea.id}
                  className="rounded-lg border border-gray-200 p-5 shadow-sm"
                >
                  <h3 className="mb-2 text-xl font-semibold">{idea.name}</h3>

                  <p className="mb-3 font-medium">{idea.price.toFixed(2)} €</p>

                  <div className="flex flex-wrap gap-2">
                    {idea.interests.map((interest) => (
                      <span
                        key={interest}
                        className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                      >
                        {INTEREST_LABELS[interest] ?? interest}
                      </span>
                    ))}
                  </div>

                  {/* Save to Library — authenticated users only */}
                  {isAuthenticated && (
                    <Button
                      variant="secondary"
                      className="mt-4 w-full sm:w-auto"
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
        )}
      </section>
    </main>
  );
}
