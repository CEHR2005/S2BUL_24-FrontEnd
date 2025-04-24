import { User, RegisterUserDto, LoginUserDto, UpdateUserDto, SafeUser } from '../models/User';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service for handling user-related operations
 */
export class UserService {
  private users: User[] = [];
  private currentUser: SafeUser | null = null;

  /**
   * Register a new user
   */
  public register(userData: RegisterUserDto): SafeUser {
    // Check if email already exists
    if (this.users.some(user => user.email === userData.email)) {
      throw new Error('Email already in use');
    }

    // Check if username already exists
    if (this.users.some(user => user.username === userData.username)) {
      throw new Error('Username already in use');
    }

    const now = new Date();
    const newUser: User = {
      id: uuidv4(),
      ...userData,
      isAdmin: false,
      continent: this.getContinentFromCountry(userData.country),
      createdAt: now,
      updatedAt: now
    };

    this.users.push(newUser);
    
    // Return user without password
    const { password, ...safeUser } = newUser;
    return safeUser;
  }

  /**
   * Login a user
   */
  public login(credentials: LoginUserDto): SafeUser {
    const user = this.users.find(
      user => user.email === credentials.email && user.password === credentials.password
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Set current user
    const { password, ...safeUser } = user;
    this.currentUser = safeUser;
    
    return safeUser;
  }

  /**
   * Logout the current user
   */
  public logout(): void {
    this.currentUser = null;
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
  public updateUser(id: string, userData: UpdateUserDto): SafeUser | undefined {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return undefined;
    }

    // Update continent if country is updated
    let continent = this.users[userIndex].continent;
    if (userData.country) {
      continent = this.getContinentFromCountry(userData.country);
    }

    const updatedUser: User = {
      ...this.users[userIndex],
      ...userData,
      continent,
      updatedAt: new Date()
    };

    this.users[userIndex] = updatedUser;
    
    // Update current user if this is the logged-in user
    if (this.currentUser && this.currentUser.id === id) {
      const { password, ...safeUser } = updatedUser;
      this.currentUser = safeUser;
    }

    // Return user without password
    const { password, ...safeUser } = updatedUser;
    return safeUser;
  }

  /**
   * Get a user by ID
   */
  public getUserById(id: string): SafeUser | undefined {
    const user = this.users.find(user => user.id === id);
    if (!user) {
      return undefined;
    }
    
    // Return user without password
    const { password, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Helper method to determine continent from country
   * This is a simplified version - in a real app, you'd use a proper mapping
   */
  private getContinentFromCountry(country?: string): string | undefined {
    if (!country) return undefined;
    
    // This is a very simplified mapping
    const continentMap: Record<string, string> = {
      'USA': 'North America',
      'Canada': 'North America',
      'Mexico': 'North America',
      'Brazil': 'South America',
      'Argentina': 'South America',
      'UK': 'Europe',
      'France': 'Europe',
      'Germany': 'Europe',
      'Italy': 'Europe',
      'Spain': 'Europe',
      'China': 'Asia',
      'Japan': 'Asia',
      'India': 'Asia',
      'Australia': 'Australia',
      'New Zealand': 'Australia',
      'Egypt': 'Africa',
      'South Africa': 'Africa',
      'Nigeria': 'Africa'
    };
    
    return continentMap[country] || undefined;
  }
}

// Export a singleton instance
export const userService = new UserService();