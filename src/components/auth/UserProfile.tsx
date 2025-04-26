import { useState, useEffect } from 'react';
import { userService } from '../../services';
import { SafeUser, UpdateUserDto } from '../../models';

interface UserProfileProps {
  onSuccess?: () => void | Promise<void>;
}

/**
 * Component for displaying and editing user profile
 */
export const UserProfile = ({ onSuccess }: UserProfileProps) => {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState<number | undefined>(undefined);
  const [gender, setGender] = useState<string>('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load user data on component mount and listen for auth state changes
  useEffect(() => {
    const authStateListener = (currentUser: SafeUser | null) => {
      if (currentUser) {
        setUser(currentUser);
        setFirstName(currentUser.firstName || '');
        setLastName(currentUser.lastName || '');
        setAge(currentUser.age);
        setGender(currentUser.gender || '');
        setCountry(currentUser.country || '');
      }
    };

    // Add listener for auth state changes
    userService.addAuthStateListener(authStateListener);

    // Also check current user in case it's already loaded
    const currentUser = userService.getCurrentUser();
    if (currentUser) {
      authStateListener(currentUser);
    }

    // Clean up listener on unmount
    return () => {
      userService.removeAuthStateListener(authStateListener);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData: UpdateUserDto = {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        age: age || undefined,
        gender: gender as any || undefined,
        country: country || undefined
      };

      const updatedUser = await userService.updateUser(user.id, updateData);
      if (updatedUser) {
        setUser(updatedUser);
        setSuccess('Profile updated successfully');
        setIsEditing(false);

        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError('Failed to update profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">User Profile</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Edit Profile
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="username">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={user.username}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
              <p className="text-sm text-gray-500 mt-1">Username cannot be changed</p>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={user.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
              <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
            </div>

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
              <input
                type="text"
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-gray-500 font-medium mb-1">Username</h3>
            <p className="text-lg">{user.username}</p>
          </div>

          <div>
            <h3 className="text-gray-500 font-medium mb-1">Email</h3>
            <p className="text-lg">{user.email}</p>
          </div>

          <div>
            <h3 className="text-gray-500 font-medium mb-1">First Name</h3>
            <p className="text-lg">{user.firstName || '-'}</p>
          </div>

          <div>
            <h3 className="text-gray-500 font-medium mb-1">Last Name</h3>
            <p className="text-lg">{user.lastName || '-'}</p>
          </div>

          <div>
            <h3 className="text-gray-500 font-medium mb-1">Age</h3>
            <p className="text-lg">{user.age || '-'}</p>
          </div>

          <div>
            <h3 className="text-gray-500 font-medium mb-1">Gender</h3>
            <p className="text-lg">{user.gender || '-'}</p>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-gray-500 font-medium mb-1">Country</h3>
            <p className="text-lg">{user.country || '-'}</p>
          </div>

          {user.continent && (
            <div className="md:col-span-2">
              <h3 className="text-gray-500 font-medium mb-1">Continent</h3>
              <p className="text-lg">{user.continent}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
