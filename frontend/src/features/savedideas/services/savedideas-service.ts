import type { SavedIdea } from "../types/saved-idea";

export async function getSavedIdeas(personId: number): Promise<SavedIdea[]> {
  const response = await fetch(`/api/people/${personId}/savedideas`);
  if (!response.ok) {
    throw new Error("No se pudieron cargar las ideas guardadas.");
  }
  return response.json();
}

export async function addSavedIdea(
  personId: number,
  giftIdeaId: number,
): Promise<SavedIdea> {
  let response: Response;
  try {
    response = await fetch(`/api/people/${personId}/savedideas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ giftIdeaId }),
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }
  if (response.status === 409) {
    throw new Error("Esta idea ya está guardada para esta persona.");
  }
  if (!response.ok) {
    throw new Error("No se pudo guardar la idea para esta persona.");
  }
  return response.json();
}

export async function deleteSavedIdea(
  personId: number,
  savedIdeaId: number,
): Promise<void> {
  const response = await fetch(
    `/api/people/${personId}/savedideas/${savedIdeaId}`,
    { method: "DELETE" },
  );
  if (!response.ok) {
    throw new Error("No se pudo quitar la idea guardada.");
  }
}

export async function updateSavedIdeaPrivateNote(
  personId: number,
  savedIdeaId: number,
  privateNote: string | null,
): Promise<SavedIdea> {
  const response = await fetch(
    `/api/people/${personId}/savedideas/${savedIdeaId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ privateNote }),
    },
  );
  if (!response.ok) {
    throw new Error("No se pudo guardar la nota.");
  }
  return response.json();
}
