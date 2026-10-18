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
    <main>
      <h1>Personas</h1>

      <h2>{editingPerson ? "Editar persona" : "Nueva persona"}</h2>

      <form
        key={editingPerson ? editingPerson.id : "new"}
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
        <label htmlFor="name">Nombre</label>
        <input
          id="name"
          name="name"
          type="text"
          maxLength={100}
          required
          defaultValue={editingPerson?.name ?? ""}
        />

        <fieldset>
          <legend>Intereses</legend>

          {isLoadingInterests && <p role="status">Cargando intereses...</p>}

          {interestsError && <p role="alert">{interestsError}</p>}

          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <button
                key={interest}
                type="button"
                aria-pressed={selectedInterests.includes(interest)}
                onClick={() => toggleInterest(interest)}
                className={`min-h-11 rounded-full border border-primary px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  selectedInterests.includes(interest)
                    ? "bg-primary text-white"
                    : "bg-surface text-foreground"
                }`}
              >
                {INTEREST_LABELS[interest] ?? interest}
              </button>
            ))}
          </div>
        </fieldset>

        <button type="submit" disabled={isSaving || !canSave}>
          {isSaving
            ? "Guardando..."
            : editingPerson
              ? "Guardar cambios"
              : "Crear persona"}
        </button>

        {editingPerson && (
          <button
            type="button"
            onClick={() => {
              setEditingPerson(null);
              setSelectedInterests([]);
            }}
          >
            Cancelar
          </button>
        )}
      </form>

      {successMessage && <p role="status">{successMessage}</p>}
      {errorMessage && <p role="alert">{errorMessage}</p>}

      <h2>Tus personas</h2>

      {isLoading && <p role="status">Cargando personas...</p>}

      {loadError && <p role="alert">{loadError}</p>}

      {!isLoading && !loadError && people.length === 0 && (
        <p>Todavía no has añadido a ninguna persona.</p>
      )}

      {people.length > 0 && (
        <ul>
          {people.map((person) => (
            <li key={person.id}>
              <strong>{person.name}</strong>{" "}
              {person.interests.length > 0
                ? person.interests
                    .map((i) => INTEREST_LABELS[i] ?? i)
                    .join(", ")
                : "Sin intereses"}
              <button
                type="button"
                onClick={() => setSelectedPersonId(person.id)}
              >
                Ver ideas y eventos
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingPerson(person);
                  setSelectedInterests([...person.interests]);
                }}
              >
                Editar
              </button>
              <button type="button" onClick={() => void handleDelete(person)}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
      {selectedPersonId !== null && (
        <div key={selectedPersonId}>
          <EventsSection personId={selectedPersonId} />
          <SavedIdeasSection personId={selectedPersonId} />
        </div>
      )}
    </main>
  );
}

export default PeoplePage;
