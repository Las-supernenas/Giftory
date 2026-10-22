import { useEffect, useState, type SubmitEvent } from "react";
import { INTEREST_LABELS, type Person } from "../../shared/types/person";
import { Card } from "../../shared/components/Card";
import { Button } from "../../shared/components/Button";
import { EmptyState } from "../../shared/components/EmptyState";
import { ErrorState } from "../../shared/components/ErrorState";
import { Input } from "../../shared/components/Input";
import {
  getInterestAccentColor,
  getInterestColorStyle,
} from "../../shared/interest-colors";
import { getInterests } from "../../shared/services/interests-service";
import {
  deleteGiftIdeaImage,
  updateGiftIdea,
  uploadGiftIdeaImage,
} from "../../../api/giftidea";
import { getPeople } from "../../people/services/people-service";
import { addSavedIdea } from "../../savedideas/services/savedideas-service";
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
import { formatPrice } from "../../shared/format-price";

type LibraryItemResponse = {
  id: number;
  canEditGiftIdea: boolean;
  giftIdea: {
    id: number;
    name: string;
    price: number;
    interests: string[];
    description: string | null;
    productUrl: string | null;
    imageFilename: string | null;
  };
};

// Which library ideas to show: all of them (own first) or only the ones the user created
type Ownership = "all" | "mine";

