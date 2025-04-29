import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommentForm } from './CommentForm';
import { commentService } from '../../services';
import { userService } from '../../services';
import { CommentWithUser } from '../../models';

// Mock the services
vi.mock('../../services', () => ({
  commentService: {
    createComment: vi.fn(),
  },
  userService: {
    getCurrentUser: vi.fn(),
  },
}));

describe('CommentForm', () => {
  // Mock function for onCommentAdded prop
  const mockOnCommentAdded = vi.fn();
  const mockMovieId = 'movie123';

  // Sample user data for testing
  const mockUser = {
    id: 'user1',
    username: 'testuser',
    email: 'test@example.com',
    isAdmin: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  // Sample comment response
  const mockCommentResponse: CommentWithUser = {
    id: 'comment1',
    movie_id: 'movie123',
    user_id: 'user1',
    text: 'This is a test comment',
    created_at: new Date(),
    updated_at: new Date(),
    user: {
      id: 'user1',
      username: 'testuser',
    },
  };

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a message when user is not logged in', () => {
    // Mock current user as null (not logged in)
    vi.mocked(userService.getCurrentUser).mockReturnValue(null);

    render(<CommentForm movieId={mockMovieId} onCommentAdded={mockOnCommentAdded} />);

    // Check if the not logged in message is displayed
    expect(screen.getByText('Please log in to add a comment.')).toBeInTheDocument();

    // Form elements should not be visible
    expect(screen.queryByText('Add a Comment')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByText('Post Comment')).not.toBeInTheDocument();
  });

  it('renders the form when user is logged in', () => {
    // Mock current user as logged in
    vi.mocked(userService.getCurrentUser).mockReturnValue(mockUser);

    render(<CommentForm movieId={mockMovieId} onCommentAdded={mockOnCommentAdded} />);

    // Check if form elements are displayed
    expect(screen.getByText('Add a Comment')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText('Post Comment')).toBeInTheDocument();

    // Button should be disabled initially (empty comment)
    expect(screen.getByText('Post Comment')).toBeDisabled();
  });

  it('enables the submit button when comment is not empty', () => {
    // Mock current user as logged in
    vi.mocked(userService.getCurrentUser).mockReturnValue(mockUser);

    render(<CommentForm movieId={mockMovieId} onCommentAdded={mockOnCommentAdded} />);

    // Get the textarea and button
    const textarea = screen.getByRole('textbox');
    const submitButton = screen.getByText('Post Comment');

    // Button should be disabled initially
    expect(submitButton).toBeDisabled();

    // Enter text in the textarea
    fireEvent.change(textarea, { target: { value: 'This is a test comment' } });

    // Button should be enabled now
    expect(submitButton).not.toBeDisabled();
  });

  it('shows validation error when submitting empty comment', () => {
    // Mock current user as logged in
    vi.mocked(userService.getCurrentUser).mockReturnValue(mockUser);

    render(<CommentForm movieId={mockMovieId} onCommentAdded={mockOnCommentAdded} />);

    // Submit the form directly
    const form = screen.getByText('Post Comment').closest('form');
    fireEvent.submit(form!);

    // Error message should be displayed
    expect(screen.getByText('Comment cannot be empty')).toBeInTheDocument();

    // createComment should not be called
    expect(commentService.createComment).not.toHaveBeenCalled();
  });

  it('successfully submits a comment', async () => {
    // Mock current user as logged in
    vi.mocked(userService.getCurrentUser).mockReturnValue(mockUser);

    // Mock successful comment creation
    vi.mocked(commentService.createComment).mockResolvedValue(mockCommentResponse);

    render(<CommentForm movieId={mockMovieId} onCommentAdded={mockOnCommentAdded} />);

    // Get the textarea and enter text
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'This is a test comment' } });

    // Submit the form directly
    const form = screen.getByText('Post Comment').closest('form');
    fireEvent.submit(form!);

    // Wait for the submission to complete
    await waitFor(() => {
      // Check if createComment was called with correct parameters
      expect(commentService.createComment).toHaveBeenCalledWith({
        movie_id: mockMovieId,
        text: 'This is a test comment'
      });

      // Check if onCommentAdded callback was called
      expect(mockOnCommentAdded).toHaveBeenCalled();

      // Textarea should be cleared
      expect(textarea).toHaveValue('');
    });
  });

  it('shows error message when comment submission fails', async () => {
    // Mock current user as logged in
    vi.mocked(userService.getCurrentUser).mockReturnValue(mockUser);

    // Mock failed comment creation
    const errorMessage = 'Network error';
    vi.mocked(commentService.createComment).mockRejectedValue(new Error(errorMessage));

    render(<CommentForm movieId={mockMovieId} onCommentAdded={mockOnCommentAdded} />);

    // Get the textarea and enter text
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'This is a test comment' } });

    // Submit the form directly
    const form = screen.getByText('Post Comment').closest('form');
    fireEvent.submit(form!);

    // Wait for the submission to complete
    await waitFor(() => {
      // Error message should be displayed
      expect(screen.getByText(errorMessage)).toBeInTheDocument();

      // onCommentAdded should not be called
      expect(mockOnCommentAdded).not.toHaveBeenCalled();

      // Textarea should still have the entered text
      expect(textarea).toHaveValue('This is a test comment');
    });
  });

  it('shows "Posting..." text on button while submitting', async () => {
    // Mock current user as logged in
    vi.mocked(userService.getCurrentUser).mockReturnValue(mockUser);

    // Mock slow comment creation to test loading state
    vi.mocked(commentService.createComment).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockCommentResponse), 100))
    );

    render(<CommentForm movieId={mockMovieId} onCommentAdded={mockOnCommentAdded} />);

    // Get the textarea and enter text
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'This is a test comment' } });

    // Submit the form directly
    const form = screen.getByText('Post Comment').closest('form');
    fireEvent.submit(form!);

    // Button should show "Posting..." and be disabled
    expect(screen.getByText('Posting...')).toBeInTheDocument();
    expect(screen.getByText('Posting...')).toBeDisabled();

    // Wait for the submission to complete
    await waitFor(() => {
      expect(screen.getByText('Post Comment')).toBeInTheDocument();
    });
  });
});
