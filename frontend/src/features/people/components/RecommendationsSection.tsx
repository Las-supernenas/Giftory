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
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          id="recommendation-budget"
          label={
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-accent-gold"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M14.5 8.5a3.5 3.5 0 1 0 0 7M8.5 11h5M8.5 13h5" />
              </svg>
              Presupuesto máximo (€), opcional
            </span>
          }
          type="number"
          min="0.01"
          step="0.01"
          value={budget}
          onChange={(event) => setBudget(event.target.value)}
          error={budgetError}
        />
        <Input
          id="recommendation-age-range"
          label={
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-accent-gold"
              >
                <circle cx="12" cy="8" r="3" />
                <path d="M5 20a7 7 0 0 1 14 0" />
              </svg>
              Rango de edad, opcional
            </span>
          }
          placeholder="Ej.: 20–30 años"
          value={ageRange}
          onChange={(event) => setAgeRange(event.target.value)}
        />
        <Input
          id="recommendation-occasion"
          label={
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-accent-gold"
              >
                <path d="M3 9h18v4H3zM5 13v8h14v-8M12 9v12M12 9H8.5a2.5 2.5 0 1 1 2.5-2.5V9M12 9h3.5A2.5 2.5 0 1 0 13 6.5V9" />
              </svg>
              Ocasión, opcional
            </span>
          }
          placeholder="Ej.: cumpleaños"
          value={occasion}
          onChange={(event) => setOccasion(event.target.value)}
        />
        <div className="space-y-1.5">
          <label
            htmlFor="recommendation-additional-info"
            className="block text-sm font-semibold text-primary"
          >
            <span className="mb-1.5 inline-flex items-center gap-2">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-accent-gold"
              >
                <path d="M6 3.5h8l4 4V20a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 20V3.5Z" />
                <path d="M14 3.5V8h4M9 12h6M9 16h6" />
              </svg>
              Información adicional, opcional
            </span>
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
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {recommendations.map((recommendation) => (
            <Card
              key={recommendation.giftIdeaId}
              className="box-border flex h-full w-full min-w-0 flex-col"
            >
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
              <p className="mb-0 mt-2 break-words">{recommendation.reason}</p>
              <div className="mt-auto flex flex-wrap items-center gap-4 pt-3">
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
