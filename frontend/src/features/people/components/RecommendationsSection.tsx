import { useEffect, useState, type FormEvent } from "react";
import { Input } from "../../shared/components/Input";
import { Button } from "../../shared/components/Button";
import { Card } from "../../shared/components/Card";
import {
  addSavedIdea,
  getSavedIdeas,
} from "../../savedideas/services/savedideas-service";
import { getRecommendations } from "../services/recommendations-service";
import type {
  GiftRecommendation,
  RecommendationRequest,
} from "../types/recommendation";

type RecommendationsSectionProps = {
  personId: number;
  personName: string;
  savedIdeasVersion?: number;
  onSavedIdeasChanged?: () => void;
};

export function RecommendationsSection({
  personId,
  personName,
  savedIdeasVersion = 0,
  onSavedIdeasChanged,
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
  const [savedGiftIdeaIds, setSavedGiftIdeaIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [isLoadingSavedIdeas, setIsLoadingSavedIdeas] = useState(false);
  const [savedIdeasLoadError, setSavedIdeasLoadError] = useState("");
  const [savingGiftIdeaId, setSavingGiftIdeaId] = useState<number | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<{
    giftIdeaId: number;
    kind: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!recommendations?.length) return;

    let active = true;
    async function loadSavedGiftIdeaIds() {
      setIsLoadingSavedIdeas(true);
      setSavedIdeasLoadError("");
      try {
        const savedIdeas = await getSavedIdeas(personId);
        if (active) {
          setSavedGiftIdeaIds(
            new Set(savedIdeas.map((savedIdea) => savedIdea.giftIdea.id)),
          );
        }
      } catch {
        if (active) {
          setSavedIdeasLoadError(
            "No se pudo comprobar qué ideas están guardadas. Puedes intentar guardarlas.",
          );
        }
      } finally {
        if (active) setIsLoadingSavedIdeas(false);
      }
    }
    void loadSavedGiftIdeaIds();
    return () => {
      active = false;
    };
  }, [personId, recommendations, savedIdeasVersion]);

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
    setSaveFeedback(null);
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

  async function handleSaveRecommendation(giftIdeaId: number) {
    if (
      savingGiftIdeaId !== null ||
      isLoadingSavedIdeas ||
      savedGiftIdeaIds.has(giftIdeaId)
    ) {
      return;
    }

    setSavingGiftIdeaId(giftIdeaId);
    setSaveFeedback(null);

    try {
      await addSavedIdea(personId, giftIdeaId);
      setSavedGiftIdeaIds((current) => new Set(current).add(giftIdeaId));
      setSaveFeedback({
        giftIdeaId,
        kind: "success",
        message: "Idea guardada para esta persona.",
      });
      onSavedIdeasChanged?.();
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Esta idea ya está guardada para esta persona."
      ) {
        setSavedGiftIdeaIds((current) => new Set(current).add(giftIdeaId));
        setSaveFeedback({
          giftIdeaId,
          kind: "success",
          message: "Esta idea ya estaba guardada para esta persona.",
        });
        onSavedIdeasChanged?.();
      } else {
        setSaveFeedback({
          giftIdeaId,
          kind: "error",
          message:
            error instanceof Error
              ? error.message
              : "No se pudo guardar la idea para esta persona.",
        });
      }
    } finally {
      setSavingGiftIdeaId(null);
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

      {recommendations && recommendations.length > 0 && savedIdeasLoadError && (
        <p role="alert" className="text-sm text-error">
          {savedIdeasLoadError}
        </p>
      )}

      {recommendations && recommendations.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {recommendations.map((recommendation) => (
            <Card key={recommendation.giftIdeaId} className="w-full min-w-0 sm:w-80">
              <h3 className="m-0 text-lg font-semibold text-primary">
                {recommendation.name}
              </h3>
              {recommendation.imageFilename && (
                <img
                  src={`/api/giftideas/images/${encodeURIComponent(recommendation.imageFilename)}`}
                  alt={`Imagen de ${recommendation.name}`}
                  loading="lazy"
                  className="mb-3 aspect-video w-full max-w-64 rounded-xl object-cover"
                />
              )}
              {!recommendation.imageFilename && (
                <div className="mb-3 flex aspect-video w-full max-w-64 items-center justify-center rounded-xl bg-accent-lavender/20 text-sm text-muted">
                  Sin imagen
                </div>
              )}
              <p className="mb-1 mt-2">{recommendation.price.toFixed(2)} €</p>
              <p className="mb-1 mt-0">
                Puntuación de afinidad: {recommendation.matchScore}
              </p>
              <p className="mb-0 mt-2">{recommendation.reason}</p>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                {recommendation.productUrl && (
                  <a
                    href={recommendation.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    Dónde encontrarlo ↗
                  </a>
                )}
                <Button
                  className="w-full sm:w-fit"
                  disabled={
                    isLoadingSavedIdeas ||
                    savingGiftIdeaId !== null ||
                    savedGiftIdeaIds.has(recommendation.giftIdeaId)
                  }
                  onClick={() =>
                    void handleSaveRecommendation(recommendation.giftIdeaId)
                  }
                >
                  {savedGiftIdeaIds.has(recommendation.giftIdeaId)
                    ? "Guardada para esta persona"
                    : savingGiftIdeaId === recommendation.giftIdeaId
                      ? "Guardando..."
                      : "Guardar para esta persona"}
                </Button>
              </div>
              {saveFeedback?.giftIdeaId === recommendation.giftIdeaId && (
                <p
                  role={saveFeedback.kind === "error" ? "alert" : "status"}
                  className={`mt-2 text-sm ${saveFeedback.kind === "error" ? "text-error" : "text-primary"}`}
                >
                  {saveFeedback.message}
                </p>
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
