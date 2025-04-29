import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RegisterForm } from './RegisterForm';
import { userService } from '../../services';

// Mock the userService
vi.mock('../../services', () => ({
  userService: {
    register: vi.fn(),
  },
}));

describe('RegisterForm', () => {
  // Mock callback functions
  const mockOnSuccess = vi.fn();
  const mockOnLoginClick = vi.fn();

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the registration form correctly', () => {
    render(
      <RegisterForm 
        onSuccess={mockOnSuccess} 
        onLoginClick={mockOnLoginClick} 
      />
    );

    // Check if required form elements are rendered
    expect(screen.getByLabelText(/username\*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email\*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password\*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password\*/i)).toBeInTheDocument();

    // Check if optional form elements are rendered
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument();

    // Check if buttons are rendered
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting an empty form', async () => {
    render(
      <RegisterForm 
        onSuccess={mockOnSuccess} 
        onLoginClick={mockOnLoginClick} 
      />
    );

    // Submit the form without entering any data
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    // Check if validation errors are displayed
    expect(screen.getByText(/username is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();

    // Verify that register service was not called
    expect(userService.register).not.toHaveBeenCalled();
  });

  it('shows validation error when passwords do not match', async () => {
    render(
      <RegisterForm 
        onSuccess={mockOnSuccess} 
        onLoginClick={mockOnLoginClick} 
      />
    );

    // Fill in the form with mismatched passwords
    fireEvent.change(screen.getByLabelText(/username\*/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/email\*/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password\*/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password\*/i), {
      target: { value: 'password456' }, // Different password
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    // Check if password mismatch error is displayed
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();

    // Verify that register service was not called
    expect(userService.register).not.toHaveBeenCalled();
  });

  it('shows validation error for invalid email format', async () => {
    render(
      <RegisterForm 
        onSuccess={mockOnSuccess} 
        onLoginClick={mockOnLoginClick} 
      />
    );

    // Fill in the form with invalid email
    fireEvent.change(screen.getByLabelText(/username\*/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/email\*/i), {
      target: { value: 'invalid-email' }, // Invalid email format
    });
    fireEvent.change(screen.getByLabelText(/^password\*/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password\*/i), {
      target: { value: 'password123' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    // Check if email validation error is displayed
    await waitFor(() => {
      const errorElement = screen.getByTestId('email-error');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent(/email is invalid/i);
    });

    // Verify that register service was not called
    expect(userService.register).not.toHaveBeenCalled();
  });

  it('shows validation error for short password', async () => {
    render(
      <RegisterForm 
        onSuccess={mockOnSuccess} 
        onLoginClick={mockOnLoginClick} 
      />
    );

    // Fill in the form with short password
    fireEvent.change(screen.getByLabelText(/username\*/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/email\*/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password\*/i), {
      target: { value: '12345' }, // Less than 6 characters
    });
    fireEvent.change(screen.getByLabelText(/confirm password\*/i), {
      target: { value: '12345' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    // Check if password length error is displayed
    expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();

    // Verify that register service was not called
    expect(userService.register).not.toHaveBeenCalled();
  });

  it('calls register service with correct data when form is valid', async () => {
    // Mock successful registration
    vi.mocked(userService.register).mockResolvedValue({
      id: 'user1',
      username: 'testuser',
      email: 'test@example.com',
      is_admin: false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    render(
      <RegisterForm 
        onSuccess={mockOnSuccess} 
        onLoginClick={mockOnLoginClick} 
      />
    );

    // Fill in the required fields
    fireEvent.change(screen.getByLabelText(/username\*/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/email\*/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password\*/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password\*/i), {
      target: { value: 'password123' },
    });

    // Fill in optional fields
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByLabelText(/age/i), {
      target: { value: '30' },
    });
    fireEvent.change(screen.getByLabelText(/gender/i), {
      target: { value: 'male' },
    });
    // Select a country from the dropdown (US for United States)
    fireEvent.change(screen.getByLabelText(/country/i), {
      target: { value: 'US' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    // Wait for the registration process to complete
    await waitFor(() => {
      // Verify that register service was called with correct data
      expect(userService.register).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
        age: 30,
        gender: 'male',
        country: 'United States',
        continent: 'NA', // North America
      });

      // Verify that onSuccess callback was called
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('shows error message when registration fails', async () => {
    // Mock failed registration
    vi.mocked(userService.register).mockRejectedValue(new Error('Username already exists'));

    render(
      <RegisterForm 
        onSuccess={mockOnSuccess} 
        onLoginClick={mockOnLoginClick} 
      />
    );

    // Fill in the required fields
    fireEvent.change(screen.getByLabelText(/username\*/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/email\*/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password\*/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password\*/i), {
      target: { value: 'password123' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    // Wait for the registration process to complete
    await waitFor(() => {
      // Verify that error message is displayed
      expect(screen.getByText(/username already exists/i)).toBeInTheDocument();

      // Verify that onSuccess callback was not called
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  it('calls onLoginClick when login button is clicked', () => {
    render(
      <RegisterForm 
        onSuccess={mockOnSuccess} 
        onLoginClick={mockOnLoginClick} 
      />
    );

    // Click the login button
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Verify that onLoginClick callback was called
    expect(mockOnLoginClick).toHaveBeenCalled();
  });
});
