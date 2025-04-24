import { Rating, CreateRatingDto, MovieRating, RatingWithUser } from '../models/Rating';
import { v4 as uuidv4 } from 'uuid';
import { userService } from './UserService';

/**
 * Service for handling rating-related operations
 */
export class RatingService {
  private ratings: Rating[] = [];

  /**
   * Get the average rating for a movie
   */
  public getMovieRating(movieId: string): MovieRating {
    const movieRatings = this.ratings.filter(rating => rating.movieId === movieId);
    const totalRatings = movieRatings.length;
    
    if (totalRatings === 0) {
      return {
        movieId,
        averageScore: 0,
        totalRatings: 0
      };
    }
    
    const sum = movieRatings.reduce((total, rating) => total + rating.score, 0);
    const averageScore = sum / totalRatings;
    
    return {
      movieId,
      averageScore,
      totalRatings
    };
  }

  /**
   * Get all ratings for a movie with user information
   */
  public getRatingsByMovieId(movieId: string): RatingWithUser[] {
    return this.ratings
      .filter(rating => rating.movieId === movieId)
      .map(rating => this.addUserInfoToRating(rating))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by newest first
  }

  /**
   * Get a user's rating for a specific movie
   */
  public getUserRatingForMovie(movieId: string): Rating | undefined {
    const currentUser = userService.getCurrentUser();
    if (!currentUser) {
      return undefined;
    }
    
    return this.ratings.find(
      rating => rating.movieId === movieId && rating.userId === currentUser.id
    );
  }

  /**
   * Rate a movie or update an existing rating
   */
  public rateMovie(ratingData: CreateRatingDto): Rating {
    const currentUser = userService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User must be logged in to rate a movie');
    }

    // Check if user has already rated this movie
    const existingRating = this.ratings.find(
      rating => rating.movieId === ratingData.movieId && rating.userId === currentUser.id
    );

    if (existingRating) {
      // Update existing rating
      existingRating.score = ratingData.score;
      existingRating.updatedAt = new Date();
      return existingRating;
    } else {
      // Create new rating
      const now = new Date();
      const newRating: Rating = {
        id: uuidv4(),
        userId: currentUser.id,
        ...ratingData,
        createdAt: now,
        updatedAt: now
      };

      this.ratings.push(newRating);
      return newRating;
    }
  }

  /**
   * Delete a rating
   */
  public deleteRating(movieId: string): boolean {
    const currentUser = userService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User must be logged in to delete a rating');
    }

    const initialLength = this.ratings.length;
    this.ratings = this.ratings.filter(
      rating => !(rating.movieId === movieId && rating.userId === currentUser.id)
    );
    return this.ratings.length !== initialLength;
  }

  /**
   * Helper method to add user information to a rating
   */
  private addUserInfoToRating(rating: Rating): RatingWithUser {
    const user = userService.getUserById(rating.userId);
    if (!user) {
      throw new Error('Rating user not found');
    }

    return {
      ...rating,
      user: {
        id: user.id,
        username: user.username,
        age: user.age,
        gender: user.gender,
        country: user.country,
        continent: user.continent
      }
    };
  }
}

// Export a singleton instance
export const ratingService = new RatingService();