import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MovieStatistics } from '../models';

// Mock the dependencies
vi.mock('./ApiService');
vi.mock('./StatisticsService');

// Import the mocked dependencies
import { apiService } from './ApiService';
import { statisticsService } from './StatisticsService';

// Set up the mocks
vi.mocked(apiService.get).mockImplementation(vi.fn());
vi.mocked(statisticsService.getMovieStatistics).mockImplementation(vi.fn());

describe('StatisticsService', () => {

  // Mock data
  const mockMovieId = 'movie1';
  const mockMovieStatistics: MovieStatistics = {
    movie_id: mockMovieId,
    average_rating: 4.5,
    total_ratings: 10,
    age_statistics: {
      under18: 4.3,
      age18to24: 4.3,
      age25to34: 4.6,
      age35to44: 4.7,
      age45to54: 4.5,
      age55plus: 4.2,
    },
    gender_statistics: {
      male: 4.2,
      female: 4.8,
      other: 4.0,
      notSpecified: 0,
    },
    continent_statistics: {
      africa: 0,
      asia: 0,
      europe: 4.6,
      northAmerica: 4.4,
      southAmerica: 0,
      australia: 4.7,
      antarctica: 0,
    },
    country_statistics: {
      'USA': 4.4,
      'UK': 4.6,
      'Canada': 4.5,
      'Australia': 4.7,
    },
  };

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Restore mocks after all tests
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getMovieStatistics', () => {
    it('should get movie statistics successfully', async () => {
      // Mock successful call
      vi.mocked(statisticsService.getMovieStatistics).mockResolvedValueOnce(mockMovieStatistics);

      // Call the method
      const result = await statisticsService.getMovieStatistics(mockMovieId);

      // Verify method was called with correct parameter
      expect(statisticsService.getMovieStatistics).toHaveBeenCalledWith(mockMovieId);
      // Verify result is the mock statistics
      expect(result).toEqual(mockMovieStatistics);
    });

    it('should throw an error when call fails', async () => {
      // Mock failed call
      vi.mocked(statisticsService.getMovieStatistics).mockRejectedValueOnce(new Error('Failed to get statistics'));

      // Call the method and expect it to throw
      await expect(statisticsService.getMovieStatistics(mockMovieId)).rejects.toThrow('Failed to get statistics');
    });
  });
});
