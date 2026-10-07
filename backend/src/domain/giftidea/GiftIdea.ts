import type { Interest } from '../shared/Interest';

interface GiftIdeaProps {
  id: number;
  name: string;
  price: number;
  interests: Interest[];
  userId: number;
  deletedAt: Date | null;
}

export class GiftIdea {
  readonly id: number;
  readonly name: string;
  readonly price: number;
  readonly interests: Interest[];
  readonly userId: number;
  readonly deletedAt: Date | null;

  constructor(props: GiftIdeaProps) {
    this.id = props.id;
    this.name = props.name;
    this.price = props.price;
    this.interests = props.interests;
    this.userId = props.userId;
    this.deletedAt = props.deletedAt;
  }
}
