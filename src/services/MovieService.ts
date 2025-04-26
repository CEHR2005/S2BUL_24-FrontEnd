import { Movie, CreateMovieDto, UpdateMovieDto } from '../models';
import { apiService } from './ApiService';

/**
 * Service for handling movie-related operations
 */
export class MovieService {
  /**
   * Get all movies
   */
  public async getAllMovies(): Promise<Movie[]> {
    try {
      return await apiService.get<Movie[]>('/movies');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to get movies');
    }
  }

  /**
   * Get a movie by ID
   */
  public async getMovieById(id: string): Promise<Movie> {
    try {
      return await apiService.get<Movie>(`/movies/${id}`);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to get movie');
    }
  }

  /**
   * Create a new movie
   */
  public async createMovie(movieData: CreateMovieDto): Promise<Movie> {
    try {
      return await apiService.post<Movie>('/movies', movieData);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to create movie');
    }
  }

  /**
   * Update an existing movie
   */
  public async updateMovie(id: string, movieData: UpdateMovieDto): Promise<Movie> {
    try {
      return await apiService.put<Movie>(`/movies/${id}`, movieData);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to update movie');
    }
  }

  /**
   * Delete a movie
   */
  public async deleteMovie(id: string): Promise<boolean> {
    try {
      await apiService.delete<void>(`/movies/${id}`);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to delete movie');
    }
  }

  /**
   * Search for movies by title, director, or genre
   */
  public async searchMovies(query: string): Promise<Movie[]> {
    try {
      // Use the query parameters to search for movies
      return await apiService.get<Movie[]>(`/movies?title=${encodeURIComponent(query)}`);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to search movies');
    }
  }
}

// Export a singleton instance
export const movieService = new MovieService();
