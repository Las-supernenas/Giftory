import { Interest } from '../Interest';
import { Person } from '../Person';

export interface CreatePersonData {
  userId: number;
  name: string;
  interests: Interest[];
}

export interface UpdatePersonData {
  name?: string;
  interests?: Interest[];
}

// Only returns ACTIVE people (deletedAt = null)
export interface PersonRepository {
  create(data: CreatePersonData): Promise<Person>;
  // All active people of a user
  findAllByUserId(userId: number): Promise<Person[]>;
  //Returns nul if the person does not exists, is deleted or belongs to another user
  findByIdAndUserId(id: number, userId: number): Promise<Person | null>;
  update(id: number, data: UpdatePersonData): Promise<Person>;
  // Soft delete: sets deletedAt, the row is kept in the database
  softDelete(id: number): Promise<void>;
}
