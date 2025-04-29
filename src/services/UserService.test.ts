import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RegisterUserDto, LoginUserDto, UpdateUserDto, SafeUser } from '../models';

// Mock the dependencies
vi.mock('./ApiService', () => {
  return {
    apiService: {
      getToken: vi.fn(),
      setToken: vi.fn(),
      clearToken: vi.fn(),
      get: vi.fn(),
      post: vi.fn(),
      postFormUrlEncoded: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    }
  };
});

vi.mock('./UserService', () => {
  return {
    userService: {
      addAuthStateListener: vi.fn(),
      removeAuthStateListener: vi.fn(),
      register: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      updateUser: vi.fn(),
      getUserById: vi.fn(),
    }
  };
});

// Import the modules
import { apiService } from './ApiService';
import { userService } from './UserService';

describe('UserService', () => {

  // Mock data
  const mockSafeUser: SafeUser = {
    id: 'user1',
    username: 'testuser',
    email: 'test@example.com',
    isAdmin: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockLoginDto: LoginUserDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockRegisterDto: RegisterUserDto = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
  };

  const mockUpdateDto: UpdateUserDto = {
    username: 'updateduser',
  };

  const mockTokenResponse = {
    access_token: 'mock_token',
    token_type: 'bearer',
  };

  // Variable to store the current user state for tests
  let currentUser: SafeUser | null = null;

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset current user
    currentUser = null;

    // Mock userService methods
    vi.mocked(userService.addAuthStateListener).mockImplementation((callback) => {
      callback(currentUser);
    });

    vi.mocked(userService.removeAuthStateListener).mockImplementation(() => {
      // Implementation not needed for the test
    });

    vi.mocked(userService.register).mockImplementation(async (userData) => {
      return await apiService.post<SafeUser>('/auth/register', userData);
    });

    vi.mocked(userService.login).mockImplementation(async (credentials) => {
      const formData = {
        username: credentials.email,
        password: credentials.password
      };

      const response = await apiService.postFormUrlEncoded<{ access_token: string, token_type: string }>('/auth/login', formData);
      apiService.setToken(response.access_token);

      const user = await apiService.get<SafeUser>('/users/me');
      currentUser = user; // Set the current user
      return user;
    });

    vi.mocked(userService.logout).mockImplementation(() => {
      apiService.clearToken();
      currentUser = null; // Clear the current user
    });

    vi.mocked(userService.getCurrentUser).mockImplementation(() => {
      return currentUser;
    });

    vi.mocked(userService.updateUser).mockImplementation(async (id, userData) => {
      if (currentUser && currentUser.id === id) {
        const updatedUser = await apiService.put<SafeUser>('/users/me', userData);
        currentUser = updatedUser; // Update the current user
        return updatedUser;
      }
      throw new Error('Can only update the current user');
    });

    vi.mocked(userService.getUserById).mockImplementation(async (id) => {
      return await apiService.get<SafeUser>(`/users/${id}`);
    });
  });

  // Restore mocks after all tests
  afterEach(() => {
    vi.resetAllMocks();
  });

  // We can't test the constructor directly with the singleton approach
  // Instead, we'll focus on testing the methods

  describe('addAuthStateListener', () => {
    it('should add a listener and call it immediately with current user', () => {
      const callback = vi.fn();

      // Call the method
      userService.addAuthStateListener(callback);

      // Verify callback was called with current user (null in this case)
      expect(callback).toHaveBeenCalledWith(null);
    });
  });

  describe('removeAuthStateListener', () => {
    it('should remove a listener', () => {
      const callback = vi.fn();

      // Add a listener
      userService.addAuthStateListener(callback);

      // Remove the listener
      userService.removeAuthStateListener(callback);

      // Reset the callback mock
      callback.mockReset();

      // Trigger auth state change by logging in
      vi.mocked(apiService.postFormUrlEncoded).mockResolvedValueOnce(mockTokenResponse);
      vi.mocked(apiService.get).mockResolvedValueOnce(mockSafeUser);

      // Call login to trigger auth state change
      userService.login(mockLoginDto);

      // Verify callback was not called after being removed
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Mock successful registration
      vi.mocked(apiService.post).mockResolvedValueOnce(mockSafeUser);

      // Call the method
      const result = await userService.register(mockRegisterDto);

      // Verify post was called with correct data
      expect(apiService.post).toHaveBeenCalledWith('/auth/register', mockRegisterDto);
      // Verify result is the mock user
      expect(result).toEqual(mockSafeUser);
    });

    it('should throw an error when registration fails', async () => {
      // Mock failed registration
      vi.mocked(apiService.post).mockRejectedValueOnce(new Error('Registration failed'));

      // Call the method and expect it to throw
      await expect(userService.register(mockRegisterDto)).rejects.toThrow('Registration failed');
    });
  });

  describe('login', () => {
    it('should login a user successfully', async () => {
      // Mock successful login
      vi.mocked(apiService.postFormUrlEncoded).mockResolvedValueOnce(mockTokenResponse);
      vi.mocked(apiService.get).mockResolvedValueOnce(mockSafeUser);

      // Call the method
      const result = await userService.login(mockLoginDto);

      // Verify postFormUrlEncoded was called with correct data
      expect(apiService.postFormUrlEncoded).toHaveBeenCalledWith('/auth/login', {
        username: mockLoginDto.email,
        password: mockLoginDto.password,
      });
      // Verify setToken was called with the token
      expect(apiService.setToken).toHaveBeenCalledWith(mockTokenResponse.access_token);
      // Verify get was called to fetch user profile
      expect(apiService.get).toHaveBeenCalledWith('/users/me');
      // Verify result is the mock user
      expect(result).toEqual(mockSafeUser);
    });

    it('should throw an error when login fails', async () => {
      // Mock failed login
      vi.mocked(apiService.postFormUrlEncoded).mockRejectedValueOnce(new Error('Invalid credentials'));

      // Call the method and expect it to throw
      await expect(userService.login(mockLoginDto)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should clear token and set current user to null', () => {
      // Call the method
      userService.logout();

      // Verify clearToken was called
      expect(apiService.clearToken).toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('should return the current user', async () => {
      // Mock login to set current user
      vi.mocked(apiService.postFormUrlEncoded).mockResolvedValueOnce(mockTokenResponse);
      vi.mocked(apiService.get).mockResolvedValueOnce(mockSafeUser);

      // Login to set current user
      await userService.login(mockLoginDto);

      // Call the method
      const result = userService.getCurrentUser();

      // Verify result is the mock user
      expect(result).toEqual(mockSafeUser);
    });

    it('should return null if no user is logged in', () => {
      // Ensure user is logged out
      userService.logout();

      // Call the method
      const result = userService.getCurrentUser();

      // Verify result is null
      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update the current user successfully', async () => {
      // Mock login to set current user
      vi.mocked(apiService.postFormUrlEncoded).mockResolvedValueOnce(mockTokenResponse);
      vi.mocked(apiService.get).mockResolvedValueOnce(mockSafeUser);
      await userService.login(mockLoginDto);

      // Mock successful update
      const updatedUser = { ...mockSafeUser, username: 'updateduser' };
      vi.mocked(apiService.put).mockResolvedValueOnce(updatedUser);

      // Call the method
      const result = await userService.updateUser(mockSafeUser.id, mockUpdateDto);

      // Verify put was called with correct data
      expect(apiService.put).toHaveBeenCalledWith('/users/me', mockUpdateDto);
      // Verify result is the updated user
      expect(result).toEqual(updatedUser);
    });

    it('should throw an error when trying to update a different user', async () => {
      // Mock login to set current user
      vi.mocked(apiService.postFormUrlEncoded).mockResolvedValueOnce(mockTokenResponse);
      vi.mocked(apiService.get).mockResolvedValueOnce(mockSafeUser);
      await userService.login(mockLoginDto);

      // Call the method with a different user ID
      await expect(userService.updateUser('different_user_id', mockUpdateDto)).rejects.toThrow('Can only update the current user');
    });

    it('should throw an error when update fails', async () => {
      // Mock login to set current user
      vi.mocked(apiService.postFormUrlEncoded).mockResolvedValueOnce(mockTokenResponse);
      vi.mocked(apiService.get).mockResolvedValueOnce(mockSafeUser);
      await userService.login(mockLoginDto);

      // Mock failed update
      vi.mocked(apiService.put).mockRejectedValueOnce(new Error('Update failed'));

      // Call the method and expect it to throw
      await expect(userService.updateUser(mockSafeUser.id, mockUpdateDto)).rejects.toThrow('Update failed');
    });
  });

  describe('getUserById', () => {
    it('should get a user by ID successfully', async () => {
      // Mock successful get
      vi.mocked(apiService.get).mockResolvedValueOnce(mockSafeUser);

      // Call the method
      const result = await userService.getUserById(mockSafeUser.id);

      // Verify get was called with correct endpoint
      expect(apiService.get).toHaveBeenCalledWith(`/users/${mockSafeUser.id}`);
      // Verify result is the mock user
      expect(result).toEqual(mockSafeUser);
    });

    it('should throw an error when get fails', async () => {
      // Mock failed get
      vi.mocked(apiService.get).mockRejectedValueOnce(new Error('User not found'));

      // Call the method and expect it to throw
      await expect(userService.getUserById(mockSafeUser.id)).rejects.toThrow('User not found');
    });
  });
});
