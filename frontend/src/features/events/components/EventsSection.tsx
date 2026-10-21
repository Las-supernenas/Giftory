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
import {
  formatReadableDate,
  getCountdown,
  getDaysUntil,
  getNextOccurrence,
  getToday,
  splitEventsByDate,
  type CountdownTone,
} from "../event-dates";

type EventsSectionProps = {
  personId: number;
};

// Countdown badge colors. "soon" (the last 7 days) stands out
const COUNTDOWN_STYLES: Record<CountdownTone, string> = {
  soon: "bg-accent-dusty-pink font-semibold text-foreground",
  normal: "bg-accent-lavender/30 font-medium text-primary",
  past: "bg-foreground/5 text-muted",
};

// Name suggestions of the form. All of them repeat every year
const EVENT_NAME_SUGGESTIONS = [
  "Cumpleaños",
  "Aniversario",
  "Navidad",
  "San Valentín",
];

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
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  // "¿Se repite?" option of the form. false: "Una sola vez", true: "Cada año"
  const [repeatsYearly, setRepeatsYearly] = useState(false);
  // Name and date are controlled so the suggestions and the past-date warning can use them
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");

  // Loads an event into the form to edit it, or empties the form (null) for a new event
  function fillForm(personEvent: PersonEvent | null) {
    setEditingEvent(personEvent);
    setEventName(personEvent?.name ?? "");
    setEventDate(personEvent?.date ?? "");
    setRepeatsYearly(personEvent?.repeatsYearly ?? false);
  }

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
        fillForm(null);
      }
      setSuccessMessage("Evento eliminado.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "No se pudo eliminar el evento."));
    }
  }

  // Upcoming and past lists are derived from events + today. events is never modified
  const today = getToday();
  const { upcoming, past } = splitEventsByDate(events, today);

  // Summary next to the title: the closest upcoming event (undefined when there is none)
  const nextEvent = upcoming[0];
  const nextCountdown = nextEvent
    ? getCountdown(getDaysUntil(getNextOccurrence(nextEvent, today), today))
    : null;

  // Non-blocking warning: a one-time event with a date before today.
  // It suggests the next year where that day and month is still to come
  const suggestedYear =
    !repeatsYearly && eventDate !== "" && eventDate < today
      ? getNextOccurrence(
          { date: eventDate, repeatsYearly: true },
          today,
        ).slice(0, 4)
      : null;

  // One event card, used in both lists
  function renderEventItem(personEvent: PersonEvent) {
    // yearly events show and count down to their next occurrence
    const nextDate = getNextOccurrence(personEvent, today);
    const countdown = getCountdown(getDaysUntil(nextDate, today));

    return (
      <li key={personEvent.id}>
        <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p
                className={`m-0 font-medium ${countdown.tone === "past" ? "text-muted" : ""}`}
              >
                {personEvent.name}
              </p>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs ${COUNTDOWN_STYLES[countdown.tone]}`}
              >
                {countdown.label}
              </span>
              {personEvent.repeatsYearly && (
                <span className="rounded-full border border-solid border-primary/30 px-2.5 py-0.5 text-xs text-primary">
                  Anual
                </span>
              )}
            </div>
            <p className="m-0 text-sm text-muted">
              {formatReadableDate(nextDate)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                fillForm(personEvent);
                setIsEventFormOpen(true);
              }}
            >
              Editar
            </Button>
            <button
              type="button"
              className="min-h-11 rounded-xl border border-error bg-surface px-4 py-2 font-medium text-error transition-colors hover:bg-error/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
              onClick={() => void handleDelete(personEvent)}
            >
              Eliminar
            </button>
          </div>
        </Card>
      </li>
    );
  }

  return (
    <section className="space-y-4">
<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
  <div className="flex min-w-0 flex-wrap items-baseline gap-x-4 gap-y-1">
    <h2 className="m-0 text-xl font-semibold text-primary">Eventos</h2>

    {nextEvent && nextCountdown && (
      <p className="m-0 text-sm text-foreground">
        Próximo: <strong>{nextEvent.name}</strong>, {nextCountdown.inline}
      </p>
    )}
  </div>

  <Button
    variant="secondary"
    aria-expanded={isEventFormOpen}
    onClick={() => {
      setEditingEvent(null);
      setIsEventFormOpen((open) => !open);
    }}
  >
    {isEventFormOpen ? "Ocultar formulario" : "Añadir evento"}
  </Button>
</div>
      </div>
      {isLoading && <LoadingState />}

      {loadError && <ErrorState message={loadError} />}

      {!isLoading && !loadError && events.length === 0 && (
        <EmptyState message="Todavía no hay eventos para esta persona." />
      )}
      {upcoming.length > 0 && (
        <div className="space-y-2">
          <h3 className="m-0 text-xs font-semibold uppercase tracking-wide text-muted">
            Próximos
          </h3>
          <ul className="m-0 list-none space-y-2 p-0">
            {upcoming.map(renderEventItem)}
          </ul>
        </div>
      )}

      {/* Past one-time events: collapsed by default, still editable and deletable */}
      {past.length > 0 && (
        <details className="group rounded-xl border border-solid border-foreground/10 bg-surface">
          <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-xl px-4 py-2 font-medium text-muted hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
            Eventos pasados ({past.length})
            <span
              aria-hidden="true"
              className="ml-auto inline-block transition-transform group-open:rotate-180"
            >
              ▾
            </span>
          </summary>
          <ul className="m-0 list-none space-y-2 px-3 pb-3 pt-1">
            {past.map(renderEventItem)}
          </ul>
        </details>
      )}
      {isEventFormOpen && (
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

              const eventInput = {
                name: eventName,
                date: eventDate,
                repeatsYearly,
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
                  fillForm(null);
                  setSuccessMessage("Evento actualizado.");
                } else {
                  const newEvent = await createEvent(personId, eventInput);
                  setEvents((currentEvents) =>
                    sortByDate([...currentEvents, newEvent]),
                  );
                  fillForm(null);
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
            <div className="space-y-2">
              <Input
                id="event-name"
                label="Nombre"
                name="name"
                type="text"
                maxLength={100}
                required
                value={eventName}
                onChange={(event) => setEventName(event.target.value)}
              />
              {/* A suggestion fills the name and selects "Cada año" (it can be changed) */}
              <div
                role="group"
                aria-label="Sugerencias de nombre"
                className="flex flex-wrap gap-2"
              >
                {EVENT_NAME_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    aria-pressed={eventName === suggestion}
                    onClick={() => {
                      setEventName(suggestion);
                      setRepeatsYearly(true);
                    }}
                    className={`min-h-11 rounded-full border px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                      eventName === suggestion
                        ? "border-solid border-primary bg-accent-lavender/30 font-semibold text-primary ring-2 ring-primary/25"
                        : "border-solid border-primary/30 bg-surface text-foreground hover:border-primary"
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Input
                id="event-date"
                label="Fecha"
                name="date"
                type="date"
                required
                value={eventDate}
                onChange={(event) => setEventDate(event.target.value)}
                aria-describedby={
                  suggestedYear ? "event-date-warning" : undefined
                }
              />
              {suggestedYear && (
                <p
                  id="event-date-warning"
                  aria-live="polite"
                  className="m-0 text-sm text-amber-800"
                >
                  Esta fecha ya pasó. ¿Querías poner {suggestedYear}?
                </p>
              )}
            </div>

            <fieldset className="m-0 min-w-0 border-0 p-0">
              <legend className="mb-1.5 p-0 text-sm font-medium text-foreground">
                ¿Se repite?
              </legend>
              <div className="flex flex-wrap gap-x-6">
                <label className="flex min-h-11 cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="repeatsYearly"
                    checked={!repeatsYearly}
                    onChange={() => setRepeatsYearly(false)}
                    className="size-5 accent-primary"
                  />
                  Una sola vez
                </label>
                <label className="flex min-h-11 cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="repeatsYearly"
                    checked={repeatsYearly}
                    onChange={() => setRepeatsYearly(true)}
                    className="size-5 accent-primary"
                  />
                  Cada año
                </label>
              </div>
            </fieldset>

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
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditingEvent(null);
                    setIsEventFormOpen(false);
                  }}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Card>
      )}

      {successMessage && (
        <p
          role="status"
          className="mb-4 rounded-xl border-l-4 border-success bg-surface px-4 py-3 text-sm text-foreground"
        >
          {successMessage}
        </p>
      )}
      {errorMessage && <ErrorState message={errorMessage} />}
    </section>
  );
}

export default EventsSection;
