import { Fragment, useEffect, useState } from "react";
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
import { RecommendationsSection } from "../components/RecommendationsSection";
import { normalizeText } from "../../shared/normalize-text";

function PeoplePage() {
  // List and status of the initial load
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);

  // Text typed in the people search. Empty means "show everyone"
  const [search, setSearch] = useState("");

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

  // People shown in the list: derived from the loaded people + search text
  // people is never modified. An empty search matches everyone ("".includes is always true)
  const normalizedSearch = normalizeText(search);
  const visiblePeople = people.filter((person) =>
    normalizeText(person.name).includes(normalizedSearch),
  );

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
                    p.id === updatedPerson.id
                      ? { ...updatedPerson, savedIdeasCount: p.savedIdeasCount }
                      : p,
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

      {/* Search: only when there are people to search */}
      {people.length > 0 && (
        <div className="mb-4">
          <Input
            id="people-search"
            label="Buscar personas"
            type="search"
            placeholder="Ej.: Ana"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      )}

      {/* There are people, but none matches the search */}
      {people.length > 0 && visiblePeople.length === 0 && (
        <div className="space-y-3">
          <EmptyState message="No encontramos personas con ese nombre." />
          <Button variant="accent" onClick={() => setSearch("")}>
            Limpiar búsqueda
          </Button>
        </div>
      )}

      {visiblePeople.length > 0 && (
        <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 grid-flow-row-dense">
          {visiblePeople.map((person) => (
            <Fragment key={person.id}>
              <li className="relative">
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
                  <p className="mb-0 mt-3 flex items-center gap-1.5 text-sm text-muted">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-4 shrink-0 text-accent-dusty-pink"
                    >
                      <path d="M3 10h18v3H3zM5 13v8h14v-8M12 10v11M12 10H8.5a2.5 2.5 0 1 1 2.5-2.5V10M12 10h3.5A2.5 2.5 0 1 0 13 7.5V10" />
                    </svg>
                    {person.savedIdeasCount}{" "}
                    {person.savedIdeasCount === 1
                      ? "idea guardada"
                      : "ideas guardadas"}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      className="col-span-2"
                      onClick={() =>
                        setSelectedPersonId((current) =>
                          current === person.id ? null : person.id,
                        )
                      }
                    >
                      {selectedPersonId === person.id
                        ? "Ocultar detalles"
                        : "Ver detalles"}
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
                {selectedPersonId === person.id && (
                  <span className="absolute -bottom-3 left-1/2 z-10 size-4 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-accent-lavender bg-background" />
                )}
              </li>
              {selectedPersonId === person.id && (
                <li className="col-span-full">
                  <div className="space-y-8 rounded-2xl border border-accent-lavender/50 bg-accent-lavender/10 p-4 sm:p-6">
                    <h3 className="text-xl font-semibold text-primary">
                      Detalles de {person.name}
                    </h3>
                    <EventsSection personId={person.id} />
                    <SavedIdeasSection
                      personId={person.id}
                      personName={person.name}
                      availableInterests={interests}
                    />
                    <RecommendationsSection
                      personId={person.id}
                      personName={person.name}
                    />
                  </div>
                </li>
              )}
            </Fragment>
          ))}
        </ul>
      )}
    </main>
  );
}

export default PeoplePage;
