import type {
  RecommendationRequest,
  RecommendationResponse,
} from "../types/recommendation";

export async function getRecommendations(
  personId: number,
  preferences: RecommendationRequest,
): Promise<RecommendationResponse> {
  const response = await fetch(`/api/people/${personId}/recommendations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(preferences),
  });

  if (response.status === 400) {
    throw new Error("Revisa los datos de la solicitud.");
  }

  if (response.status === 404) {
    throw new Error("No se encontró esta persona.");
  }

  if (response.status === 502) {
    throw new Error("No se pudo procesar la respuesta de la IA.");
  }

  if (response.status === 504) {
    throw new Error("La IA tardó demasiado en responder. Inténtalo de nuevo.");
  }

  if (!response.ok) {
    throw new Error("No se pudieron obtener las recomendaciones.");
  }

  return response.json();
}
