export type Interest = string;

export type GiftIdea = {
  id: number;
  name: string;
  price: number;
  interests: Interest[];
};

export type CreateGiftIdeaInput = {
  name: string;
  price: number;
  interests?: Interest[];
};

async function checkResponse(response: Response): Promise<void> {
  if (!response.ok) {
    throw new Error(`Gift idea request failed (HTTP ${response.status})`);
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

export async function getInterests(): Promise<Interest[]> {
  const response = await fetch("/api/interests");
  await checkResponse(response);

  return (await response.json()) as Interest[];
}

export async function createGiftIdea(
  input: CreateGiftIdeaInput,
  accessToken: string,
): Promise<GiftIdea> {
  const response = await fetch("/api/giftideas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(input),
  });
  await checkResponse(response);

  return (await response.json()) as GiftIdea;
}
