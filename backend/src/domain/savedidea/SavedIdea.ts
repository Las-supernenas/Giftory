import { GiftIdea } from '../giftidea/GiftIdea';

interface SavedIdeaProps {
  id: number;
  personId: number;
  giftIdeaId: number;
  giftIdea: GiftIdea;
}

export class SavedIdea {
  readonly id: number;
  readonly personId: number;
  readonly giftIdeaId: number;
  readonly giftIdea: GiftIdea;

  constructor(props: SavedIdeaProps) {
    this.id = props.id;
    this.personId = props.personId;
    this.giftIdeaId = props.giftIdeaId;
    this.giftIdea = props.giftIdea;
  }
}
