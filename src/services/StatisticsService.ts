import { 
  MovieStatistics, 
} from '../models';
import { apiService } from './ApiService';

/**
 * Service for generating statistics from movie ratings
 */
export class StatisticsService {
  /**
   * Get comprehensive statistics for a movie
   */
  public async getMovieStatistics(movieId: string): Promise<MovieStatistics> {
    try {
      // Get statistics directly from the backend
      return await apiService.get<MovieStatistics>(`/statistics/movie/${movieId}`);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to get movie statistics');
    }
  }
}

// Export a singleton instance
export const statisticsService = new StatisticsService();
