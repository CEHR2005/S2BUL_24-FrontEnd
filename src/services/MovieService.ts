import { Movie, CreateMovieDto, UpdateMovieDto } from '../models';
import { apiService } from './ApiService';

/**
 * Service for handling movie-related operations
 */
export class MovieService {
  /**
   * Transform movie data from API format to frontend format
   */
  private transformMovieFromApi(apiMovie: any): Movie {
    // Convert from snake_case to camelCase for releaseYear
    const { release_year, ...rest } = apiMovie;
    return {
      ...rest,
      releaseYear: release_year,
    };
  }

  /**
   * Transform movie data from frontend format to API format
   */
  private transformMovieToApi(movie: Partial<Movie>): any {
    // Convert from camelCase to snake_case for releaseYear
    const { releaseYear, ...rest } = movie;
    return {
      ...rest,
      release_year: releaseYear,
    };
  }
  /**
   * Get all movies
   */
  public async getAllMovies(): Promise<Movie[]> {
    try {
      const response = await apiService.get<any[]>('/movies');
      // Transform response to match frontend model
      return response.map(movie => this.transformMovieFromApi(movie));
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
      const response = await apiService.get<any>(`/movies/${id}`);
      // Transform response to match frontend model
      return this.transformMovieFromApi(response);
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
      // Transform movie data to match API expectations
      const apiMovieData = this.transformMovieToApi(movieData);
      const response = await apiService.post<any>('/movies', apiMovieData);
      // Transform response to match frontend model
      return this.transformMovieFromApi(response);
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
      // Transform movie data to match API expectations
      const apiMovieData = this.transformMovieToApi(movieData);
      const response = await apiService.put<any>(`/movies/${id}`, apiMovieData);
      // Transform response to match frontend model
      return this.transformMovieFromApi(response);
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
      const response = await apiService.get<any[]>(`/movies?title=${encodeURIComponent(query)}`);
      // Transform response to match frontend model
      return response.map(movie => this.transformMovieFromApi(movie));
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
