interface EventProps {
  id: number;
  personId: number;
  name: string;
  date: string; //string to avoid date with hours
}

// Its an important date od a person (birthday, anniversary)
// it belongs to one person from an especific user
//date is a calendar day in "YYYY-MM-DD" format, without time or timezone.

export class Event {
  readonly id: number;
  readonly personId: number;
  readonly name: string;
  readonly date: string;

  constructor(props: EventProps) {
    this.id = props.id;
    this.personId = props.personId;
    this.name = props.name;
    this.date = props.date;
  }
}
