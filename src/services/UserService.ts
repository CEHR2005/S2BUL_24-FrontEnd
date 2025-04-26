import { RegisterUserDto, LoginUserDto, UpdateUserDto, SafeUser } from '../models';
import { apiService } from './ApiService';

/**
 * Service for handling user-related operations
 */
export class UserService {
  private currentUser: SafeUser | null = null;
  private authStateListeners: Array<(user: SafeUser | null) => void> = [];

  constructor() {
    // Check for existing session on initialization
    this.checkForExistingSession();
  }

  /**
   * Add a listener for authentication state changes
   */
  public addAuthStateListener(callback: (user: SafeUser | null) => void): void {
    this.authStateListeners.push(callback);
    // Immediately call with current state
    callback(this.currentUser);
  }

  /**
   * Remove a listener for authentication state changes
   */
  public removeAuthStateListener(callback: (user: SafeUser | null) => void): void {
    this.authStateListeners = this.authStateListeners.filter(cb => cb !== callback);
  }

  /**
   * Set the current user and notify listeners
   */
  private setCurrentUser(user: SafeUser | null): void {
    this.currentUser = user;
    // Notify all listeners
    this.authStateListeners.forEach(callback => callback(user));
  }

  /**
   * Check if there's an existing session (token in cookie)
   * and load the user profile if a token exists
   */
  private async checkForExistingSession(): Promise<void> {
    try {
      // If there's a token in the cookie, try to get the user profile
      if (apiService.getToken()) {
        const userProfile = await this.getCurrentUserProfile();
        this.setCurrentUser(userProfile);
      }
    } catch (error) {
      // If there's an error (e.g., token expired), clear the token
      apiService.clearToken();
      this.setCurrentUser(null);
    }
  }

  /**
   * Register a new user
   */
  public async register(userData: RegisterUserDto): Promise<SafeUser> {
    try {
      const response = await apiService.post<SafeUser>('/auth/register', userData);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to register user');
    }
  }

  /**
   * Login a user
   */
  public async login(credentials: LoginUserDto): Promise<SafeUser> {
    try {
      // The backend expects username and password for OAuth2 compatibility
      const formData = {
        username: credentials.email, // Backend accepts email as username
        password: credentials.password
      };

      const response = await apiService.postFormUrlEncoded<{ access_token: string, token_type: string }>('/auth/login', formData);

      // Store the token for future authenticated requests
      apiService.setToken(response.access_token);

      // Get the user profile
      const userProfile = await this.getCurrentUserProfile();
      this.setCurrentUser(userProfile);

      return userProfile;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to login');
    }
  }

  /**
   * Logout the current user
   */
  public logout(): void {
    apiService.clearToken();
    this.setCurrentUser(null);
  }

  /**
   * Get the current logged-in user profile from the API
   */
  private async getCurrentUserProfile(): Promise<SafeUser> {
    try {
      return await apiService.get<SafeUser>('/users/me');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to get user profile');
    }
  }

  /**
   * Get the current logged-in user
   */
  public getCurrentUser(): SafeUser | null {
    return this.currentUser;
  }

  /**
   * Update a user's profile
   */
  public async updateUser(id: string, userData: UpdateUserDto): Promise<SafeUser> {
    try {
      // For the current user, use the /me endpoint
      if (this.currentUser && this.currentUser.id === id) {
        const updatedUser = await apiService.put<SafeUser>('/users/me', userData);
        this.currentUser = updatedUser;
        return updatedUser;
      }

      throw new Error('Can only update the current user');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to update user');
    }
  }

  /**
   * Get a user by ID
   */
  public async getUserById(id: string): Promise<SafeUser> {
    try {
      return await apiService.get<SafeUser>(`/users/${id}`);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to get user');
    }
  }
}

// Export a singleton instance
export const userService = new UserService();
