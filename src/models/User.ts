/**
 * Represents a user in the database
 */
export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // This would be hashed in a real application
  first_name?: string;
  last_name?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer not to say';
  country?: string;
  continent?: string;
  isAdmin: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Represents the data needed to register a new user
 */
export type RegisterUserDto = Pick<User, 'username' | 'email' | 'password' | 'first_name' | 'last_name' | 'age' | 'gender' | 'country'>;

/**
 * Represents the data needed to login a user
 */
export type LoginUserDto = Pick<User, 'email' | 'password'>;

/**
 * Represents the data needed to update a user profile
 */
export type UpdateUserDto = Partial<Omit<User, 'id' | 'email' | 'password' | 'isAdmin' | 'createdAt' | 'updatedAt'>>;

/**
 * Represents a user without sensitive information
 */
export type SafeUser = Omit<User, 'password'>;