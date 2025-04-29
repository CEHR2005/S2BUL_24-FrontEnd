import { useState, useEffect } from 'react';
import { userService } from '../../services';
import { RegisterUserDto } from '../../models';
import { countries, TCountryCode } from 'countries-list';

/**
 * Props for the RegisterForm component
 * @interface RegisterFormProps
 * @property {Function} onSuccess - Callback function to be called on successful registration
 * @property {Function} onLoginClick - Callback function to be called when the login button is clicked
 */
interface RegisterFormProps {
  onSuccess: () => void;
  onLoginClick: () => void;
}

/**
 * Component for user registration
 * 
 * This component renders a form for user registration with required fields (username, email, password)
 * and optional fields (first name, last name, age, gender, country).
 * It handles form validation, submission, and error display.
 * 
 * @component
 * @example
 * ```tsx
 * const handleRegistrationSuccess = () => {
 *   // Handle successful registration
 * };
 * 
 * const handleLoginClick = () => {
 *   // Switch to login form
 * };
 * 
 * <RegisterForm 
 *   onSuccess={handleRegistrationSuccess}
 *   onLoginClick={handleLoginClick}
 * />
 * ```
 */
export const RegisterForm = ({ onSuccess, onLoginClick }: RegisterFormProps) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState<number | undefined>(undefined);
  const [gender, setGender] = useState<string>('');
  const [countryCode, setCountryCode] = useState<TCountryCode | ''>('');
  const [continent, setContinent] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Gets the continent based on the country code
   * 
   * @param {TCountryCode | string} code - The country code
   * @returns {string | undefined} The continent code or undefined if not found
   */
  const getContinentFromCountryCode = (code: TCountryCode | string): string | undefined => {
    if (!code) return undefined;

    // Check if the code is a valid country code
    if (Object.prototype.hasOwnProperty.call(countries, code)) {
      return countries[code as TCountryCode].continent;
    }

    return undefined;
  };

  // Update continent when country code changes
  useEffect(() => {
    if (countryCode) {
      const detectedContinent = getContinentFromCountryCode(countryCode);
      setContinent(detectedContinent);
      console.log(detectedContinent);
    } else {
      setContinent(undefined);
    }
  }, [countryCode]);

  /**
   * Validates the form inputs
   * 
   * Checks if required fields are filled, email format is valid,
   * password meets minimum length requirements, and passwords match.
   * Sets error messages for invalid fields.
   * 
   * @returns {boolean} True if the form is valid, false otherwise
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate username
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }

    // Validate email
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    // Validate password
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Set errors and return validation result
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission for registration
   * 
   * This function validates the form inputs, calls the registration service,
   * and handles success and error cases.
   * 
   * @param {React.FormEvent} e - The form event
   * @async
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    // Set loading state
    setIsLoading(true);

    try {
      // Get country name from country code
      let countryName: string | undefined = undefined;
      if (countryCode && Object.prototype.hasOwnProperty.call(countries, countryCode)) {
        countryName = countries[countryCode as TCountryCode].name;
      }

      // Ensure continent is set if country code is provided
      let currentContinent = continent;
      if (countryCode && !currentContinent) {
        currentContinent = getContinentFromCountryCode(countryCode);
      }

      // Prepare registration data
      const registerData: RegisterUserDto = {
        username,
        email,
        password,
        first_name: firstName || undefined,
        last_name: lastName || undefined,
        age: age || undefined,
        gender: gender as 'male' | 'female' | 'other' | 'prefer not to say' || undefined,
        country: countryName || undefined,
        continent: currentContinent || undefined
      };

      // Attempt to register
      await userService.register(registerData);
      onSuccess();
    } catch (err) {
      // Handle registration errors
      setErrors({
        submit: err instanceof Error ? err.message : 'Registration failed'
      });
    } finally {
      // Reset loading state
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

      {errors.submit && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Required Fields */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="username">
            Username*
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.username ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">{errors.username}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
            Email*
          </label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1" data-testid="email-error" role="alert">{errors.email}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="password">
            Password*
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="confirmPassword">
            Confirm Password*
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Optional Fields */}
        <div className="mt-6 mb-4">
          <h3 className="text-lg font-medium mb-2">Profile Information (Optional)</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="firstName">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="lastName">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="age">
                Age
              </label>
              <input
                type="number"
                id="age"
                value={age === undefined ? '' : age}
                onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : undefined)}
                min="1"
                max="120"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="gender">
                Gender
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="country">
                Country
              </label>
              <select
                id="country"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value as TCountryCode | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select country</option>
                {Object.entries(countries).map(([code, data]) => (
                  <option key={code} value={code}>
                    {data.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-4"
          disabled={isLoading}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onLoginClick}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};
