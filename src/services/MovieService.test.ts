import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Movie, CreateMovieDto, UpdateMovieDto } from '../models';

// Mock only the ApiService dependency
vi.mock('./ApiService');

// Import the modules
import { apiService } from './ApiService';
import { movieService } from './MovieService';

// Set up the ApiService mocks
vi.mocked(apiService.get).mockImplementation(vi.fn());
vi.mocked(apiService.post).mockImplementation(vi.fn());
vi.mocked(apiService.put).mockImplementation(vi.fn());
vi.mocked(apiService.delete).mockImplementation(vi.fn());

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
      // Mock successful API response
      vi.mocked(apiService.get).mockResolvedValueOnce([mockMovie]);

      // Call the method
      const result = await movieService.getAllMovies();

      // Verify API was called with correct endpoint
      expect(apiService.get).toHaveBeenCalledWith('/movies');
      // Verify result is correct
      expect(result).toEqual([mockMovie]);
    });

    it('should throw an error when call fails', async () => {
      // Mock failed API call
      vi.mocked(apiService.get).mockRejectedValueOnce(new Error('Failed to get movies'));

      // Call the method and expect it to throw
      await expect(movieService.getAllMovies()).rejects.toThrow('Failed to get movies');
    });
  });

  describe('getMovieById', () => {
    it('should get a movie by ID successfully', async () => {
      // Mock successful API response
      vi.mocked(apiService.get).mockResolvedValueOnce(mockMovie);

      // Call the method
      const result = await movieService.getMovieById(mockMovie.id);

      // Verify API was called with correct endpoint
      expect(apiService.get).toHaveBeenCalledWith(`/movies/${mockMovie.id}`);
      // Verify result is correct
      expect(result).toEqual(mockMovie);
    });

    it('should throw an error when call fails', async () => {
      // Mock failed API call
      vi.mocked(apiService.get).mockRejectedValueOnce(new Error('Movie not found'));

      // Call the method and expect it to throw
      await expect(movieService.getMovieById(mockMovie.id)).rejects.toThrow('Movie not found');
    });
  });

  describe('createMovie', () => {
    it('should create a movie successfully', async () => {
      // Mock successful API response
      vi.mocked(apiService.post).mockResolvedValueOnce(mockMovie);

      // Call the method
      const result = await movieService.createMovie(mockCreateMovieDto);

      // Verify API was called with correct endpoint and data
      expect(apiService.post).toHaveBeenCalledWith('/movies', mockCreateMovieDto);
      // Verify result is correct
      expect(result).toEqual(mockMovie);
    });

    it('should throw an error when call fails', async () => {
      // Mock failed API call
      vi.mocked(apiService.post).mockRejectedValueOnce(new Error('Failed to create movie'));

      // Call the method and expect it to throw
      await expect(movieService.createMovie(mockCreateMovieDto)).rejects.toThrow('Failed to create movie');
    });
  });

  describe('updateMovie', () => {
    it('should update a movie successfully', async () => {
      // Mock successful API response
      const updatedMovie = { ...mockMovie, title: 'Updated Movie', director: 'Updated Director' };
      vi.mocked(apiService.put).mockResolvedValueOnce(updatedMovie);

      // Call the method
      const result = await movieService.updateMovie(mockMovie.id, mockUpdateMovieDto);

      // Verify API was called with correct endpoint and data
      expect(apiService.put).toHaveBeenCalledWith(`/movies/${mockMovie.id}`, mockUpdateMovieDto);
      // Verify result is correct
      expect(result).toEqual(updatedMovie);
    });

    it('should throw an error when call fails', async () => {
      // Mock failed API call
      vi.mocked(apiService.put).mockRejectedValueOnce(new Error('Failed to update movie'));

      // Call the method and expect it to throw
      await expect(movieService.updateMovie(mockMovie.id, mockUpdateMovieDto)).rejects.toThrow('Failed to update movie');
    });
  });

  describe('deleteMovie', () => {
    it('should delete a movie successfully', async () => {
      // Mock successful API response
      vi.mocked(apiService.delete).mockResolvedValueOnce(undefined);

      // Call the method
      const result = await movieService.deleteMovie(mockMovie.id);

      // Verify API was called with correct endpoint
      expect(apiService.delete).toHaveBeenCalledWith(`/movies/${mockMovie.id}`);
      // Verify result is true
      expect(result).toBe(true);
    });

    it('should throw an error when call fails', async () => {
      // Mock failed API call
      vi.mocked(apiService.delete).mockRejectedValueOnce(new Error('Failed to delete movie'));

      // Call the method and expect it to throw
      await expect(movieService.deleteMovie(mockMovie.id)).rejects.toThrow('Failed to delete movie');
    });
  });

  describe('searchMovies', () => {
    it('should search movies by title successfully', async () => {
      // Mock successful API response
      vi.mocked(apiService.get).mockResolvedValueOnce([mockMovie]);

      // Call the method with title parameter
      const searchParams = { title: 'Test' };
      const result = await movieService.searchMovies(searchParams);

      // Verify API was called with correct endpoint
      expect(apiService.get).toHaveBeenCalledWith('/movies?title=Test');
      // Verify result is correct
      expect(result).toEqual([mockMovie]);
    });

    it('should search movies by director successfully', async () => {
      // Mock successful API response
      vi.mocked(apiService.get).mockResolvedValueOnce([mockMovie]);

      // Call the method with director parameter
      const searchParams = { director: 'Test Director' };
      const result = await movieService.searchMovies(searchParams);

      // Verify API was called with correct endpoint
      expect(apiService.get).toHaveBeenCalledWith('/movies?director=Test%20Director');
      // Verify result is correct
      expect(result).toEqual([mockMovie]);
    });

    it('should search movies by genre successfully', async () => {
      // Mock successful API response
      vi.mocked(apiService.get).mockResolvedValueOnce([mockMovie]);

      // Call the method with genre parameter
      const searchParams = { genre: 'Action' };
      const result = await movieService.searchMovies(searchParams);

      // Verify API was called with correct endpoint
      expect(apiService.get).toHaveBeenCalledWith('/movies?genre=Action');
      // Verify result is correct
      expect(result).toEqual([mockMovie]);
    });

    it('should search movies with multiple parameters successfully', async () => {
      // Mock successful API response
      vi.mocked(apiService.get).mockResolvedValueOnce([mockMovie]);

      // Call the method with multiple parameters
      const searchParams = { title: 'Test', director: 'Test Director', genre: 'Action' };
      const result = await movieService.searchMovies(searchParams);

      // Verify API was called with correct endpoint containing all parameters
      expect(apiService.get).toHaveBeenCalledWith(expect.stringMatching(/^\/movies\?.*title=Test.*&.*director=Test%20Director.*&.*genre=Action.*$/));
      // Verify result is correct
      expect(result).toEqual([mockMovie]);
    });

    it('should throw an error when call fails', async () => {
      // Mock failed API call
      vi.mocked(apiService.get).mockRejectedValueOnce(new Error('Failed to search movies'));

      // Call the method and expect it to throw
      await expect(movieService.searchMovies({ title: 'Test' })).rejects.toThrow('Failed to search movies');
    });
  });
});
