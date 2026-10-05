import { Interest } from './Interest';

interface PersonProps {
  id: number;
  userId: number;
  name: string;
  interests: Interest[];
}

// a person the user buys gifts for. Its private, it always belongs to one user (userId)

export class Person {
  readonly id: number;
  readonly userId: number;
  readonly name: string;
  readonly interests: Interest[];

  constructor(props: PersonProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.name = props.name;
    this.interests = props.interests;
  }
}
