import { useState } from 'react';
import { commentService } from '../../services';
import { userService } from '../../services';

interface CommentFormProps {
  movieId: string;
  onCommentAdded: () => void;
}

/**
 * Component for adding a new comment
 */
export const CommentForm = ({ movieId, onCommentAdded }: CommentFormProps) => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentUser = userService.getCurrentUser();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    
    if (!currentUser) {
      setError('You must be logged in to comment');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      commentService.createComment({
        movieId,
        text: text.trim()
      });
      
      setText('');
      onCommentAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!currentUser) {
    return (
      <div className="bg-gray-50 p-4 rounded-md text-center">
        <p className="text-gray-600">Please log in to add a comment.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <h3 className="text-lg font-medium mb-2">Add a Comment</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your thoughts about this movie..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
        />
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
          disabled={isSubmitting || !text.trim()}
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </form>
  );
};