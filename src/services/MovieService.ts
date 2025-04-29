import { Movie, CreateMovieDto, UpdateMovieDto } from '../models';
import { apiService } from './ApiService';

/**
 * Interface representing a movie as returned from the API (snake_case format)
 */
interface ApiMovie {
  id: string;
  title: string;
  release_year: number;
  director: string;
  cast: string[];
  genre: string[];
  plot: string;
  duration: number;
  poster_url?: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Service for handling movie-related operations
 */
export class MovieService {
  /**
   * Transform movie data from API format to frontend format
   */
  private transformMovieFromApi(apiMovie: ApiMovie): Movie {
    // No need to convert between naming conventions
    return apiMovie;
  }

  /**
   * Transform movie data from frontend format to API format
   */
  private transformMovieToApi(movie: Partial<Movie>): Partial<ApiMovie> {
    // No need to convert between naming conventions
    return movie;
  }
  /**
   * Get all movies
   */
  public async getAllMovies(): Promise<Movie[]> {
    try {
      const response = await apiService.get<ApiMovie[]>('/movies');
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
      const response = await apiService.get<ApiMovie>(`/movies/${id}`);
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
      const response = await apiService.post<ApiMovie>('/movies', apiMovieData);
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
      const response = await apiService.put<ApiMovie>(`/movies/${id}`, apiMovieData);
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
   * Search for movies by title, director, genre, or rating
   */
  public async searchMovies(params: { title?: string; director?: string; genre?: string; rating?: number }): Promise<Movie[]> {
    try {
      // Build query string from provided parameters
      const queryParts: string[] = [];

      if (params.title) {
        queryParts.push(`title=${encodeURIComponent(params.title)}`);
      }

      if (params.director) {
        queryParts.push(`director=${encodeURIComponent(params.director)}`);
      }

      if (params.genre) {
        queryParts.push(`genre=${encodeURIComponent(params.genre)}`);
      }

      if (params.rating !== undefined) {
        queryParts.push(`rating=${encodeURIComponent(params.rating.toString())}`);
      }

      const queryString = queryParts.join('&');
      const url = `/movies${queryString ? `?${queryString}` : ''}`;

      const response = await apiService.get<ApiMovie[]>(url);
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
