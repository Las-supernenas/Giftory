import { useEffect, useState } from "react";
import {
  createPerson,
  deletePerson,
  getPeople,
  updatePerson,
} from "../services/people-service";
import {
  INTERESTS,
  INTEREST_LABELS,
  type Interest,
  type Person,
} from "../../shared/types/person";

function PeoplePage() {
  // List and status of the initial load
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Form and states
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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
      if (editingPerson?.id === person.id) {
        setEditingPerson(null);
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
            interests: formData.getAll("interests") as Interest[],
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
              setSuccessMessage("Persona actualizada.");
            } else {
              const newPerson = await createPerson(personInput);
              setPeople((currentPeople) => [...currentPeople, newPerson]);
              form.reset();
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
          {INTERESTS.map((interest) => (
            <label key={interest}>
              <input
                type="checkbox"
                name="interests"
                value={interest}
                defaultChecked={editingPerson?.interests.includes(interest)}
              />
              {INTEREST_LABELS[interest]}
            </label>
          ))}
        </fieldset>

        <button type="submit" disabled={isSaving}>
          {isSaving
            ? "Guardando..."
            : editingPerson
              ? "Guardar cambios"
              : "Crear persona"}
        </button>

        {editingPerson && (
          <button type="button" onClick={() => setEditingPerson(null)}>
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
                ? person.interests.map((i) => INTEREST_LABELS[i]).join(", ")
                : "Sin intereses"}
              <button type="button" onClick={() => setEditingPerson(person)}>
                Editar
              </button>
              <button type="button" onClick={() => void handleDelete(person)}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default PeoplePage;
