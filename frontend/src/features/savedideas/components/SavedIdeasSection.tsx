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
import { updateGiftIdea, type GiftIdea } from "../../../api/giftidea";
import { getLibraryItems } from "../../library/services/library-service";
import { Input } from "../../shared/components/Input";
import { INTEREST_LABELS } from "../../shared/types/person";
import { getInterestAccentColor } from "../../shared/interest-colors";

type SavedIdeasSectionProps = {
  personId: number;
  personName: string;
  availableInterests: string[];
};

export function SavedIdeasSection({
  personId,
  personName,
  availableInterests,
}: SavedIdeasSectionProps) {
  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [savingNoteId, setSavingNoteId] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");
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
      try {
        const data = await getSavedIdeas(personId);
        if (active) setSavedIdeas(data);
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
  }, [personId]);

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

    setSavingGiftIdeaId(giftIdeaId);
    setActionError("");

    try {
      const updated = await updateGiftIdea(giftIdeaId, {
        name,
        price,
        interests,
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
      setEditingGiftIdeaId(null);
    } catch {
      setActionError("No se pudo actualizar la idea de regalo.");
    } finally {
      setSavingGiftIdeaId(null);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-primary">
        Ideas guardadas de {personName}
      </h2>
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
        <ul className="m-0 grid list-none gap-3 p-0 lg:grid-cols-2">
          {savedIdeas.map((savedIdea) => (
            <li key={savedIdea.id}>
              <Card>
                <h3 className="m-0 text-lg font-semibold text-primary">
                  {savedIdea.giftIdea.name}
                </h3>
                <p className="mt-1 mb-4 text-sm text-muted">
                  {savedIdea.giftIdea.price} €
                </p>
                {savedIdea.canEditGiftIdea && (
                  <Button
                    type="button"
                    variant="secondary"
                    className="mb-3"
                    onClick={() =>
                      setEditingGiftIdeaId((current) =>
                        current === savedIdea.giftIdea.id
                          ? null
                          : savedIdea.giftIdea.id,
                      )
                    }
                  >
                    {editingGiftIdeaId === savedIdea.giftIdea.id
                      ? "Cancelar edición"
                      : "Editar idea de regalo"}
                  </Button>
                )}
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

                    <Button type="submit" disabled={savingGiftIdeaId !== null}>
                      {savingGiftIdeaId === savedIdea.giftIdea.id
                        ? "Guardando..."
                        : "Guardar cambios de la idea"}
                    </Button>
                  </form>
                )}
                <form
                  className="space-y-3"
                  onSubmit={(event) => void handleSaveNote(savedIdea.id, event)}
                >
                  <label className="block text-sm font-medium text-foreground">
                    Nota privada
                    <textarea
                      name="privateNote"
                      defaultValue={savedIdea.privateNote ?? ""}
                      className="mt-1 block min-h-24 w-full box-border rounded-xl border border-solid border-accent-gold/70 bg-accent-gold/10 px-3 py-2.5 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold"
                    />
                  </label>
                  <Button type="submit" disabled={savingNoteId !== null}>
                    {savingNoteId === savedIdea.id
                      ? "Guardando nota..."
                      : savedIdea.privateNote
                        ? "Guardar cambios nota"
                        : "Guardar nota"}
                  </Button>
                </form>
                <button
                  type="button"
                  className="mt-3 min-h-11 rounded-xl border border-error bg-surface px-4 py-2 font-medium text-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={deletingId !== null}
                  onClick={() => void handleDelete(savedIdea.id)}
                >
                  {deletingId === savedIdea.id ? "Quitando..." : "Quitar idea"}
                </button>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
