import { useEffect, useState } from "react";
import { Button } from "../../shared/components/Button";
import { Card } from "../../shared/components/Card";
import { EmptyState } from "../../shared/components/EmptyState";
import { ErrorState } from "../../shared/components/ErrorState";
import { Input } from "../../shared/components/Input";
import { LoadingState } from "../../shared/components/LoadingState";
import {
  createEvent,
  deleteEvent,
  getEvents,
  updateEvent,
} from "../services/events-service";
import type { PersonEvent } from "../types/event";

type EventsSectionProps = {
  personId: number;
};

//"2026-10-23 -> "23/10/2026"
//Splits the text instead of using new Date() so the day never shifts because of the timezone
function formatDate(date: string): string {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

// YYYY-MM-DD dates can be compared as text: "2026-01-05" < "2026-10-23"
function sortByDate(events: PersonEvent[]): PersonEvent[] {
  return [...events].sort((a, b) => a.date.localeCompare(b.date));
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

//Events of one person. It receives personId and is rendered inside another page
function EventsSection({ personId }: EventsSectionProps) {
  // List and status of the load
  const [events, setEvents] = useState<PersonEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  //Form and actions
  const [editingEvent, setEditingEvent] = useState<PersonEvent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    //If personId changes before the answer arrives, the old answer is ignores
    let ignore = false;

    async function loadEvents() {
      try {
        const data = await getEvents(personId);
        if (ignore) return;
        setEvents(data);
        setLoadError("");
      } catch (error) {
        if (ignore) return;
        setEvents([]);
        setLoadError(
          getErrorMessage(error, "No se pudieron cargar los eventos."),
        );
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadEvents();

    return () => {
      ignore = true;
    };
  }, [personId]);

  async function handleDelete(personEvent: PersonEvent) {
    if (!window.confirm(`¿Eliminar "${personEvent.name}"?`)) {
      return;
    }

    setSuccessMessage("");
    setErrorMessage("");

    try {
      await deleteEvent(personEvent.id);
      setEvents((currentEvents) =>
        currentEvents.filter((e) => e.id !== personEvent.id),
      );
      if (editingEvent?.id === personEvent.id) {
        setEditingEvent(null);
      }
      setSuccessMessage("Evento eliminado.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "No se pudo eliminar el evento."));
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-primary">Eventos</h2>

      <Card>
        <h3 className="mt-0 mb-3 font-semibold text-primary">
          {editingEvent ? "Editar evento" : "Nuevo evento"}
        </h3>

        <form
          key={editingEvent ? editingEvent.id : "new"}
          className="space-y-3"
          onSubmit={async (formEvent) => {
            formEvent.preventDefault();

            setSuccessMessage("");
            setErrorMessage("");

            const form = formEvent.currentTarget;
            const formData = new FormData(form);

            const eventInput = {
              name: String(formData.get("name")),
              date: String(formData.get("date")),
            };

            setIsSaving(true);

            try {
              if (editingEvent) {
                const updatedEvent = await updateEvent(
                  editingEvent.id,
                  eventInput,
                );
                setEvents((currentEvents) =>
                  sortByDate(
                    currentEvents.map((e) =>
                      e.id === updatedEvent.id ? updatedEvent : e,
                    ),
                  ),
                );
                setEditingEvent(null);
                setSuccessMessage("Evento actualizado.");
              } else {
                const newEvent = await createEvent(personId, eventInput);
                setEvents((currentEvents) =>
                  sortByDate([...currentEvents, newEvent]),
                );
                form.reset();
                setSuccessMessage("Evento creado.");
              }
            } catch (error) {
              setErrorMessage(
                getErrorMessage(error, "No se pudo guardar el evento."),
              );
            } finally {
              setIsSaving(false);
            }
          }}
        >
          <Input
            id="event-name"
            label="Nombre"
            name="name"
            type="text"
            maxLength={100}
            required
            defaultValue={editingEvent?.name ?? ""}
          />

          <Input
            id="event-date"
            label="Fecha"
            name="date"
            type="date"
            required
            defaultValue={editingEvent?.date ?? ""}
          />

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="submit"
              disabled={isSaving || isLoading || Boolean(loadError)}
            >
              {isSaving
                ? "Guardando..."
                : editingEvent
                  ? "Guardar cambios"
                  : "Crear evento"}
            </Button>

            {editingEvent && (
              <Button variant="secondary" onClick={() => setEditingEvent(null)}>
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

      {isLoading && <LoadingState />}

      {loadError && <ErrorState message={loadError} />}

      {!isLoading && !loadError && events.length === 0 && (
        <EmptyState message="Todavía no hay eventos para esta persona." />
      )}

      {events.length > 0 && (
        <ul className="m-0 list-none space-y-2 p-0">
          {events.map((personEvent) => (
            <li key={personEvent.id}>
              <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="m-0 font-medium">{personEvent.name}</p>
                  <p className="m-0 text-sm text-muted">
                    {formatDate(personEvent.date)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setEditingEvent(personEvent)}
                  >
                    Editar
                  </Button>
                  <button
                    type="button"
                    className="min-h-11 rounded-xl border border-error bg-surface px-4 py-2 font-medium text-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
                    onClick={() => void handleDelete(personEvent)}
                  >
                    Eliminar
                  </button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default EventsSection;
