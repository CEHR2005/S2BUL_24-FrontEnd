/**
 * Represents a comment on a movie
 */
export interface Comment {
  id: string;
  movieId: string;
  userId: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Represents the data needed to create a new comment
 */
export type CreateCommentDto = Pick<Comment, 'movieId' | 'text'>;

/**
 * Represents the data needed to update an existing comment
 */
export type UpdateCommentDto = Pick<Comment, 'text'>;

/**
 * Represents a comment with user information
 */
export interface CommentWithUser extends Comment {
  user: {
    id: string;
    username: string;
  };
}