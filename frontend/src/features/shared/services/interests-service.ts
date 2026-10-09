import type { Interest } from "../types/person";

//Public endpoint: no token needed
export async function getInterests(): Promise<Interest[]> {
  const response = await fetch("/api/interests");

  if (!response.ok) {
    throw new Error("No se pudieron cargar los intereses.");
  }

  return response.json();
}
