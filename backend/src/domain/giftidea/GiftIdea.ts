import type { Interest } from '../shared/Interest';

interface GiftIdeaProps {
  id: number;
  name: string;
  price: number;
  interests: Interest[];
  description?: string | null;
  productUrl?: string | null;
  imageFilename?: string | null;
  userId: number;
  deletedAt: Date | null;
}

export class GiftIdea {
  readonly id: number;
  readonly name: string;
  readonly price: number;
  readonly interests: Interest[];
  readonly description: string | null;
  readonly productUrl: string | null;
  readonly imageFilename: string | null;
  readonly userId: number;
  readonly deletedAt: Date | null;

  constructor(props: GiftIdeaProps) {
    this.id = props.id;
    this.name = props.name;
    this.price = props.price;
    this.interests = props.interests;
    this.description = props.description ?? null;
    this.productUrl = props.productUrl ?? null;
    this.imageFilename = props.imageFilename ?? null;
    this.userId = props.userId;
    this.deletedAt = props.deletedAt;
  }
}
