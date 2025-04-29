import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from './LoginForm';
import { userService } from '../../services';

// Mock the userService
vi.mock('../../services', () => ({
  userService: {
    login: vi.fn(),
  },
}));

describe('LoginForm', () => {
  // Mock callback functions
  const mockOnSuccess = vi.fn();
  const mockOnLogin = vi.fn();
  const mockOnRegisterClick = vi.fn();

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the login form correctly', () => {
    render(
      <LoginForm 
        onSuccess={mockOnSuccess} 
        onLogin={mockOnLogin} 
        onRegisterClick={mockOnRegisterClick} 
      />
    );

    // Check if form elements are rendered
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('shows validation error when submitting empty form', async () => {
    render(
      <LoginForm 
        onSuccess={mockOnSuccess} 
        onLogin={mockOnLogin} 
        onRegisterClick={mockOnRegisterClick} 
      />
    );

    // Submit the form without entering any data
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Check if validation error is displayed
    await waitFor(() => {
      const errorElement = screen.getByTestId('login-error-message');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent(/please enter both email and password/i);
    });

    // Verify that login service was not called
    expect(userService.login).not.toHaveBeenCalled();
  });

  it('calls login service with correct data when form is submitted', async () => {
    // Mock successful login
    vi.mocked(userService.login).mockResolvedValue({
      id: 'user1',
      username: 'testuser',
      email: 'test@example.com',
      isAdmin: false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    render(
      <LoginForm 
        onSuccess={mockOnSuccess} 
        onLogin={mockOnLogin} 
        onRegisterClick={mockOnRegisterClick} 
      />
    );

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Check if button shows loading state
    expect(screen.getByRole('button', { name: /logging in/i })).toBeInTheDocument();

    // Wait for the login process to complete
    await waitFor(() => {
      // Verify that login service was called with correct data
      expect(userService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });

      // Verify that onLogin callback was called
      expect(mockOnLogin).toHaveBeenCalled();
    });
  });

  it('calls onSuccess when onLogin is not provided', async () => {
    // Mock successful login
    vi.mocked(userService.login).mockResolvedValue({
      id: 'user1',
      username: 'testuser',
      email: 'test@example.com',
      isAdmin: false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    render(
      <LoginForm 
        onSuccess={mockOnSuccess} 
        onRegisterClick={mockOnRegisterClick} 
      />
    );

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Wait for the login process to complete
    await waitFor(() => {
      // Verify that onSuccess callback was called
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('shows error message when login fails', async () => {
    // Mock failed login
    vi.mocked(userService.login).mockRejectedValue(new Error('Invalid credentials'));

    render(
      <LoginForm 
        onSuccess={mockOnSuccess} 
        onLogin={mockOnLogin} 
        onRegisterClick={mockOnRegisterClick} 
      />
    );

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrong_password' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Wait for the login process to complete
    await waitFor(() => {
      // Verify that error message is displayed
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();

      // Verify that callbacks were not called
      expect(mockOnLogin).not.toHaveBeenCalled();
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  it('calls onRegisterClick when register button is clicked', () => {
    render(
      <LoginForm 
        onSuccess={mockOnSuccess} 
        onLogin={mockOnLogin} 
        onRegisterClick={mockOnRegisterClick} 
      />
    );

    // Click the register button
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    // Verify that onRegisterClick callback was called
    expect(mockOnRegisterClick).toHaveBeenCalled();
  });
});
