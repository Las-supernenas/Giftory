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
      <h1 className="mb-8 text-3xl font-semibold tracking-tight text-primary">
        Personas
      </h1>
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
            <legend className="mb-3 text-sm font-medium text-foreground">
              Intereses
            </legend>

            {isLoadingInterests && (
              <p className="text-sm text-muted" role="status">
                Cargando intereses...
              </p>
            )}

            {interestsError && <ErrorState message={interestsError} />}

            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  aria-pressed={selectedInterests.includes(interest)}
                  onClick={() => toggleInterest(interest)}
                  className={`min-h-11 rounded-full border border-primary px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    selectedInterests.includes(interest)
                      ? "bg-accent-lavender text-foreground"
                      : "bg-surface text-foreground"
                  }`}
                >
                  {INTEREST_LABELS[interest] ?? interest}
                </button>
              ))}
            </div>
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

      <h2 className="mb-4 text-xl font-semibold text-primary">Tus personas</h2>

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
        <ul className="m-0 list-none space-y-3 p-0">
          {people.map((person) => (
            <li key={person.id}>
              <Card>
                <h3 className="m-0 text-lg font-semibold text-primary">
                  {person.name}
                </h3>
                <p className="mt-1 mb-0 text-sm text-muted">
                  {person.interests.length > 0
                    ? person.interests
                        .map((i) => INTEREST_LABELS[i] ?? i)
                        .join(", ")
                    : "Sin intereses"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
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
        <div key={selectedPersonId} className="mt-8 space-y-8">
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
