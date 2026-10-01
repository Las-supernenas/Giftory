export interface SecurityService {
  hash(value: string): Promise<string>;
}