/**
 * Represents a rating for a movie
 */
export interface Rating {
  id: string;
  movie_id: string;
  user_id: string;
  score: number; // 1-10 rating scale
  created_at: Date;
  updated_at: Date;
}

/**
 * Represents the data needed to create or update a rating
 */
export type CreateRatingDto = Pick<Rating, 'movie_id' | 'score'>;

/**
 * Represents the average rating for a movie
 */
export interface MovieRating {
  movie_id: string;
  average_score: number;
  total_ratings: number;
}

/**
 * Represents a rating with user information
 */
export interface RatingWithUser extends Rating {
  user: {
    id: string;
    username: string;
    age?: number;
    gender?: string;
    country?: string;
    continent?: string;
  };
}
