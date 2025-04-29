import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock the services
vi.mock('../services/UserService', () => ({
  userService: {
    getCurrentUser: vi.fn(),
    addAuthStateListener: vi.fn(),
    removeAuthStateListener: vi.fn(),
  }
}));

vi.mock('../services/CommentService', () => ({
  commentService: {
    updateComment: vi.fn(),
    deleteComment: vi.fn(),
  }
}));

// Reset all mocks before each test
beforeEach(() => {
  vi.resetAllMocks();
});