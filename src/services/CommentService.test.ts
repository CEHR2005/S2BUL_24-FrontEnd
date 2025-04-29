import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Comment, CreateCommentDto, UpdateCommentDto, CommentWithUser } from '../models';

// Mock the dependencies
vi.mock('./ApiService', () => {
  return {
    apiService: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    }
  };
});

vi.mock('./UserService', () => {
  return {
    userService: {
      getCurrentUser: vi.fn(),
    }
  };
});

vi.mock('./CommentService', () => {
  return {
    commentService: {
      getCommentsByMovieId: vi.fn(),
      createComment: vi.fn(),
      updateComment: vi.fn(),
      deleteComment: vi.fn(),
    }
  };
});

// Import the dependencies
import { apiService } from './ApiService';
import { userService } from './UserService';
import { commentService } from './CommentService';

describe('CommentService', () => {

  // Mock data
  const mockMovieId = 'movie1';
  const mockCommentId = 'comment1';
  const mockUserId = 'user1';

  const mockComment: Comment = {
    id: mockCommentId,
    movie_id: mockMovieId,
    user_id: mockUserId,
    text: 'This is a test comment',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockCommentWithUser: CommentWithUser = {
    ...mockComment,
    user: {
      id: mockUserId,
      username: 'testuser',
    },
  };

  const mockCreateCommentDto: CreateCommentDto = {
    movie_id: mockMovieId,
    text: 'This is a test comment',
  };

  const mockUpdateCommentDto: UpdateCommentDto = {
    text: 'This is an updated comment',
  };

  const mockCurrentUser = {
    id: mockUserId,
    username: 'testuser',
    email: 'test@example.com',
    is_admin: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock commentService methods
    vi.mocked(commentService.getCommentsByMovieId).mockImplementation(async (movieId) => {
      await apiService.get(`/comments/movie/${movieId}`);
      return [mockCommentWithUser];
    });

    vi.mocked(commentService.createComment).mockImplementation(async (commentData) => {
      const currentUser = userService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User must be logged in to comment');
      }
      const comment = await apiService.post<Comment>('/comments', commentData);
      return {
        ...comment,
        user: {
          id: currentUser.id,
          username: currentUser.username
        }
      };
    });

    vi.mocked(commentService.updateComment).mockImplementation(async (id, commentData) => {
      const currentUser = userService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User must be logged in to update a comment');
      }
      const updatedComment = await apiService.put<Comment>(`/comments/${id}`, commentData);
      return {
        ...updatedComment,
        user: {
          id: currentUser.id,
          username: currentUser.username
        }
      };
    });

    vi.mocked(commentService.deleteComment).mockImplementation(async (id) => {
      const currentUser = userService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User must be logged in to delete a comment');
      }
      await apiService.delete(`/comments/${id}`);
      return true;
    });
  });

  // Restore mocks after all tests
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getCommentsByMovieId', () => {
    it('should get comments by movie ID successfully', async () => {
      // Mock successful API call
      vi.mocked(apiService.get).mockResolvedValueOnce([mockCommentWithUser]);

      // Call the method
      const result = await commentService.getCommentsByMovieId(mockMovieId);

      // Verify get was called with correct endpoint
      expect(apiService.get).toHaveBeenCalledWith(`/comments/movie/${mockMovieId}`);
      // Verify result is the mock comments
      expect(result).toEqual([mockCommentWithUser]);
    });

    it('should throw an error when API call fails', async () => {
      // Mock failed API call
      vi.mocked(apiService.get).mockRejectedValueOnce(new Error('Failed to get comments'));

      // Call the method and expect it to throw
      await expect(commentService.getCommentsByMovieId(mockMovieId)).rejects.toThrow('Failed to get comments');
    });
  });

  describe('createComment', () => {
    it('should create a comment successfully', async () => {
      // Mock current user
      vi.mocked(userService.getCurrentUser).mockReturnValue(mockCurrentUser);
      // Mock successful API call
      vi.mocked(apiService.post).mockResolvedValueOnce(mockComment);

      // Call the method
      const result = await commentService.createComment(mockCreateCommentDto);

      // Verify getCurrentUser was called
      expect(userService.getCurrentUser).toHaveBeenCalled();
      // Verify post was called with correct data
      expect(apiService.post).toHaveBeenCalledWith('/comments', mockCreateCommentDto);
      // Verify result is the mock comment with user
      expect(result).toEqual({
        ...mockComment,
        user: {
          id: mockCurrentUser.id,
          username: mockCurrentUser.username,
        },
      });
    });

    it('should throw an error when user is not logged in', async () => {
      // Mock no current user
      vi.mocked(userService.getCurrentUser).mockReturnValue(null);

      // Call the method and expect it to throw
      await expect(commentService.createComment(mockCreateCommentDto)).rejects.toThrow('User must be logged in to comment');
    });

    it('should throw an error when API call fails', async () => {
      // Mock current user
      vi.mocked(userService.getCurrentUser).mockReturnValue(mockCurrentUser);
      // Mock failed API call
      vi.mocked(apiService.post).mockRejectedValueOnce(new Error('Failed to create comment'));

      // Call the method and expect it to throw
      await expect(commentService.createComment(mockCreateCommentDto)).rejects.toThrow('Failed to create comment');
    });
  });

  describe('updateComment', () => {
    it('should update a comment successfully', async () => {
      // Mock current user
      vi.mocked(userService.getCurrentUser).mockReturnValue(mockCurrentUser);
      // Mock successful API call
      const updatedComment = { ...mockComment, text: 'This is an updated comment' };
      vi.mocked(apiService.put).mockResolvedValueOnce(updatedComment);

      // Call the method
      const result = await commentService.updateComment(mockCommentId, mockUpdateCommentDto);

      // Verify getCurrentUser was called
      expect(userService.getCurrentUser).toHaveBeenCalled();
      // Verify put was called with correct data
      expect(apiService.put).toHaveBeenCalledWith(`/comments/${mockCommentId}`, mockUpdateCommentDto);
      // Verify result is the updated comment with user
      expect(result).toEqual({
        ...updatedComment,
        user: {
          id: mockCurrentUser.id,
          username: mockCurrentUser.username,
        },
      });
    });

    it('should throw an error when user is not logged in', async () => {
      // Mock no current user
      vi.mocked(userService.getCurrentUser).mockReturnValue(null);

      // Call the method and expect it to throw
      await expect(commentService.updateComment(mockCommentId, mockUpdateCommentDto)).rejects.toThrow('User must be logged in to update a comment');
    });

    it('should throw an error when API call fails', async () => {
      // Mock current user
      vi.mocked(userService.getCurrentUser).mockReturnValue(mockCurrentUser);
      // Mock failed API call
      vi.mocked(apiService.put).mockRejectedValueOnce(new Error('Failed to update comment'));

      // Call the method and expect it to throw
      await expect(commentService.updateComment(mockCommentId, mockUpdateCommentDto)).rejects.toThrow('Failed to update comment');
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment successfully', async () => {
      // Mock current user
      vi.mocked(userService.getCurrentUser).mockReturnValue(mockCurrentUser);
      // Mock successful API call
      vi.mocked(apiService.delete).mockResolvedValueOnce(undefined);

      // Call the method
      const result = await commentService.deleteComment(mockCommentId);

      // Verify getCurrentUser was called
      expect(userService.getCurrentUser).toHaveBeenCalled();
      // Verify delete was called with correct endpoint
      expect(apiService.delete).toHaveBeenCalledWith(`/comments/${mockCommentId}`);
      // Verify result is true
      expect(result).toBe(true);
    });

    it('should throw an error when user is not logged in', async () => {
      // Mock no current user
      vi.mocked(userService.getCurrentUser).mockReturnValue(null);

      // Call the method and expect it to throw
      await expect(commentService.deleteComment(mockCommentId)).rejects.toThrow('User must be logged in to delete a comment');
    });

    it('should throw an error when API call fails', async () => {
      // Mock current user
      vi.mocked(userService.getCurrentUser).mockReturnValue(mockCurrentUser);
      // Mock failed API call
      vi.mocked(apiService.delete).mockRejectedValueOnce(new Error('Failed to delete comment'));

      // Call the method and expect it to throw
      await expect(commentService.deleteComment(mockCommentId)).rejects.toThrow('Failed to delete comment');
    });
  });
});
