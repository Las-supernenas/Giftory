// Date rules for events: next occurrence, countdown and readable date
// Dates are "YYYY-MM-DD" text. Calculations use UTC so the day never shifts because of the timezone

// only the fields the date rules need
type DatedEvent = {
  date: string; // YYYY-MM-DD
  repeatsYearly: boolean;
};

export type CountdownTone = "past" | "soon" | "normal";

export type Countdown = {
  label: string; // badge text: "¡Es hoy!", "En 5 días", "Ya pasó"...
  inline: string; // text inside a sentence: "hoy", "en 5 días"...
  tone: CountdownTone; // "soon": the last 7 days are highlighted
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

// "2026-10-23" -> [2026, 10, 23]
function splitDate(date: string): [number, number, number] {
  const [year, month, day] = date.split("-").map(Number);
  return [year, month, day];
}

function toDateText(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// same day and month in another year. 29/02 falls on 28/02 in non-leap years
function moveToYear(date: string, year: number): string {
  const [, month, day] = splitDate(date);
  if (month === 2 && day === 29 && !isLeapYear(year)) {
    return toDateText(year, 2, 28);
  }
  return toDateText(year, month, day);
}

// Today in the user's local calendar, as "YYYY-MM-DD"
export function getToday(now: Date = new Date()): string {
  return toDateText(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

// One-time: its own date. Yearly: the next same day and month from today (today included)
export function getNextOccurrence(event: DatedEvent, today: string): string {
  if (!event.repeatsYearly) {
    return event.date;
  }

  const [currentYear] = splitDate(today);
  const thisYear = moveToYear(event.date, currentYear);

  // YYYY-MM-DD dates can be compared as text
  return thisYear >= today ? thisYear : moveToYear(event.date, currentYear + 1);
}

// Whole days from today to date. Negative when the date already passed
export function getDaysUntil(date: string, today: string): number {
  const [year, month, day] = splitDate(date);
  const [todayYear, todayMonth, todayDay] = splitDate(today);

  const difference =
    Date.UTC(year, month - 1, day) -
    Date.UTC(todayYear, todayMonth - 1, todayDay);

  return Math.round(difference / DAY_IN_MS);
}

export function getCountdown(daysLeft: number): Countdown {
  if (daysLeft < 0) {
    return { label: "Ya pasó", inline: "ya pasó", tone: "past" };
  }
  if (daysLeft === 0) {
    return { label: "¡Es hoy!", inline: "hoy", tone: "soon" };
  }
  if (daysLeft === 1) {
    return { label: "Mañana", inline: "mañana", tone: "soon" };
  }

  const tone: CountdownTone = daysLeft <= 7 ? "soon" : "normal";

  if (daysLeft <= 30) {
    return {
      label: `En ${daysLeft} días`,
      inline: `en ${daysLeft} días`,
      tone,
    };
  }

  if (daysLeft < 365) {
    const months = Math.max(1, Math.round(daysLeft / 30));
    const text = months === 1 ? "1 mes" : `${months} meses`;
    return { label: `En ${text}`, inline: `en ${text}`, tone };
  }

  const years = Math.floor(daysLeft / 365);
  const text = years === 1 ? "1 año" : `${years} años`;
  return { label: `En ${text}`, inline: `en ${text}`, tone };
}

// A one-time event before today. Yearly events are never past
export function isPastEvent(event: DatedEvent, today: string): boolean {
  return !event.repeatsYearly && event.date < today;
}

// Upcoming: closest first (by next occurrence). Past: most recent first
// The original list is not modified
export function splitEventsByDate<T extends DatedEvent>(
  events: T[],
  today: string,
): { upcoming: T[]; past: T[] } {
  const upcoming = events
    .filter((event) => !isPastEvent(event, today))
    .sort((a, b) =>
      getNextOccurrence(a, today).localeCompare(getNextOccurrence(b, today)),
    );

  const past = events
    .filter((event) => isPastEvent(event, today))
    .sort((a, b) => b.date.localeCompare(a.date));

  return { upcoming, past };
}

// "2026-10-26" -> "lunes, 26 de octubre de 2026"
const readableDateFormat = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatReadableDate(date: string): string {
  const [year, month, day] = splitDate(date);
  return readableDateFormat.format(new Date(Date.UTC(year, month - 1, day)));
}
