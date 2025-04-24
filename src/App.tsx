import { useState } from 'react';
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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <MainLayout>
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          <Link to="/" className="text-black no-underline">Movie Database</Link>
        </h1>
        <div className="space-x-2">
          {isLoggedIn ? (
            <>
              <Link 
                to="/movies/add"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded no-underline"
              >
                Add Movie
              </Link>
              <Link 
                to="/profile"
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded no-underline"
              >
                Profile
              </Link>
              <button 
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <Link 
              to="/login"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded no-underline"
            >
              Login
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
