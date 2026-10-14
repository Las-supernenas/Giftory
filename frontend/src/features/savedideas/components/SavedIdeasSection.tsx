import { useEffect, useState } from "react";
import type { SavedIdea } from "../types/saved-idea";
import {
  addSavedIdea,
  deleteSavedIdea,
  getSavedIdeas,
} from "../services/savedideas-service";
import { LoadingState } from "../../shared/components/LoadingState";
import { ErrorState } from "../../shared/components/ErrorState";
import { EmptyState } from "../../shared/components/EmptyState";
import { Card } from "../../shared/components/Card";
import { Button } from "../../shared/components/Button";
import { getGiftIdeas, type GiftIdea } from "../../../api/giftidea";

type SavedIdeasSectionProps = { personId: number };

export function SavedIdeasSection({ personId }: SavedIdeasSectionProps) {
  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");
  const [giftIdeas, setGiftIdeas] = useState<GiftIdea[]>([]);
  const [isLoadingGiftIdeas, setIsLoadingGiftIdeas] = useState(true);
  const [giftIdeasError, setGiftIdeasError] = useState("");
  const [selectedGiftIdeaId, setSelectedGiftIdeaId] = useState("");
  const [isAdding, setIsAdding] = useState(false);

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
        const data = await getGiftIdeas();
        setGiftIdeas(data);
      } catch {
        setGiftIdeasError("No se pudieron cargar las ideas disponibles.");
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

  return (
    <section>
      <h2>Ideas guardadas de la persona {personId}</h2>
      {isLoadingGiftIdeas && <p role="status">Cargando ideas disponibles...</p>}
      {!isLoadingGiftIdeas && giftIdeasError && (
        <ErrorState message={giftIdeasError} />
      )}
      {!isLoadingGiftIdeas && !giftIdeasError && giftIdeas.length === 0 && (
        <p>No hay ideas públicas disponibles para guardar.</p>
      )}
      {!isLoadingGiftIdeas && !giftIdeasError && giftIdeas.length > 0 && (
        <div className="grid gap-2">
          <label className="block">
            Idea para guardar
            <select
              className="mt-1 block w-full rounded-xl border p-3"
              value={selectedGiftIdeaId}
              onChange={(event) => setSelectedGiftIdeaId(event.target.value)}
            >
              <option value="">Elige una idea</option>
              {giftIdeas.map((idea) => (
                <option key={idea.id} value={idea.id}>
                  {idea.name}
                </option>
              ))}
            </select>
          </label>
          <Button
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
        </div>
      )}
      {isLoading && <LoadingState />}
      {!isLoading && loadError && <ErrorState message={loadError} />}
      {!isLoading && actionError && <ErrorState message={actionError} />}
      {!isLoading && !loadError && savedIdeas.length === 0 && (
        <EmptyState message="Esta persona todavía no tiene ideas guardadas." />
      )}
      {!isLoading && !loadError && savedIdeas.length > 0 && (
        <ul className="grid gap-3">
          {savedIdeas.map((savedIdea) => (
            <li key={savedIdea.id}>
              <Card>
                <h3>{savedIdea.giftIdea.name}</h3>
                <p>{savedIdea.giftIdea.price} €</p>
                <Button
                  variant="secondary"
                  disabled={deletingId !== null}
                  onClick={() => void handleDelete(savedIdea.id)}
                >
                  {deletingId === savedIdea.id ? "Quitando..." : "Quitar"}
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
