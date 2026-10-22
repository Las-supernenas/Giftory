import type { SavedIdea } from "../types/saved-idea";
import {
  addSavedIdea,
  deleteSavedIdea,
  getSavedIdeas,
  updateSavedIdeaPrivateNote,
} from "../services/savedideas-service";
import { LoadingState } from "../../shared/components/LoadingState";
import { ErrorState } from "../../shared/components/ErrorState";
import { EmptyState } from "../../shared/components/EmptyState";
import { Card } from "../../shared/components/Card";
import { Button } from "../../shared/components/Button";
import { useEffect, useState, type SubmitEvent } from "react";
import {
  deleteGiftIdeaImage,
  updateGiftIdea,
  uploadGiftIdeaImage,
  type GiftIdea,
} from "../../../api/giftidea";
import { getLibraryItems } from "../../library/services/library-service";
import { Input } from "../../shared/components/Input";
import { INTEREST_LABELS } from "../../shared/types/person";
import {
  getInterestAccentColor,
  getInterestColorStyle,
} from "../../shared/interest-colors";
import { formatPrice } from "../../shared/format-price";

type SavedIdeasSectionProps = {
  personId: number;
  personName: string;
  availableInterests: string[];
  savedIdeasVersion?: number;
  onSavedIdeasChanged?: () => void;
  onOpenRecommendations?: () => void;
};

