import { useEffect, useState } from "react";
import { INTEREST_LABELS } from "../../shared/types/person";
import { Card } from "../../shared/components/Card";
import { EmptyState } from "../../shared/components/EmptyState";
import { ErrorState } from "../../shared/components/ErrorState";
import { getInterestColorStyle } from "../../shared/interest-colors";

type LibraryItemResponse = {
  id: number;
  giftIdea: {
    id: number;
    name: string;
    price: number;
    interests: string[];
  };
};

function LibraryPage() {
  const [libraryItems, setLibraryItems] = useState<LibraryItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  useEffect(() => {
    async function loadLibrary() {
      try {
        const response = await fetch("/api/library");
        if (!response.ok) {
          setErrorMessage("No se pudo cargar la biblioteca.");
          setIsLoading(false);
          return;
        }
        const items = (await response.json()) as LibraryItemResponse[];
        setLibraryItems(items);
        setIsLoading(false);
      } catch {
        setErrorMessage("No se pudo conectar con el servidor.");
        setIsLoading(false);
      }
    }
    void loadLibrary();
  }, []);

  async function removeLibraryItem(itemId: number) {
    try {
      const response = await fetch(`/api/library/${itemId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        setErrorMessage("No se pudo quitar la idea de la biblioteca.");
        return;
      }
      setErrorMessage(null);
      setLibraryItems((currentItems) =>
        currentItems.filter((item) => item.id !== itemId),
      );
    } catch {
      setErrorMessage("No se pudo conectar con el servidor.");
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="mb-8 font-serif text-3xl font-bold leading-tight tracking-tight text-primary sm:text-4xl">
        Biblioteca
      </h1>
      {isLoading && (
        <p role="status" className="text-sm text-muted">
          Cargando biblioteca...
        </p>
      )}
      {errorMessage && <ErrorState message={errorMessage} />}
      {!isLoading && !errorMessage && libraryItems.length === 0 && (
        <EmptyState message="Tu biblioteca está vacía." />
      )}
      {!isLoading && libraryItems.length > 0 && (
        <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {libraryItems.map((item) => (
            <li key={item.id}>
              <Card className="border-accent-gold/60!">
                <h2 className="mt-0 mb-2 text-lg font-semibold text-primary">
                  {item.giftIdea.name}
                </h2>
                <p className="mt-0 mb-2 text-sm text-muted">
                  {item.giftIdea.price} €
                </p>
                <div className="mb-4 flex flex-wrap gap-2">
                  {item.giftIdea.interests.map((interest) => (
                    <span
                      key={interest}
                      className={`rounded-full px-3 py-1 text-sm ${getInterestColorStyle(interest)}`}
                    >
                      {INTEREST_LABELS[interest] ?? interest}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  className="min-h-11 rounded-xl border border-error bg-surface px-4 py-2 font-medium text-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
                  onClick={() => void removeLibraryItem(item.id)}
                >
                  Eliminar de la biblioteca
                </button>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default LibraryPage;
