// A library item as the backend returns it (GET and POST /api/library)
export type LibraryItem = {
  id: number;
  giftIdea: {
    id: number;
    name: string;
    price: number;
    interests: string[];
  };
};

//Result of trying to save a gift idea: 409 means the idea was already in their library
export type AddToLibraryResult = "added" | "alreadySaved";

// fetch() itself fails when the request cannot be sent (no connection, server down, blocked request)
// the error message its in english, so we replace it with a spanish one
// the cookie is sent automatically: same origin, no Authorization header needed.
async function sendRequest(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  try {
    return await fetch(url, options);
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }
}

export async function getLibraryItems(): Promise<LibraryItem[]> {
  const response = await sendRequest("/api/library");

  if (response.status === 401) {
    throw new Error("Tu sesión ha caducado. Inicia sesión de nuevo.");
  }

  if (!response.ok) {
    throw new Error("No se pudo cargar tu biblioteca.");
  }

  return response.json();
}

export async function addToLibrary(
  giftIdeaId: number,
): Promise<AddToLibraryResult> {
  const response = await sendRequest("/api/library", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ giftIdeaId }),
  });

  if (response.status === 409) {
    return "alreadySaved";
  }

  if (response.status === 401) {
    throw new Error("Tu sesión ha caducado. Inicia sesión de nuevo.");
  }

  if (response.status === 404) {
    throw new Error("Esta idea de regalo ya no existe.");
  }

  if (!response.ok) {
    throw new Error("No se pudo guardar la idea en tu biblioteca.");
  }

  return "added";
}
