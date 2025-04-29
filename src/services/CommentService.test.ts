import { describe, it, beforeAll, beforeEach, afterEach, expect, vi } from 'vitest';
import type { Comment, CreateCommentDto, UpdateCommentDto, CommentWithUser } from '../models';

/* 1. Mocking dependencies - as before */
vi.mock('./ApiService', () => ({
  apiService: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));
vi.mock('./UserService', () => ({
  userService: { getCurrentUser: vi.fn() },
}));

/* 2. Importing the mocks themselves (already substituted) */
import { apiService } from './ApiService';
import { userService } from './UserService';

/* 3. Getting the real CommentService after everything above is executed */
let commentService: typeof import('./CommentService')['commentService'];

beforeAll(async () => {
  // removing the old version of the module from cache, in case it was already loaded
  vi.resetModules();

  // importing the "live" module taking into account already registered mocks
  const mod = await vi.importActual<typeof import('./CommentService')>('./CommentService');
  commentService = mod.commentService;
});

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
  });

  // Restore mocks after all tests
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getCommentsByMovieId', () => {
    it('should get comments by movie ID successfully', async () => {
      vi.mocked(apiService.get).mockResolvedValueOnce([{ /* … */ }] as CommentWithUser[]);

      const result = await commentService.getCommentsByMovieId('movie1');

      expect(apiService.get).toHaveBeenCalledWith('/comments/movie/movie1');
      expect(result).toHaveLength(1);
    });

    it('should throw an error when API call fails', async () => {
      vi.mocked(apiService.get).mockRejectedValueOnce(new Error('Failed to get comments'));

      await expect(
          commentService.getCommentsByMovieId(mockMovieId)
      ).rejects.toThrow('Failed to get comments');
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
