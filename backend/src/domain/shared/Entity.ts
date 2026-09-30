export interface EntityProps {
  id: number;
}

export class Entity {
  readonly id: number;

  constructor(props: EntityProps) {
    this.id = props.id;
  }
}
