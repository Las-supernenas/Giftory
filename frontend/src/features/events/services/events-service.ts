import type { EventInput, PersonEvent } from "../types/event";

// Same headers as people-service: JSON body and the session token
function getHeaders() {
  const token = sessionStorage.getItem("giftoryAccessToken");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// fetch() itself fails when the request cannot be sent (no connection, server down, blocked request).
// Its error message is in English ("Failed to fetch"), so we replace it with a Spanish one.

async function sendRequest(url: string, options: RequestInit): Promise<Response> {
  try {
    return await fetch(url, options);
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }
}

// Errors

export async function getEvents(personId: number): Promise<PersonEvent[]> {
  const response = await sendRequest(`/api/people/${personId}/events`, {
    headers: getHeaders(),
  });

  if (response.status === 404) {
    throw new Error("No se encontró la persona.");
  }
  if (!response.ok) {
    throw new Error("No se pudieron cargar los eventos.");
  }
  return response.json();
}

export async function createEvent(
  personId: number,
  event: EventInput,
): Promise<PersonEvent> {
  const response = await sendRequest(`/api/people/${personId}/events`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(event),
  });

  if (response.status === 400) {
    throw new Error("Revisa el nombre y la fecha del evento.");
  }
  if (response.status === 404) {
    throw new Error("No se encontró la persona.");
  }

  if (!response.ok) {
    throw new Error("No se pudo crear el evento.");
  }

  return response.json();
}

export async function updateEvent(
  id: number,
  event: EventInput,
): Promise<PersonEvent> {
  const response = await sendRequest(`/api/events/${id}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(event),
  });

  if (response.status === 400) {
    throw new Error("Revisa el nombre y la fecha del evento.");
  }

  if (response.status === 404) {
    throw new Error("No se encontró el evento.");
  }

  if (!response.ok) {
    throw new Error("No se pudo actualizar el evento.");
  }

  return response.json();
}

//Hard delete: returns 204 with no  body

export async function deleteEvent(id: number): Promise<void> {
  const response = await sendRequest(`/api/events/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (response.status === 404) {
    throw new Error("No se encontró el evento.");
  }

  if (!response.ok) {
    throw new Error("No se pudo eliminar el evento.");
  }
}