function LibraryPage() {
  const [libraryItems, setLibraryItems] = useState<LibraryItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [availableInterests, setAvailableInterests] = useState<string[]>([]);
  const [interestsError, setInterestsError] = useState("");
  const [editingGiftIdeaId, setEditingGiftIdeaId] = useState<number | null>(
    null,
  );
  const [savingGiftIdeaId, setSavingGiftIdeaId] = useState<number | null>(null);
  const [editError, setEditError] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoadingPeople, setIsLoadingPeople] = useState(true);
  const [peopleError, setPeopleError] = useState("");
  const [assigningGiftIdeaId, setAssigningGiftIdeaId] = useState<number | null>(
    null,
  );
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentError, setAssignmentError] = useState("");
  const [assignmentSuccess, setAssignmentSuccess] = useState("");

  const [filters, setFilters] = useState<GiftIdeaFilterValues>(
    EMPTY_GIFT_IDEA_FILTERS,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [ownership, setOwnership] = useState<Ownership>("all");

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

  useEffect(() => {
    async function loadPeople() {
      try {
        setPeople(await getPeople());
      } catch {
        setPeopleError("No se pudieron cargar tus personas.");
      } finally {
        setIsLoadingPeople(false);
      }
    }

    void loadPeople();
  }, []);

  useEffect(() => {
    async function loadInterests() {
      try {
        setAvailableInterests(await getInterests());
      } catch {
        setInterestsError("No se pudieron cargar las temáticas disponibles.");
      }
    }
    void loadInterests();
  }, []);

  async function handleSaveGiftIdea(
    giftIdeaId: number,
    event: SubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const selectedImage = formData.get("image");
    const imageFile =
      selectedImage instanceof File && selectedImage.size > 0
        ? selectedImage
        : null;

    if (
      imageFile &&
      (imageFile.size > 5 * 1024 * 1024 ||
        !["image/jpeg", "image/png", "image/webp"].includes(imageFile.type))
    ) {
      setEditError(
        "La imagen debe ser JPG, PNG o WebP y pesar como máximo 5 MB.",
      );
      return;
    }

    setSavingGiftIdeaId(giftIdeaId);
    setEditError("");
    try {
      const updated = await updateGiftIdea(giftIdeaId, {
        name: String(formData.get("name") ?? "").trim(),
        price: Number(formData.get("price")),
        interests: formData.getAll("interests").map(String),
        description: String(formData.get("description") ?? "").trim(),
        productUrl: String(formData.get("productUrl") ?? "").trim(),
      });
      setLibraryItems((current) =>
        current.map((item) =>
          item.giftIdea.id === giftIdeaId
            ? { ...item, giftIdea: updated }
            : item,
        ),
      );
      if (imageFile) {
        try {
          const { imageFilename } = await uploadGiftIdeaImage(
            giftIdeaId,
            imageFile,
          );
          setLibraryItems((current) =>
            current.map((item) =>
              item.giftIdea.id === giftIdeaId
                ? {
                    ...item,
                    giftIdea: { ...item.giftIdea, imageFilename },
                  }
                : item,
            ),
          );
        } catch {
          setEditError("La idea se guardó, pero no se pudo subir la imagen.");
          return;
        }
      } else if (formData.get("removeImage") === "on") {
        try {
          await deleteGiftIdeaImage(giftIdeaId);
          setLibraryItems((current) =>
            current.map((item) =>
              item.giftIdea.id === giftIdeaId
                ? {
                    ...item,
                    giftIdea: { ...item.giftIdea, imageFilename: null },
                  }
                : item,
            ),
          );
        } catch {
          setEditError("La idea se guardó, pero no se pudo quitar la imagen.");
          return;
        }
      }
      setEditingGiftIdeaId(null);
    } catch {
      setEditError("No se pudo actualizar la idea de regalo.");
    } finally {
      setSavingGiftIdeaId(null);
    }
  }

  async function handleAssign(giftIdeaId: number) {
    if (!selectedPersonId || isAssigning) return;

    setIsAssigning(true);
    setAssignmentError("");
    setAssignmentSuccess("");

    try {
      await addSavedIdea(Number(selectedPersonId), giftIdeaId);
      setAssignmentSuccess("Idea asignada correctamente.");
      setAssigningGiftIdeaId(null);
      setSelectedPersonId("");
    } catch (error) {
      setAssignmentError(
        error instanceof Error ? error.message : "No se pudo asignar la idea.",
      );
    } finally {
      setIsAssigning(false);
    }
  }

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

  // canEditGiftIdea is true when the user created the idea (returned by the API)
  const ownCount = libraryItems.filter((item) => item.canEditGiftIdea).length;

  // "Todas": the user's own ideas first, then the rest. "Creadas por mí": only them.
  // filter and [...].sort return new arrays: libraryItems itself is never changed
  const listedItems =
    ownership === "mine"
      ? libraryItems.filter((item) => item.canEditGiftIdea)
      : [...libraryItems].sort(
          (a, b) => Number(b.canEditGiftIdea) - Number(a.canEditGiftIdea),
        );

  // Only the user's own library items are filtered
  const visibleItems = listedItems.filter((item) =>
    matchesGiftIdeaFilters(item.giftIdea, filters),
  );
  const filterInterests = collectInterests(
    listedItems.map((item) => item.giftIdea),
  );

  const totalPages = getTotalPages(visibleItems.length);
  // If the list got shorter (e.g. after removing an idea), show the last page that still exists
  const page = clampPage(currentPage, totalPages);
  const pageItems = getPageItems(visibleItems, page);

  // A filter change shows the first page of the new results
  function handleFiltersChange(newFilters: GiftIdeaFilterValues) {
    setFilters(newFilters);
    setCurrentPage(1);
  }

  // Switching between "Todas" and "Creadas por mí" also shows the first page
  function handleOwnershipChange(newOwnership: Ownership) {
    setOwnership(newOwnership);
    setCurrentPage(1);
  }

  const ownershipOptions = [
    { value: "all", label: "Todas", count: libraryItems.length },
    { value: "mine", label: "Creadas por mí", count: ownCount },
  ] as const;

  function handlePageChange(newPage: number) {
    setCurrentPage(newPage);
    scrollToResults();
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <h1 className="mb-2 font-serif text-3xl font-bold leading-tight tracking-tight text-primary sm:text-4xl">
          Biblioteca
        </h1>
        <p className="m-0 text-muted">
          Las ideas que has guardado, listas para asignar a alguien especial.
        </p>
      </header>
      {isLoading && (
        <p role="status" className="text-sm text-muted">
          Cargando biblioteca...
        </p>
      )}
      {errorMessage && <ErrorState message={errorMessage} />}
      {assignmentError && <ErrorState message={assignmentError} />}
      {assignmentSuccess && (
        <p role="status" className="text-sm text-primary">
          {assignmentSuccess}
        </p>
      )}
      {!isLoading && !errorMessage && libraryItems.length === 0 && (
        <EmptyState message="Tu biblioteca está vacía." />
      )}
      {!isLoading && libraryItems.length > 0 && (
        <GiftIdeaFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          availableInterests={filterInterests}
          allInterests={availableInterests}
          resultCount={visibleItems.length}
          searchLabel="Buscar en tu biblioteca"
          searchPlaceholder="Buscar en tu biblioteca..."
          emptyMessage={
            ownership === "mine" && ownCount === 0
              ? "Todavía no has creado ninguna idea. Las que crees en Descubrir aparecerán aquí."
              : undefined
          }
          searchAside={
            <div
              role="group"
              aria-label="Mostrar ideas"
              className="inline-flex shrink-0 gap-1 self-start rounded-2xl border border-solid border-primary/20 bg-surface p-1 sm:self-auto"
            >
              {ownershipOptions.map((option) => {
                const isActive = ownership === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => handleOwnershipChange(option.value)}
                    className={`min-h-11 rounded-xl border-0 px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                      isActive
                        ? "bg-primary text-white"
                        : "bg-transparent text-foreground hover:bg-accent-lavender/15"
                    }`}
                  >
                    {option.label}{" "}
                    <span className={isActive ? "opacity-80" : "text-muted"}>
                      ({option.count})
                    </span>
                  </button>
                );
              })}
            </div>
          }
        >
          <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((item) => (
              <li key={item.id} className="min-w-0">
                <Card
                  className={`group box-border flex w-full min-w-0 flex-col border-accent-gold/30! bg-surface! shadow-sm shadow-primary/5 transition-[border-color,box-shadow] duration-200 hover:border-accent-gold/60! hover:shadow-md hover:shadow-primary/10 motion-reduce:transition-none ${editingGiftIdeaId === null ? "sm:h-full" : ""}`}
                >
                  {/* Badge row: always reserved (h-6) so the photos of a row start at the same height */}
                  <div className="mb-2 flex h-6 items-center">
                    {item.canEditGiftIdea && (
                      <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-accent-gold/30 bg-accent-gold/10 px-3 py-1 text-xs font-semibold text-primary">
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          className="h-3 w-3 text-accent-gold"
                        >
                          <path d="M8 1.25 9.7 6.3 14.75 8 9.7 9.7 8 14.75 6.3 9.7 1.25 8 6.3 6.3 8 1.25Z" />
                        </svg>
                        Creada por ti
                      </span>
                    )}
                  </div>
                  <div className="relative mx-auto mb-3 box-border aspect-video w-full min-w-0 overflow-hidden rounded-xl border border-accent-gold/20 bg-[#fbf8f1] p-3">
                    <div className="absolute inset-3 flex items-center justify-center">
                      {item.giftIdea.imageFilename ? (
                        <img
                          src={`/api/giftideas/images/${encodeURIComponent(item.giftIdea.imageFilename)}`}
                          alt={`Imagen de ${item.giftIdea.name}`}
                          loading="lazy"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-sm text-muted">
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            className="h-7 w-7 text-primary"
                          >
                            <rect
                              x="3.5"
                              y="4.5"
                              width="17"
                              height="15"
                              rx="2.5"
                            />
                            <circle
                              cx="9"
                              cy="10"
                              r="1.5"
                              className="text-accent-gold"
                            />
                            <path
                              d="m5 17 4.5-4 3 2.5 2.5-2 4 3.5"
                              className="text-accent-gold"
                            />
                          </svg>
                          <span>Sin imagen</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mb-1">
                    <h2 className="mt-0 mb-0 min-w-0 line-clamp-2 min-h-[2lh] break-words text-lg leading-tight font-bold text-primary">
                      {item.giftIdea.name}
                    </h2>
                  </div>
                  <p className="mt-0 mb-2 text-xl font-extrabold tracking-tight text-primary">
                    {formatPrice(item.giftIdea.price)}
                  </p>
                  {item.giftIdea.description && (
                    <p className="mb-2 line-clamp-2 break-words text-sm text-foreground">
                      {item.giftIdea.description}
                    </p>
                  )}
                  {item.giftIdea.productUrl && (
                    <a
                      href={item.giftIdea.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mb-2 flex min-h-11 sm:min-h-8 w-fit max-w-full items-center self-start gap-2 rounded-lg px-2 py-1 text-sm font-semibold text-primary transition-colors duration-150 hover:bg-accent-lavender/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      <span aria-hidden="true">🎁</span>
                      Dónde encontrarlo
                      <span aria-hidden="true" className="text-accent-gold">
                        ↗
                      </span>
                    </a>
                  )}
                  <div className="mb-3 flex flex-wrap gap-2">
                    {item.giftIdea.interests.slice(0, 2).map((interest) => (
                      <span
                        key={interest}
                        className={`rounded-full px-2.5 py-0.5 text-xs ring-1 ring-inset ring-primary/5 ${getInterestColorStyle(interest)}`}
                      >
                        {INTEREST_LABELS[interest] ?? interest}
                      </span>
                    ))}
                    {item.giftIdea.interests.length > 2 && (
                      <span
                        className="rounded-full bg-accent-lavender/20 px-2.5 py-0.5 text-xs text-primary ring-1 ring-inset ring-primary/5"
                        title={item.giftIdea.interests
                          .slice(2)
                          .map(
                            (interest) => INTEREST_LABELS[interest] ?? interest,
                          )
                          .join(", ")}
                      >
                        +{item.giftIdea.interests.length - 2}
                      </span>
                    )}
                  </div>
                  {item.canEditGiftIdea &&
                    editingGiftIdeaId === item.giftIdea.id && (
                      <form
                        className="mb-4 space-y-3 rounded-xl border border-accent-lavender/50 bg-surface p-3"
                        onSubmit={(event) =>
                          void handleSaveGiftIdea(item.giftIdea.id, event)
                        }
                      >
                        <Input
                          id={`library-idea-name-${item.id}`}
                          name="name"
                          label="Nombre de la idea"
                          defaultValue={item.giftIdea.name}
                          maxLength={100}
                          required
                        />
                        <Input
                          id={`library-idea-price-${item.id}`}
                          name="price"
                          label="Precio (€)"
                          type="number"
                          min="0"
                          step="0.01"
                          defaultValue={item.giftIdea.price}
                          required
                        />

                        <label
                          className="block text-sm text-primary"
                          htmlFor={`library-idea-description-${item.id}`}
                        >
                          Descripción pública
                        </label>
                        <textarea
                          id={`library-idea-description-${item.id}`}
                          name="description"
                          defaultValue={item.giftIdea.description ?? ""}
                          className="block w-full box-border rounded-xl border border-muted p-3"
                        />
                        <Input
                          id={`library-idea-product-url-${item.id}`}
                          name="productUrl"
                          label="Enlace del producto"
                          type="url"
                          defaultValue={item.giftIdea.productUrl ?? ""}
                        />

                        <div>
                          <label
                            htmlFor={`gift-image-${item.id}`}
                            className="mb-2 block text-sm font-medium text-foreground"
                          >
                            Imagen del regalo
                          </label>
                          <input
                            id={`gift-image-${item.id}`}
                            name="image"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="block w-full min-w-0 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-xl file:border-0 file:bg-accent-lavender file:px-4 file:py-2 file:font-medium file:text-foreground file:hover:brightness-90"
                          />
                        </div>

                        {item.giftIdea.imageFilename && (
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" name="removeImage" />
                            Quitar imagen actual
                          </label>
                        )}

                        <details className="rounded-xl border border-muted p-3">
                          <summary className="cursor-pointer font-medium text-primary">
                            Temáticas
                          </summary>
                          {interestsError && (
                            <ErrorState message={interestsError} />
                          )}
                          <div className="mt-3 flex flex-wrap gap-2">
                            {[
                              ...new Set([
                                ...availableInterests,
                                ...item.giftIdea.interests,
                              ]),
                            ].map((interest) => (
                              <label
                                key={interest}
                                className="flex items-center gap-2 text-sm"
                              >
                                <input
                                  type="checkbox"
                                  name="interests"
                                  value={interest}
                                  defaultChecked={item.giftIdea.interests.includes(
                                    interest,
                                  )}
                                  style={{
                                    accentColor:
                                      getInterestAccentColor(interest),
                                  }}
                                />
                                {INTEREST_LABELS[interest] ?? interest}
                              </label>
                            ))}
                          </div>
                        </details>
                        {editError && <ErrorState message={editError} />}
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={savingGiftIdeaId !== null}
                        >
                          {savingGiftIdeaId === item.giftIdea.id
                            ? "Guardando..."
                            : "Guardar cambios de la idea"}
                        </Button>
                      </form>
                    )}
                  <Button
                    type="button"
                    className="mt-auto mb-2 w-full"
                    onClick={() => {
                      setSelectedPersonId("");
                      setAssignmentError("");
                      setAssignmentSuccess("");
                      setAssigningGiftIdeaId((current) =>
                        current === item.giftIdea.id ? null : item.giftIdea.id,
                      );
                    }}
                  >
                    {assigningGiftIdeaId === item.giftIdea.id
                      ? "Cancelar asignación"
                      : "Asignar a persona"}
                  </Button>
                  {assigningGiftIdeaId === item.giftIdea.id && (
                    <div className="mb-3">
                      {isLoadingPeople && <p>Cargando personas...</p>}
                      {!isLoadingPeople && peopleError && (
                        <ErrorState message={peopleError} />
                      )}
                      {!isLoadingPeople &&
                        !peopleError &&
                        people.length === 0 && (
                          <p>Aún no tienes personas añadidas.</p>
                        )}
                      {!isLoadingPeople &&
                        !peopleError &&
                        people.length > 0 && (
                          <div className="grid gap-2">
                            <label className="block text-sm font-medium">
                              Persona
                              <select
                                className="mt-1 block w-full rounded-xl border border-muted bg-surface p-3"
                                value={selectedPersonId}
                                onChange={(event) =>
                                  setSelectedPersonId(event.target.value)
                                }
                              >
                                <option value="">Elige una persona</option>
                                {people.map((person) => (
                                  <option key={person.id} value={person.id}>
                                    {person.name}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <Button
                              type="button"
                              disabled={!selectedPersonId || isAssigning}
                              onClick={() =>
                                void handleAssign(item.giftIdea.id)
                              }
                            >
                              {isAssigning
                                ? "Asignando..."
                                : "Guardar asignación"}
                            </Button>
                          </div>
                        )}
                    </div>
                  )}
                  <div className="flex min-h-11 flex-nowrap items-center justify-between gap-1">
                    {item.canEditGiftIdea ? (
                      <button
                        type="button"
                        className="inline-flex min-h-11 min-w-0 items-center gap-1 rounded-xl border border-primary/10 bg-primary/5 px-2 text-xs font-medium text-primary hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        onClick={() => {
                          setEditError("");
                          setEditingGiftIdeaId((current) =>
                            current === item.giftIdea.id
                              ? null
                              : item.giftIdea.id,
                          );
                        }}
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4 shrink-0"
                        >
                          <path d="m15 5 4 4M4 20l4.5-1 10-10a2.12 2.12 0 0 0-3-3l-10 10L4 20Z" />
                        </svg>
                        {editingGiftIdeaId === item.giftIdea.id
                          ? "Cancelar edición"
                          : "Editar"}
                      </button>
                    ) : (
                      <span />
                    )}
                    <button
                      type="button"
                      className="inline-flex min-h-11 min-w-0 items-center gap-1 rounded-xl border border-error/15 bg-error/5 px-2 text-xs font-medium text-error hover:bg-error/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
                      onClick={() => void removeLibraryItem(item.id)}
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 shrink-0"
                      >
                        <path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14M10 11v5m4-5v5" />
                      </svg>
                      Quitar
                    </button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </GiftIdeaFilters>
      )}
    </main>
  );
}

export default LibraryPage;
