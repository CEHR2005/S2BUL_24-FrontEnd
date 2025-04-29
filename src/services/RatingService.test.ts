import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Rating, CreateRatingDto, MovieRating, RatingWithUser } from '../models';

// Mock the dependencies
vi.mock('./ApiService', () => {
  return {
    apiService: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    }
  };
});

vi.mock('./UserService', () => {
  return {
    userService: {
      getCurrentUser: vi.fn(),
    }
  };
});

// Import the dependencies
import { apiService } from './ApiService';
import { userService } from './UserService';
import { ratingService } from './RatingService';

describe('RatingService', () => {

  // Mock data
  const mockMovieId = 'movie1';
  const mockRatingId = 'rating1';
  const mockUserId = 'user1';

  const mockMovieRating: MovieRating = {
    movie_id: mockMovieId,
    average_score: 4.5,
    total_ratings: 10,
  };

  const mockRating: Rating = {
    id: mockRatingId,
    movie_id: mockMovieId,
    user_id: mockUserId,
    score: 4,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockRatingWithUser: RatingWithUser = {
    ...mockRating,
    user: {
      id: mockUserId,
      username: 'testuser',
    },
  };

  const mockCreateRatingDto: CreateRatingDto = {
    movie_id: mockMovieId,
    score: 4,
  };

  const mockCurrentUser = {
    id: mockUserId,
    username: 'testuser',
    email: 'test@example.com',
    is_admin: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Restore mocks after all tests
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getMovieRating', () => {
    it('should get movie rating successfully', async () => {
      // Mock successful API call
      vi.mocked(apiService.get).mockResolvedValueOnce(mockMovieRating);

      // Call the method
      const result = await ratingService.getMovieRating(mockMovieId);

      // Verify get was called with correct endpoint
      expect(apiService.get).toHaveBeenCalledWith(`/ratings/movie/${mockMovieId}/stats`);
      // Verify result is the mock rating
      expect(result).toEqual(mockMovieRating);
    });

    it('should return default rating when call fails', async () => {
      // Mock failed API call
      vi.mocked(apiService.get).mockRejectedValueOnce(new Error('Failed to get rating'));

      // Call the method
      const result = await ratingService.getMovieRating(mockMovieId);

      // Verify get was called with correct endpoint
      expect(apiService.get).toHaveBeenCalledWith(`/ratings/movie/${mockMovieId}/stats`);
      // Verify result is the default rating
      expect(result).toEqual({
        movie_id: mockMovieId,
        average_score: 0,
        total_ratings: 0
      });
    });
  });

  describe('getRatingsByMovieId', () => {
    it('should get ratings by movie ID successfully', async () => {
      // Mock successful API call
      vi.mocked(apiService.get).mockResolvedValueOnce([mockRatingWithUser]);

      // Call the method
      const result = await ratingService.getRatingsByMovieId(mockMovieId);

      // Verify get was called with correct endpoint
      expect(apiService.get).toHaveBeenCalledWith(`/ratings/movie/${mockMovieId}`);
      // Verify result is the mock ratings
      expect(result).toEqual([mockRatingWithUser]);
    });

    it('should throw an error when call fails', async () => {
      // Mock failed API call
      vi.mocked(apiService.get).mockRejectedValueOnce(new Error('Failed to get ratings'));

      // Call the method and expect it to throw
      await expect(ratingService.getRatingsByMovieId(mockMovieId)).rejects.toThrow('Failed to get ratings');
    });
  });

  describe('getUserRatingForMovie', () => {
    it('should get user rating for movie successfully', async () => {
      // Mock current user
      vi.mocked(userService.getCurrentUser).mockReturnValue(mockCurrentUser);
      // Mock successful API call
      vi.mocked(apiService.get).mockResolvedValueOnce([mockRatingWithUser]);

      // Call the method
      const result = await ratingService.getUserRatingForMovie(mockMovieId);

      // Verify getCurrentUser was called
      expect(userService.getCurrentUser).toHaveBeenCalled();
      // Verify get was called with correct endpoint
      expect(apiService.get).toHaveBeenCalledWith(`/ratings/movie/${mockMovieId}`);
      // Verify result is the mock rating
      expect(result).toEqual(mockRatingWithUser);
    });

    it('should return undefined when user is not logged in', async () => {
      // Mock no current user
      vi.mocked(userService.getCurrentUser).mockReturnValue(null);

      // Call the method
      const result = await ratingService.getUserRatingForMovie(mockMovieId);

      // Verify getCurrentUser was called
      expect(userService.getCurrentUser).toHaveBeenCalled();
      // Verify get was not called
      expect(apiService.get).not.toHaveBeenCalled();
      // Verify result is undefined
      expect(result).toBeUndefined();
    });

    it('should return undefined when user has not rated the movie', async () => {
      // Mock current user
      vi.mocked(userService.getCurrentUser).mockReturnValue(mockCurrentUser);
      // Mock successful API call with no matching rating
      const differentUserRating = { ...mockRatingWithUser, user_id: 'different_user_id' };
      vi.mocked(apiService.get).mockResolvedValueOnce([differentUserRating]);

      // Call the method
      const result = await ratingService.getUserRatingForMovie(mockMovieId);

      // Verify getCurrentUser was called
      expect(userService.getCurrentUser).toHaveBeenCalled();
      // Verify get was called with correct endpoint
      expect(apiService.get).toHaveBeenCalledWith(`/ratings/movie/${mockMovieId}`);
      // Verify result is undefined
      expect(result).toBeUndefined();
    });

    it('should return undefined when API call fails', async () => {
      // Mock current user
      vi.mocked(userService.getCurrentUser).mockReturnValue(mockCurrentUser);
      // Mock failed API call
      vi.mocked(apiService.get).mockRejectedValueOnce(new Error('Failed to get ratings'));

      // Call the method
      const result = await ratingService.getUserRatingForMovie(mockMovieId);

      // Verify getCurrentUser was called
      expect(userService.getCurrentUser).toHaveBeenCalled();
      // Verify get was called with correct endpoint
      expect(apiService.get).toHaveBeenCalledWith(`/ratings/movie/${mockMovieId}`);
      // Verify result is undefined
      expect(result).toBeUndefined();
    });
  });

  describe('rateMovie', () => {
    it('should rate a movie successfully', async () => {
      // Mock current user
      vi.mocked(userService.getCurrentUser).mockReturnValue(mockCurrentUser);
      // Mock successful API call
      vi.mocked(apiService.post).mockResolvedValueOnce(mockRating);

      // Call the method
      const result = await ratingService.rateMovie(mockCreateRatingDto);

      // Verify getCurrentUser was called
      expect(userService.getCurrentUser).toHaveBeenCalled();
      // Verify post was called with correct data
      expect(apiService.post).toHaveBeenCalledWith('/ratings', mockCreateRatingDto);
      // Verify result is the mock rating
      expect(result).toEqual(mockRating);
    });

    it('should throw an error when user is not logged in', async () => {
      // Mock no current user
      vi.mocked(userService.getCurrentUser).mockReturnValue(null);

      // Call the method and expect it to throw
      await expect(ratingService.rateMovie(mockCreateRatingDto)).rejects.toThrow('User must be logged in to rate a movie');
    });

    it('should throw an error when API call fails', async () => {
      // Mock current user
      vi.mocked(userService.getCurrentUser).mockReturnValue(mockCurrentUser);
      // Mock failed API call
      vi.mocked(apiService.post).mockRejectedValueOnce(new Error('Failed to rate movie'));

      // Call the method and expect it to throw
      await expect(ratingService.rateMovie(mockCreateRatingDto)).rejects.toThrow('Failed to rate movie');
    });
  });

  describe('deleteRating', () => {
    it('should delete a rating successfully', async () => {
      // Mock current user
      vi.mocked(userService.getCurrentUser).mockReturnValue(mockCurrentUser);
      // Mock successful API call
      vi.mocked(apiService.delete).mockResolvedValueOnce(undefined);

      // Call the method
      const result = await ratingService.deleteRating(mockRatingId);

      // Verify getCurrentUser was called
      expect(userService.getCurrentUser).toHaveBeenCalled();
      // Verify delete was called with correct endpoint
      expect(apiService.delete).toHaveBeenCalledWith(`/ratings/${mockRatingId}`);
      // Verify result is true
      expect(result).toBe(true);
    });

    it('should throw an error when user is not logged in', async () => {
      // Mock no current user
      vi.mocked(userService.getCurrentUser).mockReturnValue(null);

      // Call the method and expect it to throw
      await expect(ratingService.deleteRating(mockRatingId)).rejects.toThrow('User must be logged in to delete a rating');
    });

    it('should throw an error when API call fails', async () => {
      // Mock current user
      vi.mocked(userService.getCurrentUser).mockReturnValue(mockCurrentUser);
      // Mock failed API call
      vi.mocked(apiService.delete).mockRejectedValueOnce(new Error('Failed to delete rating'));

      // Call the method and expect it to throw
      await expect(ratingService.deleteRating(mockRatingId)).rejects.toThrow('Failed to delete rating');
    });
  });
});
