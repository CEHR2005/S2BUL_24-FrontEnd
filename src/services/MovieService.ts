import { Movie, CreateMovieDto, UpdateMovieDto } from '../models';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service for handling movie-related operations
 */
export class MovieService {
  private movies: Movie[] = [];

  /**
   * Get all movies
   */
  public getAllMovies(): Movie[] {
    return this.movies;
  }

  /**
   * Get a movie by ID
   */
  public getMovieById(id: string): Movie | undefined {
    return this.movies.find(movie => movie.id === id);
  }

  /**
   * Create a new movie
   */
  public createMovie(movieData: CreateMovieDto): Movie {
    const now = new Date();
    const newMovie: Movie = {
      id: uuidv4(),
      ...movieData,
      createdAt: now,
      updatedAt: now
    };

    this.movies.push(newMovie);
    return newMovie;
  }

  /**
   * Update an existing movie
   */
  public updateMovie(id: string, movieData: UpdateMovieDto): Movie | undefined {
    const movieIndex = this.movies.findIndex(movie => movie.id === id);
    if (movieIndex === -1) {
      return undefined;
    }

    const updatedMovie: Movie = {
      ...this.movies[movieIndex],
      ...movieData,
      updatedAt: new Date()
    };

    this.movies[movieIndex] = updatedMovie;
    return updatedMovie;
  }

  /**
   * Delete a movie
   */
  public deleteMovie(id: string): boolean {
    const initialLength = this.movies.length;
    this.movies = this.movies.filter(movie => movie.id !== id);
    return this.movies.length !== initialLength;
  }

  /**
   * Search for movies by title, director, or genre
   */
  public searchMovies(query: string): Movie[] {
    const lowerCaseQuery = query.toLowerCase();
    return this.movies.filter(movie => 
      movie.title.toLowerCase().includes(lowerCaseQuery) ||
      movie.director.toLowerCase().includes(lowerCaseQuery) ||
      movie.genre.some(g => g.toLowerCase().includes(lowerCaseQuery))
    );
  }
}

// Export a singleton instance
export const movieService = new MovieService();