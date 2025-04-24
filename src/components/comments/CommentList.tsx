import { useState, useEffect } from 'react';
import { CommentWithUser } from '../../models';
import { commentService } from '../../services';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';

interface CommentListProps {
  movieId: string;
}

/**
 * Component for displaying a list of comments for a movie
 */
export const CommentList = ({ movieId }: CommentListProps) => {
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load comments when the component mounts or when comments are updated
  const loadComments = () => {
    setIsLoading(true);
    try {
      const movieComments = commentService.getCommentsByMovieId(movieId);
      setComments(movieComments);
    } catch (error) {
      console.error('Failed to load comments:', error);
      // In a real app, you would show an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [movieId]);

  const handleCommentAdded = () => {
    loadComments();
  };

  const handleCommentUpdated = () => {
    loadComments();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Comments ({comments.length})</h2>
      
      <CommentForm movieId={movieId} onCommentAdded={handleCommentAdded} />
      
      {isLoading ? (
        <div className="text-center py-4">
          <p className="text-gray-500">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-500">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-0">
          {comments.map(comment => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              onUpdate={handleCommentUpdated} 
            />
          ))}
        </div>
      )}
    </div>
  );
};