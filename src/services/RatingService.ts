import { Rating, CreateRatingDto, MovieRating, RatingWithUser } from '../models/Rating';
import { apiService } from './ApiService';
import { userService } from './UserService';

/**
 * Service for handling rating-related operations
 */
export class RatingService {
  /**
   * Get the average rating for a movie
   */
  public async getMovieRating(movieId: string): Promise<MovieRating> {
    try {
      return await apiService.get<MovieRating>(`/ratings/movie/${movieId}/stats`);
    } catch (error) {
      // If there's an error or no ratings, return a default rating
      return {
        movieId,
        averageScore: 0,
        totalRatings: 0
      };
    }
  }

  /**
   * Get all ratings for a movie with user information
   */
  public async getRatingsByMovieId(movieId: string): Promise<RatingWithUser[]> {
    try {
      return await apiService.get<RatingWithUser[]>(`/ratings/movie/${movieId}`);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to get ratings');
    }
  }

  /**
   * Get a user's rating for a specific movie
   * Note: This is a client-side function that requires fetching all ratings
   * and filtering them, as the backend doesn't have a specific endpoint for this
   */
  public async getUserRatingForMovie(movieId: string): Promise<Rating | undefined> {
    try {
      const currentUser = userService.getCurrentUser();
      if (!currentUser) {
        return undefined;
      }

      const ratings = await this.getRatingsByMovieId(movieId);
      return ratings.find(rating => rating.userId === currentUser.id);
    } catch (error) {
      console.error('Error getting user rating:', error);
      return undefined;
    }
  }

  /**
   * Rate a movie or update an existing rating
   */
  public async rateMovie(ratingData: CreateRatingDto): Promise<Rating> {
    try {
      const currentUser = userService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User must be logged in to rate a movie');
      }

      // The backend handles both creating and updating ratings
      return await apiService.post<Rating>('/ratings', ratingData);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to rate movie');
    }
  }

  /**
   * Delete a rating
   */
  public async deleteRating(ratingId: string): Promise<boolean> {
    try {
      const currentUser = userService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User must be logged in to delete a rating');
      }

      await apiService.delete<void>(`/ratings/${ratingId}`);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to delete rating');
    }
  }
}

// Export a singleton instance
export const ratingService = new RatingService();
