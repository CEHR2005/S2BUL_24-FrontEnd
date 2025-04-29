import { useState, useEffect } from 'react';
import { Movie } from '../../models';
import { movieService } from '../../services';
import { MovieCard } from './MovieCard';
import { MovieSearch } from './MovieSearch';

interface MovieListProps {
  onMovieSelect?: (id: string) => void | Promise<void>;
}

/**
 * Component for displaying a list of movies with search and pagination
 */
export const MovieList = ({ onMovieSelect }: MovieListProps) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies,  setFilteredMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 12;

  // Load all movies on component mount
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const allMovies = await movieService.getAllMovies();
        setMovies(allMovies);
        setFilteredMovies(allMovies);
      } catch (error) {
        console.error('Failed to load movies:', error);
      }
    };

    fetchMovies();
  }, []);

  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);

    if (!query.trim()) {
      setFilteredMovies(movies);
      return;
    }

    try {
      const results = await movieService.searchMovies(query);
      setFilteredMovies(results);
    } catch (error) {
      console.error('Failed to search movies:', error);
      setFilteredMovies([]);
    }
  };

  // Calculate pagination
  const indexOfLastMovie = currentPage * moviesPerPage;
  const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
  const currentMovies = filteredMovies.slice(indexOfFirstMovie, indexOfLastMovie);
  const totalPages = Math.ceil(filteredMovies.length / moviesPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate to movie detail
  const handleMovieClick = (movieId: string) => {
    // In a real app, this would navigate to the movie detail page
    console.log(`Navigate to movie ${movieId}`);
    // history.push(`/movies/${movieId}`);

    if (onMovieSelect) {
      onMovieSelect(movieId);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Movies</h1>

      <MovieSearch onSearch={handleSearch} initialQuery={searchQuery} />

      {filteredMovies.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No movies found. Try a different search term.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {currentMovies.map(movie => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                onClick={() => handleMovieClick(movie.id)} 
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md mr-2 bg-gray-200 disabled:opacity-50"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 mx-1 rounded-md ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md ml-2 bg-gray-200 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};
