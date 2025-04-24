import { Comment, CreateCommentDto, UpdateCommentDto, CommentWithUser } from '../models/Comment';
import { v4 as uuidv4 } from 'uuid';
import { userService } from './UserService';

/**
 * Service for handling comment-related operations
 */
export class CommentService {
  private comments: Comment[] = [];

  /**
   * Get all comments for a movie
   */
  public getCommentsByMovieId(movieId: string): CommentWithUser[] {
    return this.comments
      .filter(comment => comment.movieId === movieId)
      .map(comment => this.addUserInfoToComment(comment))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by newest first
  }

  /**
   * Create a new comment
   */
  public createComment(commentData: CreateCommentDto): CommentWithUser | undefined {
    const currentUser = userService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User must be logged in to comment');
    }

    const now = new Date();
    const newComment: Comment = {
      id: uuidv4(),
      userId: currentUser.id,
      ...commentData,
      createdAt: now,
      updatedAt: now
    };

    this.comments.push(newComment);
    return this.addUserInfoToComment(newComment);
  }

  /**
   * Update an existing comment
   */
  public updateComment(id: string, commentData: UpdateCommentDto): CommentWithUser | undefined {
    const currentUser = userService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User must be logged in to update a comment');
    }

    const commentIndex = this.comments.findIndex(comment => comment.id === id);
    if (commentIndex === -1) {
      return undefined;
    }

    // Check if the current user is the author of the comment
    if (this.comments[commentIndex].userId !== currentUser.id && !currentUser.isAdmin) {
      throw new Error('You can only update your own comments');
    }

    const updatedComment: Comment = {
      ...this.comments[commentIndex],
      ...commentData,
      updatedAt: new Date()
    };

    this.comments[commentIndex] = updatedComment;
    return this.addUserInfoToComment(updatedComment);
  }

  /**
   * Delete a comment
   */
  public deleteComment(id: string): boolean {
    const currentUser = userService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User must be logged in to delete a comment');
    }

    const comment = this.comments.find(comment => comment.id === id);
    if (!comment) {
      return false;
    }

    // Check if the current user is the author of the comment or an admin
    if (comment.userId !== currentUser.id && !currentUser.isAdmin) {
      throw new Error('You can only delete your own comments');
    }

    const initialLength = this.comments.length;
    this.comments = this.comments.filter(comment => comment.id !== id);
    return this.comments.length !== initialLength;
  }

  /**
   * Helper method to add user information to a comment
   */
  private addUserInfoToComment(comment: Comment): CommentWithUser {
    const user = userService.getUserById(comment.userId);
    if (!user) {
      throw new Error('Comment user not found');
    }

    return {
      ...comment,
      user: {
        id: user.id,
        username: user.username
      }
    };
  }
}

// Export a singleton instance
export const commentService = new CommentService();