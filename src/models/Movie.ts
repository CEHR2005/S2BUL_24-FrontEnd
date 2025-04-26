/**
 * Represents a movie in the database
 */
export interface Movie {
  id: string;
  title: string;
  releaseYear: number;
  director: string;
  cast: string[];
  genre: string[];
  plot: string;
  duration: number; // in minutes
  poster_url?: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Represents the data needed to create a new movie
 */
export type CreateMovieDto = Omit<Movie, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Represents the data needed to update an existing movie
 */
export type UpdateMovieDto = Partial<CreateMovieDto>;