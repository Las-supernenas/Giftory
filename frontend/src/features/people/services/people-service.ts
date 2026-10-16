import type { Person, PersonInput } from "../../shared/types/person";

const API_URL = "/api/people";

function getHeaders() {
  return {
    "Content-Type": "application/json",
  };
}

export async function getPeople(): Promise<Person[]> {
  const response = await fetch(API_URL, { headers: getHeaders() });

  if (!response.ok) {
    throw new Error("No se pudieron cargar las personas.");
  }

  return response.json();
}

export async function createPerson(person: PersonInput): Promise<Person> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(person),
  });

  if (!response.ok) {
    throw new Error("No se ha creado la persona");
  }

  return response.json();
}

export async function updatePerson(
  id: number,
  person: PersonInput,
): Promise<Person> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(person),
  });

  if (!response.ok) {
    throw new Error("No se pudo actualizar la persona");
  }

  return response.json();
}

//SOft delete: return 204 with no body
export async function deletePerson(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("No se pudo borrar la persona");
  }
}
