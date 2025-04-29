import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommentItem } from './CommentItem';
import { commentService } from '../../services';
import { userService } from '../../services';
import { CommentWithUser } from '../../models';

// Mock the services
vi.mock('../../services', () => ({
  commentService: {
    updateComment: vi.fn(),
    deleteComment: vi.fn(),
  },
  userService: {
    getCurrentUser: vi.fn(),
  },
}));

describe('CommentItem', () => {
  // Sample comment data for testing
  const mockComment: CommentWithUser = {
    id: '1',
    movie_id: 'movie1',
    user_id: 'user1',
    text: 'This is a test comment',
    created_at: new Date('2023-01-01T12:00:00Z'),
    updated_at: new Date('2023-01-01T12:00:00Z'),
    user: {
      id: 'user1',
      username: 'testuser',
    },
  };

  // Mock function for onUpdate prop
  const mockOnUpdate = vi.fn();

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the comment correctly', () => {
    // Mock current user as null (not logged in)
    vi.mocked(userService.getCurrentUser).mockReturnValue(null);

    render(<CommentItem comment={mockComment} onUpdate={mockOnUpdate} />);

    // Check if username is displayed
    expect(screen.getByText('testuser')).toBeInTheDocument();
    
    // Check if comment text is displayed
    expect(screen.getByText('This is a test comment')).toBeInTheDocument();
    
    // Check if date is displayed (partial match since formatting may vary)
    expect(screen.getByText(/Jan 1, 2023/)).toBeInTheDocument();
    
    // Edit and Delete buttons should not be visible when user is not logged in
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('shows edit and delete buttons when user is the author', () => {
    // Mock current user as the author of the comment
    vi.mocked(userService.getCurrentUser).mockReturnValue({
      id: 'user1', // Same as comment.user_id
      username: 'testuser',
      email: 'test@example.com',
      is_admin: false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    render(<CommentItem comment={mockComment} onUpdate={mockOnUpdate} />);

    // Edit and Delete buttons should be visible
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('shows edit and delete buttons when user is an admin', () => {
    // Mock current user as an admin
    vi.mocked(userService.getCurrentUser).mockReturnValue({
      id: 'admin1', // Different from comment.user_id
      username: 'admin',
      email: 'admin@example.com',
      is_admin: true, // Admin user
      created_at: new Date(),
      updated_at: new Date(),
    });

    render(<CommentItem comment={mockComment} onUpdate={mockOnUpdate} />);

    // Edit and Delete buttons should be visible for admin
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('allows editing a comment', async () => {
    // Mock current user as the author
    vi.mocked(userService.getCurrentUser).mockReturnValue({
      id: 'user1',
      username: 'testuser',
      email: 'test@example.com',
      is_admin: false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Mock successful comment update
    vi.mocked(commentService.updateComment).mockResolvedValue({
      ...mockComment,
      text: 'Updated comment text',
    });

    render(<CommentItem comment={mockComment} onUpdate={mockOnUpdate} />);

    // Click edit button
    fireEvent.click(screen.getByText('Edit'));

    // Textarea should be visible with original comment text
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('This is a test comment');

    // Change the text
    fireEvent.change(textarea, { target: { value: 'Updated comment text' } });
    expect(textarea).toHaveValue('Updated comment text');

    // Click save button
    fireEvent.click(screen.getByText('Save'));

    // Wait for the update to complete
    await waitFor(() => {
      // Check if updateComment was called with correct parameters
      expect(commentService.updateComment).toHaveBeenCalledWith('1', { text: 'Updated comment text' });
      // Check if onUpdate callback was called
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('allows canceling edit mode', () => {
    // Mock current user as the author
    vi.mocked(userService.getCurrentUser).mockReturnValue({
      id: 'user1',
      username: 'testuser',
      email: 'test@example.com',
      is_admin: false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    render(<CommentItem comment={mockComment} onUpdate={mockOnUpdate} />);

    // Click edit button
    fireEvent.click(screen.getByText('Edit'));

    // Textarea should be visible
    expect(screen.getByRole('textbox')).toBeInTheDocument();

    // Click cancel button
    fireEvent.click(screen.getByText('Cancel'));

    // Textarea should no longer be visible
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    
    // Original comment text should be visible again
    expect(screen.getByText('This is a test comment')).toBeInTheDocument();
  });

  it('allows deleting a comment', async () => {
    // Mock current user as the author
    vi.mocked(userService.getCurrentUser).mockReturnValue({
      id: 'user1',
      username: 'testuser',
      email: 'test@example.com',
      is_admin: false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Mock successful comment deletion
    vi.mocked(commentService.deleteComment).mockResolvedValue(true);

    render(<CommentItem comment={mockComment} onUpdate={mockOnUpdate} />);

    // Click delete button
    fireEvent.click(screen.getByText('Delete'));

    // Confirmation dialog should be visible
    expect(screen.getByText('Are you sure you want to delete this comment?')).toBeInTheDocument();

    // Click confirm delete button
    fireEvent.click(screen.getByText('Delete'));

    // Wait for the deletion to complete
    await waitFor(() => {
      // Check if deleteComment was called with correct parameter
      expect(commentService.deleteComment).toHaveBeenCalledWith('1');
      // Check if onUpdate callback was called
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('allows canceling comment deletion', () => {
    // Mock current user as the author
    vi.mocked(userService.getCurrentUser).mockReturnValue({
      id: 'user1',
      username: 'testuser',
      email: 'test@example.com',
      is_admin: false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    render(<CommentItem comment={mockComment} onUpdate={mockOnUpdate} />);

    // Click delete button
    fireEvent.click(screen.getByText('Delete'));

    // Confirmation dialog should be visible
    expect(screen.getByText('Are you sure you want to delete this comment?')).toBeInTheDocument();

    // Click cancel button
    fireEvent.click(screen.getByText('Cancel'));

    // Confirmation dialog should no longer be visible
    expect(screen.queryByText('Are you sure you want to delete this comment?')).not.toBeInTheDocument();
    
    // Original comment should still be visible
    expect(screen.getByText('This is a test comment')).toBeInTheDocument();
  });
});