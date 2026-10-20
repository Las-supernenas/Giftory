import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import DiscoveryPage from "../src/features/giftideas/pages/DiscoveryPage";
import { getGiftIdeas, createGiftIdea } from "../src/api/giftidea";
import { getInterests } from "../src/features/shared/services/interests-service";
import { getLibraryItems } from "../src/features/library/services/library-service";

vi.mock("../src/api/giftidea", () => ({
  getGiftIdeas: vi.fn(),
  createGiftIdea: vi.fn(),
}));

vi.mock("../src/features/shared/services/interests-service", () => ({
  getInterests: vi.fn(),
}));

vi.mock("../src/features/library/services/library-service", () => ({
  getLibraryItems: vi.fn(),
}));

const mockedGetGiftIdeas = vi.mocked(getGiftIdeas);
const mockedCreateGiftIdea = vi.mocked(createGiftIdea);
const mockedGetInterests = vi.mocked(getInterests);
const mockedGetLibraryItems = vi.mocked(getLibraryItems);

beforeEach(() => {
  vi.resetAllMocks();

  mockedGetGiftIdeas.mockResolvedValue([]);
  mockedGetInterests.mockResolvedValue([]);
  mockedGetLibraryItems.mockResolvedValue([]);
});

afterEach(() => {
  cleanup();
});

describe("DiscoveryPage", () => {
  it("renders gift ideas returned by the API", async () => {
    mockedGetGiftIdeas.mockResolvedValue([
      {
        id: 1,
        name: "Board Game",
        price: 29.99,
        interests: [],
      },
    ]);

    render(<DiscoveryPage isAuthenticated={false} />);

    expect(await screen.findByText("Board Game")).toBeTruthy();
    expect(screen.getByText("29.99 €")).toBeTruthy();
    // Interests are loaded even without a session: the filters need them
    expect(mockedGetInterests).toHaveBeenCalled();
  });

  it("shows a loading message while gift ideas are being fetched", () => {
    mockedGetGiftIdeas.mockImplementation(() => new Promise(() => {}));

    render(<DiscoveryPage isAuthenticated={false} />);

    expect(screen.getByText("Cargando ideas de regalo...")).toBeTruthy();
  });

  it("shows an error when gift ideas cannot be loaded", async () => {
    mockedGetGiftIdeas.mockRejectedValue(new Error("API unavailable"));

    render(<DiscoveryPage isAuthenticated={false} />);

    expect(
      await screen.findByText("No se pudieron cargar las ideas de regalo."),
    ).toBeTruthy();
  });

  it("allows an authenticated user to create a gift idea", async () => {
    mockedCreateGiftIdea.mockResolvedValue({
      id: 2,
      name: "Coffee Machine",
      price: 79.99,
      interests: [],
    });

    render(<DiscoveryPage isAuthenticated={true} />);

    fireEvent.change(screen.getByLabelText("Nombre del regalo"), {
      target: { value: "  Coffee Machine  " },
    });

    fireEvent.change(screen.getByLabelText("Precio (€)"), {
      target: { value: "79.99" },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Crear idea de regalo",
      }),
    );

    await waitFor(() => {
      expect(mockedCreateGiftIdea).toHaveBeenCalledWith({
        name: "Coffee Machine",
        price: 79.99,
        interests: [],
      });
    });

    expect(await screen.findByText("Coffee Machine")).toBeTruthy();

    expect(
      screen.getByText("¡Idea de regalo creada correctamente!"),
    ).toBeTruthy();
  });
});
