import { useState, type FormEvent } from "react";
import { Input } from "../../shared/components/Input";
import { Button } from "../../shared/components/Button";
import { Card } from "../../shared/components/Card";
import { getRecommendations } from "../services/recommendations-service";
import type {
  GiftRecommendation,
  RecommendationRequest,
} from "../types/recommendation";

type RecommendationsSectionProps = {
  personId: number;
  personName: string;
};

export function RecommendationsSection({
  personId,
  personName,
}: RecommendationsSectionProps) {
  const [budget, setBudget] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [occasion, setOccasion] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [budgetError, setBudgetError] = useState("");
  const [requestError, setRequestError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<
    GiftRecommendation[] | null
  >(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      budget.trim() &&
      (!Number.isFinite(Number(budget)) || Number(budget) <= 0)
    ) {
      setBudgetError("Introduce un presupuesto mayor que cero.");
      return;
    }

    setBudgetError("");

    const preferences: RecommendationRequest = {};

    if (budget.trim()) {
      preferences.budget = Number(budget);
    }

    if (ageRange.trim()) {
      preferences.ageRange = ageRange.trim();
    }

    if (occasion.trim()) {
      preferences.occasion = occasion.trim();
    }

    if (additionalInfo.trim()) {
      preferences.additionalInfo = additionalInfo.trim();
    }

    setRequestError("");
    setIsLoading(true);

    try {
      const response = await getRecommendations(personId, preferences);
      setRecommendations(response.recommendations);
      setRequestError("");
    } catch (error) {
      setRequestError(
        error instanceof Error
          ? error.message
          : "No se pudieron obtener las recomendaciones.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section>
      <h2 className="text-xl font-semibold text-primary">
        Recomendaciones para {personName}
      </h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          id="recommendation-budget"
          label="Presupuesto máximo (€), opcional"
          type="number"
          min="0.01"
          step="0.01"
          value={budget}
          onChange={(event) => setBudget(event.target.value)}
          error={budgetError}
        />
        <Input
          id="recommendation-age-range"
          label="Rango de edad, opcional"
          placeholder="Ej.: 20–30 años"
          value={ageRange}
          onChange={(event) => setAgeRange(event.target.value)}
        />
        <Input
          id="recommendation-occasion"
          label="Ocasión, opcional"
          placeholder="Ej.: cumpleaños"
          value={occasion}
          onChange={(event) => setOccasion(event.target.value)}
        />
        <div className="space-y-1.5">
          <label
            htmlFor="recommendation-additional-info"
            className="block text-sm font-medium text-foreground"
          >
            Información adicional, opcional
          </label>
          <textarea
            id="recommendation-additional-info"
            rows={3}
            maxLength={1000}
            value={additionalInfo}
            onChange={(event) => setAdditionalInfo(event.target.value)}
            className="block w-full box-border rounded-xl border border-solid border-muted bg-surface p-3 text-foreground"
          />
        </div>
        <Button type="submit" className="gap-2" disabled={isLoading}>
          <span aria-hidden="true">✨</span>
          {isLoading ? "Regalos en camino..." : "Haz tu magia Gifty"}
        </Button>
      </form>

      {requestError && (
        <p role="alert" className="text-sm text-error">
          {requestError}
        </p>
      )}

      {recommendations && recommendations.length > 0 && (
        <div className="mt-4 space-y-3">
          {recommendations.map((recommendation) => (
            <Card key={recommendation.giftIdeaId}>
              <h3 className="m-0 text-lg font-semibold text-primary">
                {recommendation.name}
              </h3>
              {recommendation.imageFilename && (
                <img
                  src={`/api/giftideas/images/${encodeURIComponent(recommendation.imageFilename)}`}
                  alt={`Imagen de ${recommendation.name}`}
                  loading="lazy"
                  className="mb-3 aspect-video w-full rounded-xl object-cover"
                />
              )}
              {!recommendation.imageFilename && (
                <div className="mb-3 flex aspect-video w-full items-center justify-center rounded-xl bg-accent-lavender/20 text-sm text-muted">
                  Sin imagen
                </div>
              )}
              <p className="mb-1 mt-2">{recommendation.price.toFixed(2)} €</p>
              <p className="mb-1 mt-0">
                Puntuación de afinidad: {recommendation.matchScore}
              </p>
              <p className="mb-0 mt-2">{recommendation.reason}</p>
              {recommendation.productUrl && (
                <a
                  href={recommendation.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Dónde encontrarlo ↗
                </a>
              )}
            </Card>
          ))}
        </div>
      )}

      {recommendations?.length === 0 && (
        <p role="status" className="text-sm text-muted">
          Gifty no ha podido encontrar regalos. Prueba con otras pistas...
        </p>
      )}
    </section>
  );
}
