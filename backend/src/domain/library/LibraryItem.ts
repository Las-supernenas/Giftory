import { GiftIdea } from '../giftidea/GiftIdea';

interface LibraryItemProps {
  id: number;
  userId: number;
  giftIdeaId: number;
  giftIdea: GiftIdea;
}

export class LibraryItem {
  readonly id: number;
  readonly userId: number;
  readonly giftIdeaId: number;
  readonly giftIdea: GiftIdea;

  constructor(props: LibraryItemProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.giftIdeaId = props.giftIdeaId;
    this.giftIdea = props.giftIdea;
  }
}
