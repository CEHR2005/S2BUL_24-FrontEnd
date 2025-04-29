import { useState, useEffect } from 'react';
import { Link, Navigate, Outlet, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import './App.css';
import {
  MainLayout,
  MovieList,
  MovieDetail,
  MovieForm,
  LoginForm,
  RegisterForm,
  UserProfile,
} from './components';
import { userService } from './services';


// Movie Detail wrapper component to handle route params
const MovieDetailWrapper = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();

  if (!movieId) {
    return <div>Movie not found</div>;
  }

  return <MovieDetail movieId={movieId} onBack={() => navigate('/')} />;
};

// Movie Edit wrapper component to handle route params
const MovieEditWrapper = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();

  if (!movieId) {
    return <div>Movie not found</div>;
  }

  return <MovieForm movieId={movieId} onSuccess={() => navigate(`/movies/${movieId}`)} />;
};

// Movie Add wrapper component
const MovieAddWrapper = () => {
  const navigate = useNavigate();
  return <MovieForm onSuccess={() => navigate('/')} />;
};

// Login wrapper component
const LoginWrapper = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate('/');
  };

  if (isLoggedIn) {
    return <Navigate to="/" />;
  }

  return <LoginForm onLogin={handleLogin} onRegisterClick={() => navigate('/register')} />;
};

// Register wrapper component
const RegisterWrapper = () => {
  const navigate = useNavigate();
  return <RegisterForm onSuccess={() => navigate('/login')} onLoginClick={() => navigate('/login')} />;
};

// Profile wrapper component
const ProfileWrapper = () => {
  const navigate = useNavigate();
  return <UserProfile onSuccess={() => navigate('/')} />;
};

// Home wrapper component
const HomeWrapper = () => {
  const navigate = useNavigate();
  return <MovieList onMovieSelect={(id) => navigate(`/movies/${id}`)} />;
};

// App Layout component
const AppLayout = () => {
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  // Update currentUser when the component mounts and when the authentication state changes
  useEffect(() => {
    // Set initial user state
    setCurrentUser(userService.getCurrentUser());

    // Register callback to be notified of auth state changes
    const authStateCallback = (user: any | null) => {
      setCurrentUser(user);
    };

    userService.addAuthStateListener(authStateCallback);

    // Clean up on component unmount
    return () => {
      userService.removeAuthStateListener(authStateCallback);
    };
  }, []); // Empty dependency array - only run on mount and unmount

  return (
    <MainLayout>
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          <Link to="/" className="text-black no-underline">Movie Database</Link>
        </h1>
        <div className="space-x-2">
          {currentUser && (
            <Link
                to="/movies/add"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded no-underline"
            >
              Add Movie
            </Link>
          )}
        </div>
      </div>
      <Outlet />
    </MainLayout>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<HomeWrapper />} />
        <Route path="movies/add" element={<MovieAddWrapper />} />
        <Route path="movies/:movieId/edit" element={<MovieEditWrapper />} />
        <Route path="movies/:movieId" element={<MovieDetailWrapper />} />
        <Route path="login" element={<LoginWrapper />} />
        <Route path="register" element={<RegisterWrapper />} />
        <Route path="profile" element={<ProfileWrapper />} />
        <Route path="*" element={<div>Page not found</div>} />
      </Route>
    </Routes>
  );
}

export default App;
