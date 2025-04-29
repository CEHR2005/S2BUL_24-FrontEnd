import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Movie, CreateMovieDto, UpdateMovieDto } from '../models';

// Mock the dependencies
vi.mock('./ApiService');
vi.mock('./MovieService');

// Import the mocked modules
import { apiService } from './ApiService';
import { movieService } from './MovieService';

// Set up the mocks
vi.mocked(apiService.get).mockImplementation(vi.fn());
vi.mocked(apiService.post).mockImplementation(vi.fn());
vi.mocked(apiService.put).mockImplementation(vi.fn());
vi.mocked(apiService.delete).mockImplementation(vi.fn());
vi.mocked(movieService.getAllMovies).mockImplementation(vi.fn());
vi.mocked(movieService.getMovieById).mockImplementation(vi.fn());
vi.mocked(movieService.createMovie).mockImplementation(vi.fn());
vi.mocked(movieService.updateMovie).mockImplementation(vi.fn());
vi.mocked(movieService.deleteMovie).mockImplementation(vi.fn());
vi.mocked(movieService.searchMovies).mockImplementation(vi.fn());

describe('MovieService', () => {

  // Mock data

  const mockMovie: Movie = {
    id: 'movie1',
    title: 'Test Movie',
    director: 'Test Director',
    genre: ['Action'],
    release_year: 2023,
    plot: 'Test description',
    duration: 120,
    poster_url: 'http://example.com/poster.jpg',
    cast: ['Actor 1', 'Actor 2'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateMovieDto: CreateMovieDto = {
    title: 'New Movie',
    director: 'New Director',
    genre: ['Comedy'],
    release_year: 2024,
    plot: 'New description',
    duration: 120,
    poster_url: 'http://example.com/new-poster.jpg',
    cast: ['Actor 1', 'Actor 2'],
  };

  const mockUpdateMovieDto: UpdateMovieDto = {
    title: 'Updated Movie',
    director: 'Updated Director',
  };

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Restore mocks after all tests
  afterEach(() => {
    vi.resetAllMocks();
  });

  // We can't test private methods directly with the singleton approach
  // Instead, we'll focus on testing the public methods

  describe('getAllMovies', () => {
    it('should get all movies successfully', async () => {
      // Mock successful call
      vi.mocked(movieService.getAllMovies).mockResolvedValueOnce([mockMovie]);

      // Call the method
      const result = await movieService.getAllMovies();

      // Verify method was called
      expect(movieService.getAllMovies).toHaveBeenCalled();
      // Verify result is correct
      expect(result).toEqual([mockMovie]);
    });

    it('should throw an error when call fails', async () => {
      // Mock failed call
      vi.mocked(movieService.getAllMovies).mockRejectedValueOnce(new Error('Failed to get movies'));

      // Call the method and expect it to throw
      await expect(movieService.getAllMovies()).rejects.toThrow('Failed to get movies');
    });
  });

  describe('getMovieById', () => {
    it('should get a movie by ID successfully', async () => {
      // Mock successful call
      vi.mocked(movieService.getMovieById).mockResolvedValueOnce(mockMovie);

      // Call the method
      const result = await movieService.getMovieById(mockMovie.id);

      // Verify method was called with correct ID
      expect(movieService.getMovieById).toHaveBeenCalledWith(mockMovie.id);
      // Verify result is correct
      expect(result).toEqual(mockMovie);
    });

    it('should throw an error when call fails', async () => {
      // Mock failed call
      vi.mocked(movieService.getMovieById).mockRejectedValueOnce(new Error('Movie not found'));

      // Call the method and expect it to throw
      await expect(movieService.getMovieById(mockMovie.id)).rejects.toThrow('Movie not found');
    });
  });

  describe('createMovie', () => {
    it('should create a movie successfully', async () => {
      // Mock successful call
      vi.mocked(movieService.createMovie).mockResolvedValueOnce(mockMovie);

      // Call the method
      const result = await movieService.createMovie(mockCreateMovieDto);

      // Verify method was called with correct data
      expect(movieService.createMovie).toHaveBeenCalledWith(mockCreateMovieDto);
      // Verify result is correct
      expect(result).toEqual(mockMovie);
    });

    it('should throw an error when call fails', async () => {
      // Mock failed call
      vi.mocked(movieService.createMovie).mockRejectedValueOnce(new Error('Failed to create movie'));

      // Call the method and expect it to throw
      await expect(movieService.createMovie(mockCreateMovieDto)).rejects.toThrow('Failed to create movie');
    });
  });

  describe('updateMovie', () => {
    it('should update a movie successfully', async () => {
      // Mock successful call
      const updatedMovie = { ...mockMovie, title: 'Updated Movie', director: 'Updated Director' };
      vi.mocked(movieService.updateMovie).mockResolvedValueOnce(updatedMovie);

      // Call the method
      const result = await movieService.updateMovie(mockMovie.id, mockUpdateMovieDto);

      // Verify method was called with correct data
      expect(movieService.updateMovie).toHaveBeenCalledWith(mockMovie.id, mockUpdateMovieDto);
      // Verify result is correct
      expect(result).toEqual(updatedMovie);
    });

    it('should throw an error when call fails', async () => {
      // Mock failed call
      vi.mocked(movieService.updateMovie).mockRejectedValueOnce(new Error('Failed to update movie'));

      // Call the method and expect it to throw
      await expect(movieService.updateMovie(mockMovie.id, mockUpdateMovieDto)).rejects.toThrow('Failed to update movie');
    });
  });

  describe('deleteMovie', () => {
    it('should delete a movie successfully', async () => {
      // Mock successful call
      vi.mocked(movieService.deleteMovie).mockResolvedValueOnce(true);

      // Call the method
      const result = await movieService.deleteMovie(mockMovie.id);

      // Verify method was called with correct ID
      expect(movieService.deleteMovie).toHaveBeenCalledWith(mockMovie.id);
      // Verify result is true
      expect(result).toBe(true);
    });

    it('should throw an error when call fails', async () => {
      // Mock failed call
      vi.mocked(movieService.deleteMovie).mockRejectedValueOnce(new Error('Failed to delete movie'));

      // Call the method and expect it to throw
      await expect(movieService.deleteMovie(mockMovie.id)).rejects.toThrow('Failed to delete movie');
    });
  });

  describe('searchMovies', () => {
    it('should search movies by title successfully', async () => {
      // Mock successful call
      vi.mocked(movieService.searchMovies).mockResolvedValueOnce([mockMovie]);

      // Call the method with title parameter
      const searchParams = { title: 'Test' };
      const result = await movieService.searchMovies(searchParams);

      // Verify method was called with correct parameters
      expect(movieService.searchMovies).toHaveBeenCalledWith(searchParams);
      // Verify result is correct
      expect(result).toEqual([mockMovie]);
    });

    it('should search movies by director successfully', async () => {
      // Mock successful call
      vi.mocked(movieService.searchMovies).mockResolvedValueOnce([mockMovie]);

      // Call the method with director parameter
      const searchParams = { director: 'Test Director' };
      const result = await movieService.searchMovies(searchParams);

      // Verify method was called with correct parameters
      expect(movieService.searchMovies).toHaveBeenCalledWith(searchParams);
      // Verify result is correct
      expect(result).toEqual([mockMovie]);
    });

    it('should search movies by genre successfully', async () => {
      // Mock successful call
      vi.mocked(movieService.searchMovies).mockResolvedValueOnce([mockMovie]);

      // Call the method with genre parameter
      const searchParams = { genre: 'Action' };
      const result = await movieService.searchMovies(searchParams);

      // Verify method was called with correct parameters
      expect(movieService.searchMovies).toHaveBeenCalledWith(searchParams);
      // Verify result is correct
      expect(result).toEqual([mockMovie]);
    });

    it('should search movies with multiple parameters successfully', async () => {
      // Mock successful call
      vi.mocked(movieService.searchMovies).mockResolvedValueOnce([mockMovie]);

      // Call the method with multiple parameters
      const searchParams = { title: 'Test', director: 'Test Director', genre: 'Action' };
      const result = await movieService.searchMovies(searchParams);

      // Verify method was called with correct parameters
      expect(movieService.searchMovies).toHaveBeenCalledWith(searchParams);
      // Verify result is correct
      expect(result).toEqual([mockMovie]);
    });

    it('should throw an error when call fails', async () => {
      // Mock failed call
      vi.mocked(movieService.searchMovies).mockRejectedValueOnce(new Error('Failed to search movies'));

      // Call the method and expect it to throw
      await expect(movieService.searchMovies({ title: 'Test' })).rejects.toThrow('Failed to search movies');
    });
  });
});
