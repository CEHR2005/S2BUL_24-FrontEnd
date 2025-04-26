import { Comment, CreateCommentDto, UpdateCommentDto, CommentWithUser } from '../models/Comment';
import { apiService } from './ApiService';
import { userService } from './UserService';

/**
 * Service for handling comment-related operations
 */
export class CommentService {
  /**
   * Get all comments for a movie
   */
  public async getCommentsByMovieId(movieId: string): Promise<CommentWithUser[]> {
    try {
      // The backend already returns comments with user information
      return await apiService.get<CommentWithUser[]>(`/comments/movie/${movieId}`);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to get comments');
    }
  }

  /**
   * Create a new comment
   */
  public async createComment(commentData: CreateCommentDto): Promise<CommentWithUser> {
    try {
      // Check if user is logged in
      const currentUser = userService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User must be logged in to comment');
      }

      // Create the comment
      const comment = await apiService.post<Comment>('/comments', commentData);

      // The backend doesn't return the comment with user info on creation,
      // so we need to add it manually
      return {
        ...comment,
        user: {
          id: currentUser.id,
          username: currentUser.username
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to create comment');
    }
  }

  /**
   * Update an existing comment
   */
  public async updateComment(id: string, commentData: UpdateCommentDto): Promise<CommentWithUser> {
    try {
      // Check if user is logged in
      const currentUser = userService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User must be logged in to update a comment');
      }

      // Update the comment
      const updatedComment = await apiService.put<Comment>(`/comments/${id}`, commentData);

      // Add user information to the updated comment
      return {
        ...updatedComment,
        user: {
          id: currentUser.id,
          username: currentUser.username
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to update comment');
    }
  }

  /**
   * Delete a comment
   */
  public async deleteComment(id: string): Promise<boolean> {
    try {
      // Check if user is logged in
      const currentUser = userService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User must be logged in to delete a comment');
      }

      // Delete the comment
      await apiService.delete<void>(`/comments/${id}`);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to delete comment');
    }
  }
}

// Export a singleton instance
export const commentService = new CommentService();
