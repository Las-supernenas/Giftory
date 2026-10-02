

interface UserProps {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
}

export class User {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly passwordHash: string;

  constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
  }
}