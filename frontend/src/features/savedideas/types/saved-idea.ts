import type { GiftIdea } from "../../../api/giftidea";

export type SavedIdea = {
  id: number;
  giftIdea: GiftIdea;
  privateNote: string | null;
};
