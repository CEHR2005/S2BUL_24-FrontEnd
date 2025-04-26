import { useState, useEffect } from 'react';
import { ratingService } from '../../services';
import { userService } from '../../services';
import { RatingStars } from './RatingStars';

interface RatingFormProps {
  movieId: string;
}

/**
 * Component for rating a movie
 */
export const RatingForm = ({ movieId }: RatingFormProps) => {
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const currentUser = userService.getCurrentUser();

  // Load user's existing rating for this movie
  useEffect(() => {
    const fetchUserRating = async () => {
      if (!currentUser) return;

      try {
        const existingRating = await ratingService.getUserRatingForMovie(movieId);
        if (existingRating) {
          setUserRating(existingRating.score);
        }
      } catch (error) {
        console.error('Failed to load user rating:', error);
      }
    };

    fetchUserRating();
  }, [movieId, currentUser]);

  const handleRatingChange = (rating: number) => {
    setUserRating(rating);
    submitRating(rating);
  };

  const submitRating = async (rating: number) => {
    if (!currentUser) {
      setMessage('You must be logged in to rate movies');
      setMessageType('error');
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    setMessageType('');

    try {
      await ratingService.rateMovie({
        movieId,
        score: rating
      });

      setMessage('Rating saved successfully');
      setMessageType('success');

      // Hide success message after 3 seconds
      setTimeout(() => {
        if (messageType === 'success') {
          setMessage('');
          setMessageType('');
        }
      }, 3000);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to save rating');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveRating = async () => {
    if (!currentUser) return;

    setIsSubmitting(true);
    setMessage('');
    setMessageType('');

    try {
      const success = await ratingService.deleteRating(movieId);

      if (success) {
        setUserRating(null);
        setMessage('Rating removed');
        setMessageType('success');

        // Hide success message after 3 seconds
        setTimeout(() => {
          if (messageType === 'success') {
            setMessage('');
            setMessageType('');
          }
        }, 3000);
      } else {
        setMessage('Failed to remove rating');
        setMessageType('error');
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to remove rating');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="bg-gray-50 p-4 rounded-md text-center">
        <p className="text-gray-600">Please log in to rate this movie.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-700 mb-2">Your rating:</p>
          <RatingStars
            initialRating={userRating || 0}
            maxRating={10}
            size="lg"
            onRatingChange={handleRatingChange}
          />
        </div>

        {userRating && (
          <button
            type="button"
            onClick={handleRemoveRating}
            className="text-red-600 hover:text-red-800 text-sm"
            disabled={isSubmitting}
          >
            Remove rating
          </button>
        )}
      </div>

      {message && (
        <div className={`mt-2 p-2 rounded text-sm ${
          messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
};
