import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getRecommendations } from "../src/features/people/services/recommendations-service";

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ recommendations: [] }),
  } as Response);

  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getRecommendations", () => {
  it("envía el POST a la persona indicada con sus preferencias", async () => {
    await getRecommendations(7, { budget: 45 });

    expect(fetchMock).toHaveBeenCalledWith("/api/people/7/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ budget: 45 }),
    });
  });

  it.each([
    { status: 400, message: "Revisa los datos de la solicitud." },
    { status: 404, message: "No se encontró esta persona." },
    { status: 502, message: "No se pudo procesar la respuesta de la IA." },
    {
      status: 504,
      message: "La IA tardó demasiado en responder. Inténtalo de nuevo.",
    },
  ])(
    "traduce el estado HTTP $status a su mensaje",
    async ({ status, message }) => {
      fetchMock.mockResolvedValue({
        ok: false,
        status,
        json: async () => ({}),
      } as Response);

      await expect(getRecommendations(7, {})).rejects.toThrow(message);
    },
  );
});
