import { useState, useEffect } from 'react';
import { Movie, MovieRating } from '../../models';
import { ratingService } from '../../services';

interface MovieCardProps {
  movie: Movie;
  onClick: () => void;
}

/**
 * Card component for displaying a movie in a list
 */
export const MovieCard = ({ movie, onClick }: MovieCardProps) => {
  const [rating, setRating] = useState<MovieRating>({ 
    movie_id: movie.id, 
    average_score: 0,
    total_ratings: 0
  });
  const [posterError, setPosterError] = useState(false);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const movieRating = await ratingService.getMovieRating(movie.id);
        setRating(movieRating);
      } catch (error) {
        console.error('Failed to load movie rating:', error);
      }
    };

    fetchRating();
  }, [movie.id]);

  const { average_score, total_ratings } = rating;

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      {movie.poster_url && !posterError ? (
        <img 
          src={movie.poster_url}
          alt={`${movie.title} poster`} 
          className="w-full h-48 object-cover"
          onError={() => setPosterError(true)}
        />
      ) : (
        <div className="w-full h-48 bg-gray-300 flex items-center justify-center">
          <span className="text-gray-500">No poster available</span>
        </div>
      )}

      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1">{movie.title}</h3>
        <p className="text-sm text-gray-600 mb-2">{movie.release_year} • {movie.duration} min</p>

        <div className="flex items-center mb-2">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="ml-1 text-gray-700">
              {average_score > 0 ? average_score.toFixed(1) : 'N/A'}
            </span>
          </div>
          <span className="mx-2 text-gray-400">•</span>
          <span className="text-sm text-gray-600">{total_ratings} {total_ratings === 1 ? 'rating' : 'ratings'}</span>
        </div>

        <div className="flex flex-wrap gap-1">
          {movie.genre.slice(0, 3).map((genre, index) => (
            <span 
              key={index} 
              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
            >
              {genre}
            </span>
          ))}
          {movie.genre.length > 3 && (
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
              +{movie.genre.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
