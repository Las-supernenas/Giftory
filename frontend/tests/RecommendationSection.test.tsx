import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { RecommendationsSection } from "../src/features/people/components/RecommendationsSection";
import { getRecommendations } from "../src/features/people/services/recommendations-service";
import type { RecommendationResponse } from "../src/features/people/types/recommendation";

vi.mock("../src/features/people/services/recommendations-service", () => ({
  getRecommendations: vi.fn(),
}));

const mockedGetRecommendations = vi.mocked(getRecommendations);

afterEach(() => {
  cleanup();
});

describe("RecommendationsSection", () => {
  it("muestra las recomendaciones que devuelve el servicio", async () => {
    mockedGetRecommendations.mockResolvedValue({
      recommendations: [
        {
          giftIdeaId: 1,
          name: "Juego de mesa",
          price: 29.99,
          matchScore: 90,
          reason: "Le gusta compartir tiempo jugando.",
        },
      ],
    });

    render(<RecommendationsSection personId={7} personName="Laura" />);

    fireEvent.click(screen.getByRole("button", { name: "Haz tu magia Gifty" }));

    expect(await screen.findByText("Juego de mesa")).toBeTruthy();
    expect(screen.getByText("Le gusta compartir tiempo jugando.")).toBeTruthy();
    expect(screen.getByText("29.99 €")).toBeTruthy();
    expect(screen.getByText(/Puntuación de afinidad: 90/)).toBeTruthy();
    expect(mockedGetRecommendations).toHaveBeenCalledWith(7, {});
  });

  it("envía el presupuesto como número", () => {
    mockedGetRecommendations.mockClear();
    mockedGetRecommendations.mockResolvedValue({ recommendations: [] });

    render(<RecommendationsSection personId={7} personName="Laura" />);

    fireEvent.change(screen.getByLabelText(/Presupuesto máximo/i), {
      target: { value: "45" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Haz tu magia Gifty" }));

    expect(mockedGetRecommendations).toHaveBeenCalledWith(7, { budget: 45 });
  });

  it("envía solo las preferencias de texto rellenadas y sin espacios sobrantes", () => {
    mockedGetRecommendations.mockClear();
    mockedGetRecommendations.mockResolvedValue({ recommendations: [] });

    render(<RecommendationsSection personId={7} personName="Laura" />);

    fireEvent.change(screen.getByLabelText(/Rango de edad/i), {
      target: { value: "  20-30 años  " },
    });
    fireEvent.change(screen.getByLabelText(/Ocasión/i), {
      target: { value: "  cumpleaños  " },
    });
    fireEvent.change(screen.getByLabelText(/Información adicional/i), {
      target: { value: "  Le gusta leer  " },
    });

    fireEvent.click(screen.getByRole("button", { name: "Haz tu magia Gifty" }));

    expect(mockedGetRecommendations).toHaveBeenCalledWith(7, {
      ageRange: "20-30 años",
      occasion: "cumpleaños",
      additionalInfo: "Le gusta leer",
    });
  });

  it("muestra un mensaje cuando no hay recomendaciones", async () => {
    mockedGetRecommendations.mockClear();
    mockedGetRecommendations.mockResolvedValue({ recommendations: [] });

    render(<RecommendationsSection personId={7} personName="Laura" />);

    fireEvent.click(screen.getByRole("button", { name: "Haz tu magia Gifty" }));

    expect(
      await screen.findByText(
        "Gifty no ha podido encontrar regalos. Prueba con otras pistas...",
      ),
    ).toBeTruthy();
  });

  it("muestra la carga y desactiva el botón mientras espera", () => {
    mockedGetRecommendations.mockClear();
    mockedGetRecommendations.mockReturnValue(
      new Promise<RecommendationResponse>(() => {}),
    );

    render(<RecommendationsSection personId={7} personName="Laura" />);

    fireEvent.click(screen.getByRole("button", { name: "Haz tu magia Gifty" }));

    const loadingButton = screen.getByRole("button", {
      name: "Regalos en camino...",
    });

    expect(loadingButton.hasAttribute("disabled")).toBe(true);
  });

  it("muestra el error devuelto por el servicio", async () => {
    mockedGetRecommendations.mockClear();
    mockedGetRecommendations.mockRejectedValue(
      new Error("Revisa los datos de la solicitud."),
    );

    render(<RecommendationsSection personId={7} personName="Laura" />);

    fireEvent.click(screen.getByRole("button", { name: "Haz tu magia Gifty" }));

    expect(
      await screen.findByText("Revisa los datos de la solicitud."),
    ).toBeTruthy();
  });

  it("muestra las cinco recomendaciones recibidas", async () => {
    mockedGetRecommendations.mockClear();

    const recommendations = Array.from({ length: 5 }, (_, index) => ({
      giftIdeaId: index + 1,
      name: `Regalo ${index + 1}`,
      price: 10 + index,
      matchScore: 90 - index,
      reason: `Motivo ${index + 1}`,
    }));

    mockedGetRecommendations.mockResolvedValue({ recommendations });

    render(<RecommendationsSection personId={7} personName="Laura" />);

    fireEvent.click(screen.getByRole("button", { name: "Haz tu magia Gifty" }));

    expect(await screen.findByText("Regalo 1")).toBeTruthy();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(5);
  });
});
