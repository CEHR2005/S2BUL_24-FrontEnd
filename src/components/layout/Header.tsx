import { useState, useEffect } from 'react';
import { userService } from '../../services';
import { SafeUser } from '../../models';

/**
 * Header component with navigation and user authentication
 */
export const Header = () => {
  const [currentUser, setCurrentUser] = useState<SafeUser | null>(userService.getCurrentUser());

  // Update currentUser when the component mounts and when the authentication state changes
  useEffect(() => {
    // Register callback to be notified of auth state changes
    const authStateCallback = (user: SafeUser | null) => {
      setCurrentUser(user);
    };

    userService.addAuthStateListener(authStateCallback);

    // Clean up on component unmount
    return () => {
      userService.removeAuthStateListener(authStateCallback);
    };
  }, []); // Empty dependency array - only run on mount and unmount

  const handleLogout = () => {
    userService.logout();
    // No need to manually update state, the callback will handle it
  };

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">Movie Database</div>

        <nav>
          <ul className="flex space-x-6">
            <li>
              <a href="/" className="hover:text-gray-300">Home</a>
            </li>
          </ul>
        </nav>

        <div>
          {currentUser ? (
            <div className="flex items-center space-x-4">
              <span>Welcome, {currentUser.username}</span>
              <a 
                href="/profile" 
                className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
              >
                Profile
              </a>
              <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <a 
                href="/login" 
                className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
              >
                Login
              </a>
              <a 
                href="/register" 
                className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
              >
                Register
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
