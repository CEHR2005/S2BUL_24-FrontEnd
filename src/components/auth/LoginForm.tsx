import { useState } from 'react';
import { userService } from '../../services';
import { LoginUserDto } from '../../models';

/**
 * Props for the LoginForm component
 * @interface LoginFormProps
 * @property {Function} [onSuccess] - Optional callback function to be called on successful login when onLogin is not provided
 * @property {Function} [onLogin] - Optional callback function to be called on successful login (takes precedence over onSuccess)
 * @property {Function} onRegisterClick - Callback function to be called when the register button is clicked
 */
interface LoginFormProps {
  onSuccess?: () => void;
  onLogin?: () => void;
  onRegisterClick: () => void;
}

/**
 * Component for user login
 * 
 * This component renders a form for user login with email and password fields.
 * It handles form validation, submission, and error display.
 * On successful login, it calls either the onLogin or onSuccess callback.
 * 
 * @component
 * @example
 * ```tsx
 * const handleLoginSuccess = () => {
 *   // Handle successful login
 * };
 * 
 * const handleRegisterClick = () => {
 *   // Switch to register form
 * };
 * 
 * <LoginForm 
 *   onSuccess={handleLoginSuccess}
 *   onRegisterClick={handleRegisterClick}
 * />
 * ```
 */
export const LoginForm = ({ onSuccess, onLogin, onRegisterClick }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles form submission for login
   * 
   * This function validates the form inputs, calls the login service,
   * and handles success and error cases.
   * 
   * @param {React.FormEvent} e - The form event
   * @async
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form inputs
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    // Set loading state and clear any previous errors
    setIsLoading(true);
    setError('');

    try {
      // Prepare login data
      const loginData: LoginUserDto = {
        email,
        password
      };

      // Attempt to login
      await userService.login(loginData);

      // Call appropriate callback on success
      if (onLogin) {
        onLogin();
      } else if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // Handle login errors
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      // Reset loading state
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded" data-testid="login-error-message" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onRegisterClick}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
};
