import { useEffect, useState } from "react";
import {
  createPerson,
  deletePerson,
  getPeople,
  updatePerson,
} from "../services/people-service";
import { getInterests } from "../../shared/services/interests-service";
import {
  INTEREST_LABELS,
  type Interest,
  type Person,
} from "../../shared/types/person";
import EventsSection from "../../events/components/EventsSection";
import { SavedIdeasSection } from "../../savedideas/components/SavedIdeasSection";
import { Card } from "../../shared/components/Card";
import { Input } from "../../shared/components/Input";
import { Button } from "../../shared/components/Button";
import { ErrorState } from "../../shared/components/ErrorState";
import { EmptyState } from "../../shared/components/EmptyState";
import { getInterestColorStyle } from "../../shared/interest-colors";

function PeoplePage() {
  // List and status of the initial load
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);

  // Available interests, loaded from the backend
  const [interests, setInterests] = useState<Interest[]>([]);
  const [isLoadingInterests, setIsLoadingInterests] = useState(true);
  const [interestsError, setInterestsError] = useState("");

  // Form and states
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // When editing a person, no new interests would send []
  //deleting previous saved interests
  const canSave = !isLoadingInterests && !interestsError;

  useEffect(() => {
    async function loadPeople() {
      try {
        const data = await getPeople();
        setPeople(data);
      } catch {
        setLoadError("No se pudieron cargar las personas.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadPeople();
  }, []);

  useEffect(() => {
    async function loadInterests() {
      try {
        const data = await getInterests();
        setInterests(data);
      } catch {
        setInterestsError("No se pudieron cargar los intereses.");
      } finally {
        setIsLoadingInterests(false);
      }
    }

    void loadInterests();
  }, []);

  function toggleInterest(interest: Interest) {
    setSelectedInterests((current) => {
      if (current.includes(interest)) {
        return current.filter((selected) => selected !== interest);
      }
      return [...current, interest];
    });
  }

  async function handleDelete(person: Person) {
    if (!window.confirm(`¿Eliminar a ${person.name}?`)) {
      return;
    }

    setSuccessMessage("");
    setErrorMessage("");

    try {
      await deletePerson(person.id);
      setPeople((currentPeople) =>
        currentPeople.filter((p) => p.id !== person.id),
      );
      if (selectedPersonId === person.id) {
        setSelectedPersonId(null);
      }
      if (editingPerson?.id === person.id) {
        setEditingPerson(null);
        setSelectedInterests([]);
      }
      setSuccessMessage("Persona eliminada.");
    } catch {
      setErrorMessage("No se pudo eliminar la persona.");
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="mb-1 font-serif text-3xl font-bold leading-tight tracking-tight text-primary sm:text-4xl">
          Mis personas
        </h1>
        <p className="m-0 text-sm text-muted">
          Estas son las personas especiales en tu vida
        </p>
      </div>
      <Card className="mb-8 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-primary">
          {editingPerson ? "Editar persona" : "Nueva persona"}
        </h2>

        <form
          key={editingPerson ? editingPerson.id : "new"}
          className="space-y-5"
          onSubmit={async (event) => {
            event.preventDefault();

            setSuccessMessage("");
            setErrorMessage("");

            const form = event.currentTarget;
            const formData = new FormData(form);

            const personInput = {
              name: String(formData.get("name")),
              interests: selectedInterests,
            };

            setIsSaving(true);

            try {
              if (editingPerson) {
                const updatedPerson = await updatePerson(
                  editingPerson.id,
                  personInput,
                );
                setPeople((currentPeople) =>
                  currentPeople.map((p) =>
                    p.id === updatedPerson.id ? updatedPerson : p,
                  ),
                );
                setEditingPerson(null);
                setSelectedInterests([]);
                setSuccessMessage("Persona actualizada.");
              } else {
                const newPerson = await createPerson(personInput);
                setPeople((currentPeople) => [...currentPeople, newPerson]);
                form.reset();
                setSelectedInterests([]);
                setSuccessMessage("Persona creada.");
              }
            } catch {
              setErrorMessage("No se pudo guardar la persona.");
            } finally {
              setIsSaving(false);
            }
          }}
        >
          <Input
            id="name"
            label="Nombre"
            name="name"
            type="text"
            maxLength={100}
            required
            defaultValue={editingPerson?.name ?? ""}
          />

          <fieldset className="min-w-0 border-0 p-0">
            <legend className="sr-only">Intereses</legend>

            {isLoadingInterests && (
              <p className="text-sm text-muted" role="status">
                Cargando intereses...
              </p>
            )}

            {interestsError && <ErrorState message={interestsError} />}
            <details className="group rounded-xl border border-solid border-foreground/10 bg-surface p-3">
              <summary className="flex cursor-pointer list-none items-center rounded-lg bg-accent-lavender/15 px-3 py-2 font-medium text-primary hover:bg-accent-lavender/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
                ¿Qué le gusta?
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

              <div className="flex flex-wrap gap-2 mt-3">
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
          </fieldset>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" disabled={isSaving || !canSave}>
              {isSaving
                ? "Guardando..."
                : editingPerson
                  ? "Guardar cambios"
                  : "Crear persona"}
            </Button>

            {editingPerson && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditingPerson(null);
                  setSelectedInterests([]);
                }}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </Card>

      {successMessage && (
        <p
          role="status"
          className="mb-4 rounded-xl border-l-4 border-success bg-surface px-4 py-3 text-sm text-foreground"
        >
          {successMessage}
        </p>
      )}
      {errorMessage && <ErrorState message={errorMessage} />}

      <h2 className="mb-4 text-xl font-semibold text-primary">
        Personas añadidas
      </h2>

      {isLoading && (
        <p role="status" className="text-sm text-muted">
          Cargando personas...
        </p>
      )}

      {loadError && <ErrorState message={loadError} />}

      {!isLoading && !loadError && people.length === 0 && (
        <EmptyState message="Todavía no has añadido a ninguna persona." />
      )}

      {people.length > 0 && (
        <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((person) => (
            <li key={person.id}>
              <Card
                className={
                  selectedPersonId === person.id
                    ? "bg-accent-lavender/15! ring-2 ring-accent-lavender shadow-lg shadow-primary/20"
                    : "shadow-sm"
                }
              >
                <div className="flex items-start gap-3">
                  <div
                    aria-hidden="true"
                    className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-accent-lavender/25 text-xl font-semibold text-primary"
                  >
                    {person.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="m-0 text-lg font-semibold text-primary">
                      {person.name}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {person.interests.length > 0 ? (
                        person.interests.map((interest) => (
                          <span
                            key={interest}
                            className={`rounded-full px-2.5 py-1 text-xs ${getInterestColorStyle(interest)}`}
                          >
                            {INTEREST_LABELS[interest] ?? interest}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-muted">
                          Sin intereses
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    className="col-span-2"
                    onClick={() => setSelectedPersonId(person.id)}
                  >
                    Ver ideas y eventos
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setEditingPerson(person);
                      setSelectedInterests([...person.interests]);
                    }}
                  >
                    Editar
                  </Button>
                  <button
                    className="min-h-11 rounded-xl border border-error bg-surface px-4 py-2 font-medium text-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
                    type="button"
                    onClick={() => void handleDelete(person)}
                  >
                    Eliminar
                  </button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
      {selectedPersonId !== null && (
        <div
          key={selectedPersonId}
          className="mt-8 space-y-8 rounded-2xl border border-solid border-accent-lavender/50 bg-accent-lavender/10 p-4 sm:p-6"
        >
          <EventsSection personId={selectedPersonId} />
          <SavedIdeasSection
            personId={selectedPersonId}
            personName={
              people.find((person) => person.id === selectedPersonId)?.name ??
              ""
            }
          />
        </div>
      )}
    </main>
  );
}

export default PeoplePage;
