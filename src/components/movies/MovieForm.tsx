import { useState, useEffect } from 'react';
import { Movie, CreateMovieDto, UpdateMovieDto } from '../../models';
import { movieService } from '../../services';

interface MovieFormProps {
  movieId?: string;
  onSuccess: () => void | Promise<void>;
  onSave?: (movie: Movie) => void;
  onCancel?: () => void;
}

/**
 * Form component for adding or editing a movie
 */
export const MovieForm = ({ movieId, onSuccess, onSave, onCancel }: MovieFormProps) => {
  const [title, setTitle] = useState('');
  const [release_year, setReleaseYear] = useState<number>(new Date().getFullYear());
  const [director, setDirector] = useState('');
  const [cast, setCast] = useState<string[]>([]);
  const [castInput, setCastInput] = useState('');
  const [genre, setGenre] = useState<string[]>([]);
  const [genreInput, setGenreInput] = useState('');
  const [plot, setPlot] = useState('');
  const [duration, setDuration] = useState<number>(0);
  const [posterUrl, setPosterUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load movie data if editing an existing movie
  useEffect(() => {
    const fetchMovie = async () => {
      if (movieId) {
        try {
          const movie = await movieService.getMovieById(movieId);
          setTitle(movie.title);
          setReleaseYear(movie.release_year);
          setDirector(movie.director);
          setCast(movie.cast);
          setGenre(movie.genre);
          setPlot(movie.plot);
          setDuration(movie.duration);
          setPosterUrl(movie.poster_url || '');
          setImages(movie.images || []);
        } catch (error) {
          console.error('Failed to load movie:', error);
          setErrors({ submit: 'Failed to load movie data' });
        }
      }
    };

    fetchMovie();
  }, [movieId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!director.trim()) {
      newErrors.director = 'Director is required';
    }

    if (cast.length === 0) {
      newErrors.cast = 'At least one cast member is required';
    }

    if (genre.length === 0) {
      newErrors.genre = 'At least one genre is required';
    }

    if (!plot.trim()) {
      newErrors.plot = 'Plot is required';
    }

    if (duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const movieData: CreateMovieDto = {
      title,
      release_year,
      director,
      cast,
      genre,
      plot,
      duration,
      poster_url: posterUrl || undefined,
      images: images.length > 0 ? images : undefined
    };

    try {
      let savedMovie: Movie;

      if (movieId) {
        // Update existing movie
        savedMovie = await movieService.updateMovie(movieId, movieData as UpdateMovieDto);
      } else {
        // Create new movie
        savedMovie = await movieService.createMovie(movieData);
      }

      if (onSave) {
        onSave(savedMovie);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to save movie:', error);
      setErrors({ submit: 'Failed to save movie' });
    }
  };

  const handleAddCast = () => {
    if (castInput.trim()) {
      setCast([...cast, castInput.trim()]);
      setCastInput('');
    }
  };

  const handleRemoveCast = (index: number) => {
    setCast(cast.filter((_, i) => i !== index));
  };

  const handleAddGenre = () => {
    if (genreInput.trim()) {
      setGenre([...genre, genreInput.trim()]);
      setGenreInput('');
    }
  };

  const handleRemoveGenre = (index: number) => {
    setGenre(genre.filter((_, i) => i !== index));
  };

  const handleAddImage = () => {
    if (imageInput.trim()) {
      setImages([...images, imageInput.trim()]);
      setImageInput('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">
        {movieId ? 'Edit Movie' : 'Add New Movie'}
      </h2>

      {errors.submit && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errors.submit}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="title">
            Title*
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Release Year */}
        <div>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="releaseYear">
            Release Year*
          </label>
          <input
            type="number"
            id="releaseYear"
            value={release_year}
            onChange={(e) => setReleaseYear(parseInt(e.target.value) || 0)}
            min="1900"
            max={new Date().getFullYear() + 5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Director */}
        <div>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="director">
            Director*
          </label>
          <input
            type="text"
            id="director"
            value={director}
            onChange={(e) => setDirector(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.director ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.director && (
            <p className="text-red-500 text-sm mt-1">{errors.director}</p>
          )}
        </div>

        {/* Duration */}
        <div>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="duration">
            Duration (minutes)*
          </label>
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
            min="1"
            className={`w-full px-3 py-2 border rounded-md ${
              errors.duration ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.duration && (
            <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
          )}
        </div>
      </div>

      {/* Cast */}
      <div className="mt-6">
        <label className="block text-gray-700 font-medium mb-2">
          Cast*
        </label>
        <div className="flex">
          <input
            type="text"
            value={castInput}
            onChange={(e) => setCastInput(e.target.value)}
            placeholder="Add cast member"
            className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md"
          />
          <button
            type="button"
            onClick={handleAddCast}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md"
          >
            Add
          </button>
        </div>
        {errors.cast && (
          <p className="text-red-500 text-sm mt-1">{errors.cast}</p>
        )}
        <div className="flex flex-wrap gap-2 mt-2">
          {cast.map((member, index) => (
            <div key={index} className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
              <span>{member}</span>
              <button
                type="button"
                onClick={() => handleRemoveCast(index)}
                className="ml-2 text-gray-500 hover:text-red-500"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Genre */}
      <div className="mt-6">
        <label className="block text-gray-700 font-medium mb-2">
          Genre*
        </label>
        <div className="flex">
          <input
            type="text"
            value={genreInput}
            onChange={(e) => setGenreInput(e.target.value)}
            placeholder="Add genre"
            className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md"
          />
          <button
            type="button"
            onClick={handleAddGenre}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md"
          >
            Add
          </button>
        </div>
        {errors.genre && (
          <p className="text-red-500 text-sm mt-1">{errors.genre}</p>
        )}
        <div className="flex flex-wrap gap-2 mt-2">
          {genre.map((g, index) => (
            <div key={index} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              <span>{g}</span>
              <button
                type="button"
                onClick={() => handleRemoveGenre(index)}
                className="ml-2 text-blue-500 hover:text-red-500"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Plot */}
      <div className="mt-6">
        <label className="block text-gray-700 font-medium mb-2" htmlFor="plot">
          Plot*
        </label>
        <textarea
          id="plot"
          value={plot}
          onChange={(e) => setPlot(e.target.value)}
          rows={4}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.plot ? 'border-red-500' : 'border-gray-300'
          }`}
        ></textarea>
        {errors.plot && (
          <p className="text-red-500 text-sm mt-1">{errors.plot}</p>
        )}
      </div>

      {/* Poster URL */}
      <div className="mt-6">
        <label className="block text-gray-700 font-medium mb-2" htmlFor="posterUrl">
          Poster URL
        </label>
        <input
          type="text"
          id="posterUrl"
          value={posterUrl}
          onChange={(e) => setPosterUrl(e.target.value)}
          placeholder="https://example.com/poster.jpg"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Images */}
      <div className="mt-6">
        <label className="block text-gray-700 font-medium mb-2">
          Additional Images
        </label>
        <div className="flex">
          <input
            type="text"
            value={imageInput}
            onChange={(e) => setImageInput(e.target.value)}
            placeholder="Add image URL"
            className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md"
          />
          <button
            type="button"
            onClick={handleAddImage}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md"
          >
            Add
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img 
                src={image} 
                alt={`Movie image ${index + 1}`} 
                className="w-full h-24 object-cover rounded-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+URL';
                }}
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Form Actions */}
      <div className="mt-8 flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
        >
          {movieId ? 'Update Movie' : 'Add Movie'}
        </button>
      </div>
    </form>
  );
};
