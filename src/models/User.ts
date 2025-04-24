/**
 * Represents a user in the database
 */
export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // This would be hashed in a real application
  firstName?: string;
  lastName?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer not to say';
  country?: string;
  continent?: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Represents the data needed to register a new user
 */
export type RegisterUserDto = Pick<User, 'username' | 'email' | 'password' | 'firstName' | 'lastName' | 'age' | 'gender' | 'country'>;

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