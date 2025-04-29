import { useState, useEffect } from 'react';

interface MovieSearchProps {
  onSearch: (params: { title?: string; director?: string; genre?: string; rating?: number }) => void;
  initialTitle?: string;
  initialDirector?: string;
  initialGenre?: string;
  initialRating?: number;
}

/**
 * Component for searching movies with separate fields for title, director, genre, and rating
 */
export const MovieSearch = ({ 
  onSearch, 
  initialTitle = '', 
  initialDirector = '', 
  initialGenre = '',
  initialRating = 0
}: MovieSearchProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [director, setDirector] = useState(initialDirector);
  const [genre, setGenre] = useState(initialGenre);
  const [rating, setRating] = useState(initialRating);
  const [searchMode, setSearchMode] = useState<'basic' | 'advanced'>('basic');

  // Update local state when initial values change
  useEffect(() => {
    setTitle(initialTitle);
    setDirector(initialDirector);
    setGenre(initialGenre);
    setRating(initialRating);
  }, [initialTitle, initialDirector, initialGenre, initialRating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ 
      title: title.trim() || undefined, 
      director: director.trim() || undefined, 
      genre: genre.trim() || undefined,
      rating: rating > 0 ? rating : undefined
    });
  };

  const handleClear = () => {
    setTitle('');
    setDirector('');
    setGenre('');
    setRating(0);
    onSearch({});
  };

  const toggleSearchMode = () => {
    setSearchMode(searchMode === 'basic' ? 'advanced' : 'basic');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="mb-2 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Search Movies</h2>
        <button 
          type="button" 
          onClick={toggleSearchMode}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          {searchMode === 'basic' ? 'Advanced Search' : 'Basic Search'}
        </button>
      </div>

      {searchMode === 'basic' ? (
        <div className="flex items-center">
          <div className="relative flex-grow">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Search movies by title..."
              className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {title && (
              <button
                type="button"
                onClick={() => setTitle('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md"
          >
            Search
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter movie title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="director" className="block text-sm font-medium text-gray-700 mb-1">Director</label>
              <input
                id="director"
                type="text"
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                placeholder="Enter director name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
              <input
                id="genre"
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Enter genre"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Rating: {rating}
            </label>
            <input
              id="rating"
              type="range"
              min="0"
              max="10"
              step="1"
              value={rating}
              onChange={(e) => setRating(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
              <span>7</span>
              <span>8</span>
              <span>9</span>
              <span>10</span>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Clear
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Search
            </button>
          </div>
        </div>
      )}
    </form>
  );
};
