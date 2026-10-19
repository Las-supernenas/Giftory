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
import { updateGiftIdea } from "../../../api/giftidea";
import { getPeople } from "../../people/services/people-service";
import { addSavedIdea } from "../../savedideas/services/savedideas-service";

type LibraryItemResponse = {
  id: number;
  canEditGiftIdea: boolean;
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

    setSavingGiftIdeaId(giftIdeaId);
    setEditError("");
    try {
      const updated = await updateGiftIdea(giftIdeaId, {
        name: String(formData.get("name") ?? "").trim(),
        price: Number(formData.get("price")),
        interests: formData.getAll("interests").map(String),
      });
      setLibraryItems((current) =>
        current.map((item) =>
          item.giftIdea.id === giftIdeaId
            ? { ...item, giftIdea: updated }
            : item,
        ),
      );
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
      {editError && <ErrorState message={editError} />}
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
        <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {libraryItems.map((item) => (
            <li key={item.id}>
              <Card className="box-border flex flex-col border-accent-gold/60! sm:h-full">
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
                                  accentColor: getInterestAccentColor(interest),
                                }}
                              />
                              {INTEREST_LABELS[interest] ?? interest}
                            </label>
                          ))}
                        </div>
                      </details>
                      <Button
                        type="submit"
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
                  className="mb-2 w-full"
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
                    {!isLoadingPeople && !peopleError && people.length > 0 && (
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
                          onClick={() => void handleAssign(item.giftIdea.id)}
                        >
                          {isAssigning ? "Asignando..." : "Guardar asignación"}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                <div className="mt-auto flex min-h-14 gap-2">
                  {item.canEditGiftIdea && (
                    <Button
                      type="button"
                      variant="secondary"
                      className="min-w-0 flex-1 text-sm"
                      onClick={() => {
                        setEditError("");
                        setEditingGiftIdeaId((current) =>
                          current === item.giftIdea.id
                            ? null
                            : item.giftIdea.id,
                        );
                      }}
                    >
                      {editingGiftIdeaId === item.giftIdea.id
                        ? "Cancelar edición"
                        : "Editar idea de regalo"}
                    </Button>
                  )}
                  <button
                    type="button"
                    className="min-h-11 min-w-0 flex-1 rounded-xl border border-error bg-surface px-4 py-2 text-sm font-medium text-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
                    onClick={() => void removeLibraryItem(item.id)}
                  >
                    Eliminar de la biblioteca
                  </button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default LibraryPage;
