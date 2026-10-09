import { useEffect, useState } from "react";

type LibraryPageProps = {
  accessToken: string;
};

type LibraryItemResponse = {
  id: number;
  giftIdea: {
    id: number;
    name: string;
    price: number;
    interests: string[];
  };
};

function LibraryPage({ accessToken }: LibraryPageProps) {
  const [libraryItems, setLibraryItems] = useState<LibraryItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  useEffect(() => {
    async function loadLibrary() {
      try {
        const response = await fetch("/api/library", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) {
          setErrorMessage("No se pudo cargar la biblioteca");
          setIsLoading(false);
          return;
        }
        const items = (await response.json()) as LibraryItemResponse[];
        setLibraryItems(items);
        setIsLoading(false);
      } catch {
        setErrorMessage("No se puede contactar con el servidor.");
        setIsLoading(false);
      }
    }
    void loadLibrary();
  }, [accessToken]);

  async function removeLibraryItem(itemId: number) {
    try {
      const response = await fetch(`/api/library/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
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
      setErrorMessage("No se pudo contactar con el servidor.");
    }
  }

  return (
    <main>
      <h1>Library</h1>
      {isLoading && <p>Cargando biblioteca...</p>}
      {errorMessage && <p role="alert">{errorMessage}</p>}
      {!isLoading && !errorMessage && libraryItems.length === 0 && (
        <p>Tu biblioteca está vacía.</p>
      )}
      {!isLoading && libraryItems.length > 0 && (
        <ul>
          {libraryItems.map((item) => (
            <li key={item.id}>
              {item.giftIdea.name} — {item.giftIdea.price} €
              <div>Intereses: {item.giftIdea.interests.join(", ")}</div>
              <button
                type="button"
                onClick={() => void removeLibraryItem(item.id)}
              >
                Eliminar de la biblioteca
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default LibraryPage;