export function SavedIdeasSection({
  personId,
  personName,
  availableInterests,
  savedIdeasVersion = 0,
  onSavedIdeasChanged,
  onOpenRecommendations,
}: SavedIdeasSectionProps) {
  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [savingNoteId, setSavingNoteId] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");
  const [giftIdeaEditError, setGiftIdeaEditError] = useState("");
  const [giftIdeas, setGiftIdeas] = useState<GiftIdea[]>([]);
  const [isLoadingGiftIdeas, setIsLoadingGiftIdeas] = useState(true);
  const [giftIdeasError, setGiftIdeasError] = useState("");
  const [selectedGiftIdeaId, setSelectedGiftIdeaId] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingGiftIdeaId, setEditingGiftIdeaId] = useState<number | null>(
    null,
  );
  const [savingGiftIdeaId, setSavingGiftIdeaId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    async function loadSavedIdeas() {
      setIsLoading(true);
      try {
        const data = await getSavedIdeas(personId);
        if (active) {
          setSavedIdeas(data);
          setLoadError("");
        }
      } catch {
        if (active) setLoadError("No se pudieron cargar las ideas guardadas.");
      } finally {
        if (active) setIsLoading(false);
      }
    }
    void loadSavedIdeas();
    return () => {
      active = false;
    };
  }, [personId, savedIdeasVersion]);

  useEffect(() => {
    async function loadGiftIdeas() {
      try {
        const items = await getLibraryItems();
        setGiftIdeas(items.map((item) => item.giftIdea));
      } catch {
        setGiftIdeasError("No se pudo cargar tu biblioteca.");
      } finally {
        setIsLoadingGiftIdeas(false);
      }
    }
    void loadGiftIdeas();
  }, []);

  async function handleDelete(savedIdeaId: number) {
    setDeletingId(savedIdeaId);
    setActionError("");

    try {
      await deleteSavedIdea(personId, savedIdeaId);
      setSavedIdeas((current) =>
        current.filter((savedIdea) => savedIdea.id !== savedIdeaId),
      );
      onSavedIdeasChanged?.();
    } catch {
      setActionError("No se pudo quitar la idea guardada.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleAdd() {
    if (!selectedGiftIdeaId || isAdding) return;

    setIsAdding(true);
    setActionError("");

    try {
      const created = await addSavedIdea(personId, Number(selectedGiftIdeaId));
      setSavedIdeas((current) => [...current, created]);
      setSelectedGiftIdeaId("");
      setLoadError("");
      onSavedIdeasChanged?.();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "No se pudo guardar la idea.",
      );
    } finally {
      setIsAdding(false);
    }
  }

  async function handleSaveNote(
    savedIdeaId: number,
    event: SubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const privateNote =
      String(
        new FormData(event.currentTarget).get("privateNote") ?? "",
      ).trim() || null;
    setSavingNoteId(savedIdeaId);
    setActionError("");
    try {
      const updated = await updateSavedIdeaPrivateNote(
        personId,
        savedIdeaId,
        privateNote,
      );

      setSavedIdeas((current) =>
        current.map((idea) => (idea.id === savedIdeaId ? updated : idea)),
      );
    } catch {
      setActionError("No se pudo guardar la nota.");
    } finally {
      setSavingNoteId(null);
    }
  }

  async function handleSaveGiftIdea(
    giftIdeaId: number,
    event: SubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const price = Number(formData.get("price"));
    const interests = formData.getAll("interests").map(String);
    const description = String(formData.get("description") ?? "").trim();
    const productUrl = String(formData.get("productUrl") ?? "").trim();
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
      setGiftIdeaEditError(
        "La imagen debe ser JPG, PNG o WebP y pesar como máximo 5 MB.",
      );
      return;
    }

    setSavingGiftIdeaId(giftIdeaId);
    setGiftIdeaEditError("");

    try {
      const updated = await updateGiftIdea(giftIdeaId, {
        name,
        price,
        interests,
        description,
        productUrl,
      });

      setSavedIdeas((current) =>
        current.map((item) =>
          item.giftIdea.id === giftIdeaId
            ? { ...item, giftIdea: updated }
            : item,
        ),
      );
      setGiftIdeas((current) =>
        current.map((idea) => (idea.id === giftIdeaId ? updated : idea)),
      );

      if (imageFile) {
        try {
          const { imageFilename } = await uploadGiftIdeaImage(
            giftIdeaId,
            imageFile,
          );
          setSavedIdeas((current) =>
            current.map((item) =>
              item.giftIdea.id === giftIdeaId
                ? {
                    ...item,
                    giftIdea: { ...item.giftIdea, imageFilename },
                  }
                : item,
            ),
          );
          setGiftIdeas((current) =>
            current.map((idea) =>
              idea.id === giftIdeaId ? { ...idea, imageFilename } : idea,
            ),
          );
        } catch (error) {
          setGiftIdeaEditError(
            `La idea se guardó, pero la imagen no se subió: ${error instanceof Error ? error.message : "Inténtalo de nuevo."}`,
          );
          return;
        }
      } else if (formData.get("removeImage") === "on") {
        try {
          await deleteGiftIdeaImage(giftIdeaId);
          setSavedIdeas((current) =>
            current.map((item) =>
              item.giftIdea.id === giftIdeaId
                ? {
                    ...item,
                    giftIdea: { ...item.giftIdea, imageFilename: null },
                  }
                : item,
            ),
          );
          setGiftIdeas((current) =>
            current.map((idea) =>
              idea.id === giftIdeaId ? { ...idea, imageFilename: null } : idea,
            ),
          );
        } catch {
          setGiftIdeaEditError(
            "La idea se guardó, pero no se pudo quitar la imagen.",
          );
          return;
        }
      }

      setEditingGiftIdeaId(null);
    } catch {
      setGiftIdeaEditError("No se pudo actualizar la idea de regalo.");
    } finally {
      setSavingGiftIdeaId(null);
    }
  }

  return (
    <section className="space-y-4 border-t border-primary/10 pt-5">
      <div className="grid gap-y-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-x-8">
        <h2 className="m-0 font-serif text-lg font-semibold text-primary sm:text-xl">
          Ideas guardadas de {personName}
        </h2>
        {onOpenRecommendations && (
          <div className="min-w-0 md:col-start-1 md:row-start-2 md:mt-1">
            <p className="m-0 text-base font-semibold text-primary sm:text-lg">
              <span aria-hidden="true" className="mr-1.5 text-accent-gold">
                ✦
              </span>
              ¿No sabes qué regalar?
            </p>
            <p className="mb-0 mt-1 text-sm text-muted">
              Gifty te ayuda a encontrar ideas pensadas para {personName},
              según sus gustos.
            </p>
          </div>
        )}
        {onOpenRecommendations && (
          <Button
            type="button"
            className="w-full shrink-0 gap-2 shadow-md shadow-primary/15 transition-transform hover:-translate-y-0.5 md:col-start-2 md:row-start-2 md:mt-1 md:w-auto"
            onClick={onOpenRecommendations}
          >
            <span aria-hidden="true">✨</span>
            Pedir recomendación a Gifty
          </Button>
        )}
      </div>
      {isLoadingGiftIdeas && (
        <p role="status" className="text-sm text-muted">
          Cargando ideas de tu biblioteca...
        </p>
      )}
      {!isLoadingGiftIdeas && giftIdeasError && (
        <ErrorState message={giftIdeasError} />
      )}
      {!isLoadingGiftIdeas && !giftIdeasError && giftIdeas.length === 0 && (
        <EmptyState message="Tu biblioteca está vacía. Guarda una idea desde Descubrir para poder asignarla." />
      )}
      {!isLoadingGiftIdeas && !giftIdeasError && giftIdeas.length > 0 && (
        <Card className="grid gap-3">
          <label className="block text-sm font-medium text-foreground">
            Idea de tu biblioteca
            <select
              className="mt-1 block min-h-11 w-full rounded-xl border border-solid border-muted bg-surface px-3 py-2.5 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              value={selectedGiftIdeaId}
              onChange={(event) => setSelectedGiftIdeaId(event.target.value)}
            >
              <option value="">Elige una idea de tu biblioteca</option>
              {giftIdeas.map((idea) => (
                <option key={idea.id} value={idea.id}>
                  {idea.name}
                </option>
              ))}
            </select>
          </label>
          <Button
            className="w-full sm:w-fit"
            disabled={
              !selectedGiftIdeaId ||
              isAdding ||
              isLoading ||
              deletingId !== null
            }
            onClick={() => void handleAdd()}
          >
            {isAdding ? "Guardando..." : "Guardar idea"}
          </Button>
        </Card>
      )}
      {isLoading && <LoadingState />}
      {!isLoading && loadError && <ErrorState message={loadError} />}
      {!isLoading && actionError && <ErrorState message={actionError} />}
      {!isLoading && !loadError && savedIdeas.length === 0 && (
        <EmptyState message="Esta persona todavía no tiene ideas guardadas." />
      )}
      {!isLoading && !loadError && savedIdeas.length > 0 && (
        <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {savedIdeas.map((savedIdea) => (
            <li key={savedIdea.id} className="min-w-0">
              <Card className="group box-border flex h-full w-full min-w-0 flex-col border-accent-gold/30! bg-surface! shadow-sm shadow-primary/5 transition-[border-color,box-shadow] duration-200 hover:border-accent-gold/60! hover:shadow-md hover:shadow-primary/10 motion-reduce:transition-none">
                {/* Badge row: always reserved (h-6) so the photos of a row start at the same height */}
                <div className="mb-2 flex h-6 items-center">
                  {savedIdea.canEditGiftIdea && (
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
                    {savedIdea.giftIdea.imageFilename ? (
                      <img
                        src={`/api/giftideas/images/${encodeURIComponent(savedIdea.giftIdea.imageFilename)}`}
                        alt={`Imagen de ${savedIdea.giftIdea.name}`}
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
                  <h3 className="m-0 line-clamp-2 min-h-[2lh] break-words text-lg leading-tight font-bold text-primary">
                    {savedIdea.giftIdea.name}
                  </h3>
                </div>
                <p className="mt-0 mb-2 text-xl font-extrabold tracking-tight text-primary">
                  {formatPrice(savedIdea.giftIdea.price)}
                </p>
                {savedIdea.giftIdea.description && (
                  <p className="mb-2 line-clamp-2 whitespace-pre-wrap break-words text-sm text-foreground">
                    {savedIdea.giftIdea.description}
                  </p>
                )}
                {savedIdea.giftIdea.productUrl && (
                  <a
                    href={savedIdea.giftIdea.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-2 flex min-h-11 sm:min-h-8 w-fit max-w-full items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold text-primary transition-colors duration-150 hover:bg-accent-lavender/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <span aria-hidden="true">🎁</span>
                    Dónde encontrarlo
                    <span aria-hidden="true" className="text-accent-gold">
                      ↗
                    </span>
                  </a>
                )}
                <div className="mb-3 flex flex-wrap gap-2">
                  {savedIdea.giftIdea.interests.slice(0, 2).map((interest) => (
                    <span
                      key={interest}
                      className={`rounded-full px-2.5 py-0.5 text-xs ring-1 ring-inset ring-primary/5 ${getInterestColorStyle(interest)}`}
                    >
                      {INTEREST_LABELS[interest] ?? interest}
                    </span>
                  ))}
                  {savedIdea.giftIdea.interests.length > 2 && (
                    <span
                      className="rounded-full bg-accent-lavender/20 px-2.5 py-0.5 text-xs text-primary ring-1 ring-inset ring-primary/5"
                      title={savedIdea.giftIdea.interests
                        .slice(2)
                        .map(
                          (interest) => INTEREST_LABELS[interest] ?? interest,
                        )
                        .join(", ")}
                    >
                      +{savedIdea.giftIdea.interests.length - 2}
                    </span>
                  )}
                </div>
                {editingGiftIdeaId === savedIdea.giftIdea.id && (
                  <form
                    className="mb-4 space-y-3 rounded-xl border border-accent-lavender/50 bg-surface p-3"
                    onSubmit={(event) =>
                      void handleSaveGiftIdea(savedIdea.giftIdea.id, event)
                    }
                  >
                    <Input
                      id={`idea-name-${savedIdea.id}`}
                      name="name"
                      label="Nombre de la idea"
                      defaultValue={savedIdea.giftIdea.name}
                      maxLength={100}
                      required
                    />
                    <Input
                      id={`idea-price-${savedIdea.id}`}
                      name="price"
                      label="Precio (€)"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={savedIdea.giftIdea.price}
                      required
                    />

                    <label
                      className="block text-sm text-primary"
                      htmlFor={`idea-description-${savedIdea.id}`}
                    >
                      Descripción pública
                    </label>
                    <textarea
                      id={`idea-description-${savedIdea.id}`}
                      name="description"
                      defaultValue={savedIdea.giftIdea.description ?? ""}
                      className="block w-full box-border rounded-xl border border-muted p-3"
                    />
                    <Input
                      id={`idea-product-url-${savedIdea.id}`}
                      name="productUrl"
                      label="Enlace del producto"
                      type="url"
                      defaultValue={savedIdea.giftIdea.productUrl ?? ""}
                    />

                    <div>
                      <label
                        htmlFor={`idea-image-${savedIdea.id}`}
                        className="mb-2 block text-sm font-medium text-foreground"
                      >
                        Imagen del regalo
                      </label>
                      <input
                        id={`idea-image-${savedIdea.id}`}
                        name="image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="block w-full min-w-0 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-xl file:border-0 file:bg-accent-lavender file:px-4 file:py-2 file:font-medium file:text-foreground file:hover:brightness-90"
                      />
                    </div>

                    {savedIdea.giftIdea.imageFilename && (
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" name="removeImage" />
                        Quitar imagen actual
                      </label>
                    )}

                    <details className="rounded-xl border border-muted p-3">
                      <summary className="cursor-pointer font-medium text-primary">
                        Temáticas
                      </summary>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {[
                          ...new Set([
                            ...availableInterests,
                            ...savedIdea.giftIdea.interests,
                          ]),
                        ].map((interest) => (
                          <label
                            key={interest}
                            className="flex items-center gap-2 text-sm"
                          >
                            <input
                              style={{
                                accentColor: getInterestAccentColor(interest),
                              }}
                              type="checkbox"
                              name="interests"
                              value={interest}
                              defaultChecked={savedIdea.giftIdea.interests.includes(
                                interest,
                              )}
                            />
                            {INTEREST_LABELS[interest] ?? interest}
                          </label>
                        ))}
                      </div>
                    </details>

                    {giftIdeaEditError && (
                      <ErrorState message={giftIdeaEditError} />
                    )}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={savingGiftIdeaId !== null}
                    >
                      {savingGiftIdeaId === savedIdea.giftIdea.id
                        ? "Guardando..."
                        : "Guardar cambios de la idea"}
                    </Button>
                  </form>
                )}
                <div className="mt-auto">
                  <form
                    className="space-y-3"
                    onSubmit={(event) =>
                      void handleSaveNote(savedIdea.id, event)
                    }
                  >
                    <label className="block text-sm font-medium text-foreground">
                      Nota privada
                      <textarea
                        name="privateNote"
                        defaultValue={savedIdea.privateNote ?? ""}
                        className="mt-1 block min-h-24 w-full box-border rounded-xl border border-solid border-accent-gold/70 bg-accent-gold/10 px-3 py-2.5 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold"
                      />
                    </label>
                    <Button
                      type="submit"
                      className="mb-2 w-full"
                      disabled={savingNoteId !== null}
                    >
                      {savingNoteId === savedIdea.id
                        ? "Guardando nota..."
                        : savedIdea.privateNote
                          ? "Guardar cambios nota"
                          : "Guardar nota"}
                    </Button>
                  </form>
                  <div className="mt-3 flex min-h-11 flex-nowrap items-center justify-between gap-1">
                    {savedIdea.canEditGiftIdea && (
                      <button
                        type="button"
                        className="inline-flex min-h-11 min-w-0 items-center gap-1 rounded-xl border border-primary/10 bg-primary/5 px-2 text-xs font-medium text-primary hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        onClick={() =>
                          setEditingGiftIdeaId((current) =>
                            current === savedIdea.giftIdea.id
                              ? null
                              : savedIdea.giftIdea.id,
                          )
                        }
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
                        {editingGiftIdeaId === savedIdea.giftIdea.id
                          ? "Cancelar edición"
                          : "Editar"}
                      </button>
                    )}
                    <button
                      type="button"
                      className="inline-flex min-h-11 min-w-0 items-center gap-1 rounded-xl border border-error/15 bg-error/5 px-2 text-xs font-medium text-error hover:bg-error/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={deletingId !== null}
                      onClick={() => void handleDelete(savedIdea.id)}
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
                      {deletingId === savedIdea.id ? "Quitando..." : "Quitar"}
                    </button>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
