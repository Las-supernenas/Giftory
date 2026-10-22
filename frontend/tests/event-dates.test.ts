import { describe, expect, it } from "vitest";
import {
  formatReadableDate,
  getCountdown,
  getDaysUntil,
  getNextOccurrence,
  getToday,
  isPastEvent,
  splitEventsByDate,
} from "../src/features/events/event-dates";

// every test uses a fixed "today" so results never depend on the real date
const TODAY = "2026-10-21";

function oneTime(date: string) {
  return { date, repeatsYearly: false };
}

function yearly(date: string) {
  return { date, repeatsYearly: true };
}

describe("getToday", () => {
  it("returns the local calendar day as YYYY-MM-DD", () => {
    expect(getToday(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
  });
});

describe("getNextOccurrence", () => {
  it("keeps the date of a one-time event", () => {
    expect(getNextOccurrence(oneTime("2026-12-15"), TODAY)).toBe("2026-12-15");
  });

  it("moves a yearly event to this year when it is still to come", () => {
    expect(getNextOccurrence(yearly("1990-10-26"), TODAY)).toBe("2026-10-26");
  });

  it("moves a yearly event to next year when it already passed this year", () => {
    expect(getNextOccurrence(yearly("2015-05-18"), TODAY)).toBe("2027-05-18");
  });

  it("keeps a yearly event today when it is today", () => {
    expect(getNextOccurrence(yearly("2000-10-21"), TODAY)).toBe("2026-10-21");
  });

  it("moves 29/02 to 28/02 in a non-leap year", () => {
    expect(getNextOccurrence(yearly("2024-02-29"), TODAY)).toBe("2027-02-28");
  });

  it("keeps 29/02 in a leap year", () => {
    expect(getNextOccurrence(yearly("2024-02-29"), "2027-10-21")).toBe(
      "2028-02-29",
    );
  });
});

describe("getDaysUntil", () => {
  it("counts whole days, negative when the date passed", () => {
    expect(getDaysUntil("2026-10-21", TODAY)).toBe(0);
    expect(getDaysUntil("2026-10-26", TODAY)).toBe(5);
    expect(getDaysUntil("2026-10-18", TODAY)).toBe(-3);
  });

  it("is not affected by the daylight saving change", () => {
    // in Spain the clocks change on 25/10/2026
    expect(getDaysUntil("2026-10-28", "2026-10-24")).toBe(4);
  });
});

describe("getCountdown", () => {
  it.each([
    [0, "¡Es hoy!", "soon"],
    [1, "Mañana", "soon"],
    [7, "En 7 días", "soon"],
    [8, "En 8 días", "normal"],
    [30, "En 30 días", "normal"],
    [31, "En 1 mes", "normal"],
    [60, "En 2 meses", "normal"],
    [364, "En 12 meses", "normal"],
    [365, "En 1 año", "normal"],
    [800, "En 2 años", "normal"],
    [-1, "Ya pasó", "past"],
  ])("%i days -> %s (%s)", (daysLeft, label, tone) => {
    expect(getCountdown(daysLeft)).toMatchObject({ label, tone });
  });

  it("gives a lowercase text for sentences", () => {
    expect(getCountdown(0).inline).toBe("hoy");
    expect(getCountdown(1).inline).toBe("mañana");
    expect(getCountdown(5).inline).toBe("en 5 días");
  });
});

describe("isPastEvent", () => {
  it("is past only for a one-time event before today", () => {
    expect(isPastEvent(oneTime("2026-10-20"), TODAY)).toBe(true);
    expect(isPastEvent(oneTime("2026-10-21"), TODAY)).toBe(false);
    expect(isPastEvent(yearly("2015-05-18"), TODAY)).toBe(false);
  });
});

describe("splitEventsByDate", () => {
  it("sorts upcoming by next occurrence and past by most recent", () => {
    const dinner = { id: 1, ...oneTime("2026-10-22") };
    const birthday = { id: 2, ...yearly("1990-10-26") };
    const anniversary = { id: 3, ...yearly("2015-05-18") };
    const graduation = { id: 4, ...oneTime("2026-09-05") };
    const oldTrip = { id: 5, ...oneTime("2025-07-01") };
    const events = [anniversary, oldTrip, birthday, graduation, dinner];

    const { upcoming, past } = splitEventsByDate(events, TODAY);

    expect(upcoming).toEqual([dinner, birthday, anniversary]);
    expect(past).toEqual([graduation, oldTrip]);
    // the original list is not modified
    expect(events).toEqual([
      anniversary,
      oldTrip,
      birthday,
      graduation,
      dinner,
    ]);
  });
});

describe("formatReadableDate", () => {
  it("formats the date in Spanish without shifting the day", () => {
    expect(formatReadableDate("2026-10-26")).toBe(
      "lunes, 26 de octubre de 2026",
    );
  });
});
