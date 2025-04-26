/**
 * Represents a comment on a movie
 */
export interface Comment {
  id: string;
  movie_id: string;
  user_id: string;
  text: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Represents the data needed to create a new comment
 */
export type CreateCommentDto = Pick<Comment, 'movie_id' | 'text'>;

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
