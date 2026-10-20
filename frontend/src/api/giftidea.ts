export type Interest = string;

export type GiftIdea = {
  id: number;
  name: string;
  price: number;
  interests: Interest[];
  description: string | null;
  productUrl: string | null;
  imageFilename: string | null;
};

export type CreateGiftIdeaInput = {
  name: string;
  price: number;
  interests?: Interest[];
  description?: string | null;
  productUrl?: string | null;
};

async function checkResponse(response: Response): Promise<void> {
  if (!response.ok) {
    throw new Error("Ha ocurrido un error. Inténtalo de nuevo.");
  }
}

export async function getGiftIdeas(): Promise<GiftIdea[]> {
  const response = await fetch("/api/giftideas");
  await checkResponse(response);

  return (await response.json()) as GiftIdea[];
}

export async function getGiftIdea(id: number): Promise<GiftIdea> {
  const response = await fetch(`/api/giftideas/${id}`);
  await checkResponse(response);

  return (await response.json()) as GiftIdea;
}

export async function createGiftIdea(
  input: CreateGiftIdeaInput,
): Promise<GiftIdea> {
  const response = await fetch("/api/giftideas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  await checkResponse(response);

  return (await response.json()) as GiftIdea;
}

export async function updateGiftIdea(
  id: number,
  input: CreateGiftIdeaInput,
): Promise<GiftIdea> {
  const response = await fetch(`/api/giftideas/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  await checkResponse(response);
  return (await response.json()) as GiftIdea;
}

export async function uploadGiftIdeaImage(
  id: number,
  file: File,
): Promise<{ imageFilename: string }> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`/api/giftideas/${id}/image`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(data?.error ?? "No se pudo subir la imagen.");
  }

  return (await response.json()) as { imageFilename: string };
}

export async function deleteGiftIdeaImage(id: number): Promise<void> {
  const response = await fetch(`/api/giftideas/${id}/image`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(data?.error ?? "No se pudo quitar la imagen.");
  }
}
