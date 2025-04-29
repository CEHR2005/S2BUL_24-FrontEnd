import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MovieForm } from './MovieForm';
import { movieService } from '../../services';
import { Movie } from '../../models';

// Mock the movieService
vi.mock('../../services', () => ({
  movieService: {
    getMovieById: vi.fn(),
    createMovie: vi.fn(),
    updateMovie: vi.fn(),
  },
}));

describe('MovieForm', () => {
  // Mock callback functions
  const mockOnSuccess = vi.fn();
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  // Sample movie data for testing
  const mockMovie: Movie = {
    id: 'movie123',
    title: 'Test Movie',
    release_year: 2023,
    director: 'Test Director',
    cast: ['Actor 1', 'Actor 2'],
    genre: ['Action', 'Drama'],
    plot: 'This is a test plot for the movie.',
    duration: 120,
    poster_url: 'https://example.com/poster.jpg',
    images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form for adding a new movie', () => {
    render(
      <MovieForm 
        onSuccess={mockOnSuccess} 
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Check if form title is correct
    expect(screen.getByText('Add New Movie')).toBeInTheDocument();

    // Check if required form elements are rendered
    expect(screen.getByLabelText(/title\*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/release year\*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/director\*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/duration \(minutes\)\*/i)).toBeInTheDocument();
    expect(screen.getByText(/cast\*/i)).toBeInTheDocument();
    expect(screen.getByText(/genre\*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/plot\*/i)).toBeInTheDocument();

    // Check if optional form elements are rendered
    expect(screen.getByLabelText(/poster url/i)).toBeInTheDocument();
    expect(screen.getByText(/additional images/i)).toBeInTheDocument();

    // Check if buttons are rendered
    expect(screen.getByRole('button', { name: /add movie/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('loads movie data when editing an existing movie', async () => {
    // Mock getMovieById to return the mock movie
    vi.mocked(movieService.getMovieById).mockResolvedValue(mockMovie);

    render(
      <MovieForm 
        movieId={mockMovie.id}
        onSuccess={mockOnSuccess} 
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Check if form title is correct for editing
    expect(screen.getByText('Edit Movie')).toBeInTheDocument();

    // Wait for the movie data to be loaded
    await waitFor(() => {
      // Verify that getMovieById was called with the correct ID
      expect(movieService.getMovieById).toHaveBeenCalledWith(mockMovie.id);

      // Check if form fields are populated with movie data
      expect(screen.getByLabelText(/title\*/i)).toHaveValue(mockMovie.title);
      expect(screen.getByLabelText(/director\*/i)).toHaveValue(mockMovie.director);
      expect(screen.getByLabelText(/plot\*/i)).toHaveValue(mockMovie.plot);

      // Check if cast members are displayed
      mockMovie.cast.forEach(member => {
        expect(screen.getByText(member)).toBeInTheDocument();
      });

      // Check if genres are displayed
      mockMovie.genre.forEach(genre => {
        expect(screen.getByText(genre)).toBeInTheDocument();
      });
    });
  });

  it('shows error when loading movie data fails', async () => {
    // Mock getMovieById to throw an error
    vi.mocked(movieService.getMovieById).mockRejectedValue(new Error('Failed to load movie'));

    render(
      <MovieForm 
        movieId={mockMovie.id}
        onSuccess={mockOnSuccess} 
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Wait for the error to be displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to load movie data')).toBeInTheDocument();
    });
  });

  it('successfully creates a new movie', async () => {
    // Mock successful movie creation
    vi.mocked(movieService.createMovie).mockResolvedValue(mockMovie);

    render(
      <MovieForm 
        onSuccess={mockOnSuccess} 
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/title\*/i), { target: { value: mockMovie.title } });
    fireEvent.change(screen.getByLabelText(/director\*/i), { target: { value: mockMovie.director } });
    fireEvent.change(screen.getByLabelText(/plot\*/i), { target: { value: mockMovie.plot } });
    fireEvent.change(screen.getByLabelText(/duration \(minutes\)\*/i), { target: { value: mockMovie.duration.toString() } });

    // Add cast members
    const castInput = screen.getByPlaceholderText('Add cast member');
    mockMovie.cast.forEach(member => {
      fireEvent.change(castInput, { target: { value: member } });
      fireEvent.click(screen.getAllByText('Add')[0]); // First 'Add' button is for cast
    });

    // Add genres
    const genreInput = screen.getByPlaceholderText('Add genre');
    mockMovie.genre.forEach(genre => {
      fireEvent.change(genreInput, { target: { value: genre } });
      fireEvent.click(screen.getAllByText('Add')[1]); // Second 'Add' button is for genre
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /add movie/i }));

    // Wait for the submission to complete
    await waitFor(() => {
      // Check if createMovie was called with correct data
      expect(movieService.createMovie).toHaveBeenCalledWith(expect.objectContaining({
        title: mockMovie.title,
        director: mockMovie.director,
        plot: mockMovie.plot,
        duration: mockMovie.duration,
        cast: mockMovie.cast,
        genre: mockMovie.genre,
      }));

      // Check if callbacks were called
      expect(mockOnSave).toHaveBeenCalledWith(mockMovie);
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('successfully updates an existing movie', async () => {
    // Mock getMovieById and updateMovie
    vi.mocked(movieService.getMovieById).mockResolvedValue(mockMovie);
    vi.mocked(movieService.updateMovie).mockResolvedValue({
      ...mockMovie,
      title: 'Updated Movie Title',
    });

    render(
      <MovieForm 
        movieId={mockMovie.id}
        onSuccess={mockOnSuccess} 
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Wait for the movie data to be loaded
    await waitFor(() => {
      expect(screen.getByLabelText(/title\*/i)).toHaveValue(mockMovie.title);
    });

    // Update the title
    fireEvent.change(screen.getByLabelText(/title\*/i), { target: { value: 'Updated Movie Title' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /update movie/i }));

    // Wait for the submission to complete
    await waitFor(() => {
      // Check if updateMovie was called with correct data
      expect(movieService.updateMovie).toHaveBeenCalledWith(
        mockMovie.id,
        expect.objectContaining({
          title: 'Updated Movie Title',
        })
      );

      // Check if callbacks were called
      expect(mockOnSave).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('shows error when movie creation fails', async () => {
    // Mock failed movie creation
    vi.mocked(movieService.createMovie).mockRejectedValue(new Error('Failed to save movie'));

    render(
      <MovieForm 
        onSuccess={mockOnSuccess} 
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Fill in the form with valid data
    fireEvent.change(screen.getByLabelText(/title\*/i), { target: { value: mockMovie.title } });
    fireEvent.change(screen.getByLabelText(/director\*/i), { target: { value: mockMovie.director } });
    fireEvent.change(screen.getByLabelText(/plot\*/i), { target: { value: mockMovie.plot } });
    fireEvent.change(screen.getByLabelText(/duration \(minutes\)\*/i), { target: { value: mockMovie.duration.toString() } });

    // Add cast members
    const castInput = screen.getByPlaceholderText('Add cast member');
    fireEvent.change(castInput, { target: { value: 'Actor 1' } });
    fireEvent.click(screen.getAllByText('Add')[0]);

    // Add genres
    const genreInput = screen.getByPlaceholderText('Add genre');
    fireEvent.change(genreInput, { target: { value: 'Action' } });
    fireEvent.click(screen.getAllByText('Add')[1]);

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /add movie/i }));

    // Wait for the error to be displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to save movie')).toBeInTheDocument();
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  it('adds and removes cast members', () => {
    render(
      <MovieForm 
        onSuccess={mockOnSuccess} 
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Add a cast member
    const castInput = screen.getByPlaceholderText('Add cast member');
    fireEvent.change(castInput, { target: { value: 'New Actor' } });
    fireEvent.click(screen.getAllByText('Add')[0]);

    // Check if the cast member was added
    expect(screen.getByText('New Actor')).toBeInTheDocument();

    // Remove the cast member
    fireEvent.click(screen.getByText('New Actor').nextSibling as HTMLElement);

    // Check if the cast member was removed
    expect(screen.queryByText('New Actor')).not.toBeInTheDocument();
  });

  it('adds and removes genres', () => {
    render(
      <MovieForm 
        onSuccess={mockOnSuccess} 
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Add a genre
    const genreInput = screen.getByPlaceholderText('Add genre');
    fireEvent.change(genreInput, { target: { value: 'Comedy' } });
    fireEvent.click(screen.getAllByText('Add')[1]);

    // Check if the genre was added
    expect(screen.getByText('Comedy')).toBeInTheDocument();

    // Remove the genre
    fireEvent.click(screen.getByText('Comedy').nextSibling as HTMLElement);

    // Check if the genre was removed
    expect(screen.queryByText('Comedy')).not.toBeInTheDocument();
  });

  it('adds and removes images', async () => {
    render(
      <MovieForm 
        onSuccess={mockOnSuccess} 
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Add an image
    const imageInput = screen.getByPlaceholderText('Add image URL');
    fireEvent.change(imageInput, { target: { value: 'https://example.com/image.jpg' } });
    fireEvent.click(screen.getAllByText('Add')[2]);

    // Check if the image was added (by checking for the img element)
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);

    // Remove the image
    fireEvent.click(screen.getAllByRole('button').find(button => 
      button.querySelector('svg')?.classList.contains('text-red-500')
    ) as HTMLElement);

    // Check if the image was removed
    await waitFor(() => {
      const imagesAfterRemoval = screen.queryAllByRole('img');
      expect(imagesAfterRemoval.length).toBe(0);
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <MovieForm 
        onSuccess={mockOnSuccess} 
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Click the cancel button
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    // Verify that onCancel callback was called
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
