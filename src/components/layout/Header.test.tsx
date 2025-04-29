import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';
import { userService } from '../../services';

// Mock the userService
vi.mock('../../services', () => ({
  userService: {
    getCurrentUser: vi.fn(),
    addAuthStateListener: vi.fn(),
    removeAuthStateListener: vi.fn(),
    logout: vi.fn(),
  },
}));

describe('Header', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Clean up after tests
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders the header with logo', () => {
    // Mock user as not logged in
    vi.mocked(userService.getCurrentUser).mockReturnValue(null);
    
    render(<Header />);
    
    // Check if the logo/title is displayed
    expect(screen.getByText('Movie Database')).toBeInTheDocument();
    
    // Check if navigation link is displayed
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('shows login and register buttons when user is not logged in', () => {
    // Mock user as not logged in
    vi.mocked(userService.getCurrentUser).mockReturnValue(null);
    
    render(<Header />);
    
    // Check if login and register buttons are displayed
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
    
    // User welcome message should not be displayed
    expect(screen.queryByText(/Welcome/)).not.toBeInTheDocument();
  });

  it('shows user info and logout button when user is logged in', () => {
    // Mock user as logged in
    vi.mocked(userService.getCurrentUser).mockReturnValue({
      id: 'user1',
      username: 'testuser',
      email: 'test@example.com',
      is_admin: false,
      created_at: new Date(),
      updated_at: new Date(),
    });
    
    render(<Header />);
    
    // Check if welcome message is displayed
    expect(screen.getByText('Welcome, testuser')).toBeInTheDocument();
    
    // Check if profile and logout buttons are displayed
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    
    // Login and register buttons should not be displayed
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
    expect(screen.queryByText('Register')).not.toBeInTheDocument();
  });

  it('registers and unregisters auth state listener on mount and unmount', () => {
    // Mock user as not logged in
    vi.mocked(userService.getCurrentUser).mockReturnValue(null);
    
    const { unmount } = render(<Header />);
    
    // Check if addAuthStateListener was called
    expect(userService.addAuthStateListener).toHaveBeenCalled();
    
    // Unmount the component
    unmount();
    
    // Check if removeAuthStateListener was called
    expect(userService.removeAuthStateListener).toHaveBeenCalled();
  });
});