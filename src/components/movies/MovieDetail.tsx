import { useState, useEffect } from 'react';
import { Movie } from '../../models/Movie';
import { movieService } from '../../services/MovieService';
import { ratingService } from '../../services/RatingService';
import { CommentList } from '../comments/CommentList';
import { RatingForm } from '../ratings/RatingForm';
import { StatisticsPanel } from '../statistics/StatisticsPanel';
import { userService } from '../../services/UserService';

interface MovieDetailProps {
  movieId: string;
  onBack: () => void;
}

/**
 * Component for displaying detailed information about a movie
 */
export const MovieDetail = ({ movieId, onBack }: MovieDetailProps) => {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'comments' | 'statistics'>('comments');
  const isLoggedIn = !!userService.getCurrentUser();

  useEffect(() => {
    const fetchMovie = () => {
      const foundMovie = movieService.getMovieById(movieId);
      setMovie(foundMovie || null);
      setLoading(false);
    };

    fetchMovie();
  }, [movieId]);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!movie) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Movie not found.</p>
        <button 
          onClick={onBack}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Back to Movies
        </button>
      </div>
    );
  }

  const { averageScore, totalRatings } = ratingService.getMovieRating(movie.id);

  return (
    <div>
      <button 
        onClick={onBack}
        className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Movies
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Movie Poster */}
          <div className="md:w-1/3">
            {movie.posterUrl ? (
              <img 
                src={movie.posterUrl} 
                alt={`${movie.title} poster`} 
                className="w-full h-auto object-cover"
              />
            ) : (
              <div className="w-full h-64 bg-gray-300 flex items-center justify-center">
                <span className="text-gray-500">No poster available</span>
              </div>
            )}
          </div>

          {/* Movie Details */}
          <div className="p-6 md:w-2/3">
            <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
            <p className="text-gray-600 mb-4">{movie.releaseYear} • {movie.duration} min</p>

            <div className="flex items-center mb-4">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="ml-1 text-xl font-semibold">
                  {averageScore > 0 ? averageScore.toFixed(1) : 'N/A'}
                </span>
              </div>
              <span className="mx-2 text-gray-400">•</span>
              <span className="text-gray-600">{totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'}</span>
            </div>

            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Director</h2>
              <p>{movie.director}</p>
            </div>

            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Cast</h2>
              <p>{movie.cast.join(', ')}</p>
            </div>

            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Genre</h2>
              <div className="flex flex-wrap gap-2">
                {movie.genre.map((genre, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Plot</h2>
              <p className="text-gray-700">{movie.plot}</p>
            </div>

            {/* User Rating Form */}
            {isLoggedIn && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Rate this movie</h2>
                <RatingForm movieId={movie.id} />
              </div>
            )}
          </div>
        </div>

        {/* Tabs for Comments and Statistics */}
        <div className="border-t border-gray-200">
          <div className="flex border-b">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'comments'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('comments')}
            >
              Comments
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'statistics'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('statistics')}
            >
              Statistics
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'comments' ? (
              <CommentList movieId={movie.id} />
            ) : (
              <StatisticsPanel movieId={movie.id} />
            )}
          </div>
        </div>
      </div>

      {/* Movie Images Gallery */}
      {movie.images && movie.images.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Images</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {movie.images.map((image, index) => (
              <img 
                key={index}
                src={image}
                alt={`${movie.title} image ${index + 1}`}
                className="w-full h-40 object-cover rounded-lg shadow-md hover:opacity-90 transition-opacity cursor-pointer"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
