import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as cookieUtils from '../utils/cookieUtils';

// Import the actual ApiService class for testing
import { ApiService } from './ApiService';

// Mock the cookieUtils
vi.mock('../utils/cookieUtils', () => ({
  getCookie: vi.fn(),
  setCookie: vi.fn(),
  removeCookie: vi.fn(),
}));

// Mock the fetch function
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('ApiService', () => {
  // Instance of ApiService to test
  let apiService: ApiService;

  // Mock response data
  const mockResponseData = { id: 1, name: 'Test' };
  const mockToken = 'test_token';
  const mockEndpoint = '/test';
  const mockBaseUrl = 'http://localhost:8000/api/v1';
  const mockFullUrl = `${mockBaseUrl}${mockEndpoint}`;

  // Helper function to create a mock response
  const createMockResponse = <T>(status = 200, data: T = mockResponseData as unknown as T) => {
    return {
      ok: status >= 200 && status < 300,
      status,
      json: vi.fn().mockResolvedValue(data),
    };
  };

  // Reset mocks and create a new instance before each test
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock implementation of fetch
    mockFetch.mockReset();
    // Mock import.meta.env.VITE_API_URL
    vi.stubGlobal('import', {
      meta: {
        env: {
          VITE_API_URL: mockBaseUrl,
        },
      },
    });
    // Create a new instance
    apiService = new ApiService();
  });

  // Restore mocks after all tests
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('token management', () => {
    it('should set a token', () => {
      apiService.setToken(mockToken);
      expect(cookieUtils.setCookie).toHaveBeenCalledWith('auth_token', mockToken);
    });

    it('should get a token', () => {
      vi.mocked(cookieUtils.getCookie).mockReturnValue(mockToken);
      const token = apiService.getToken();
      expect(cookieUtils.getCookie).toHaveBeenCalledWith('auth_token');
      expect(token).toBe(mockToken);
    });

    it('should clear a token', () => {
      apiService.clearToken();
      expect(cookieUtils.removeCookie).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('createHeaders', () => {
    it('should create headers with token when token exists', () => {
      // Create a new instance to access private method via any
      const service = new ApiService() as any;
      vi.mocked(cookieUtils.getCookie).mockReturnValue(mockToken);

      const headers = service.createHeaders();

      expect(headers.get('Content-Type')).toBe('application/json');
      expect(headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    });

    it('should create headers without token when token does not exist', () => {
      // Create a new instance to access private method via any
      const service = new ApiService() as any;
      vi.mocked(cookieUtils.getCookie).mockReturnValue(null);

      const headers = service.createHeaders();

      expect(headers.get('Content-Type')).toBe('application/json');
      expect(headers.get('Authorization')).toBeNull();
    });
  });

  describe('handleResponse', () => {
    it('should handle a successful response', async () => {
      // Create a new instance to access private method via any
      const service = new ApiService() as any;
      const mockResponse = createMockResponse();

      const result = await service.handleResponse(mockResponse);

      expect(mockResponse.json).toHaveBeenCalled();
      expect(result).toEqual(mockResponseData);
    });

    it('should throw an error for an unsuccessful response', async () => {
      // Create a new instance to access private method via any
      const service = new ApiService() as any;
      const errorData = { detail: 'Error message' };
      const mockResponse = createMockResponse(400, errorData);

      await expect(service.handleResponse(mockResponse)).rejects.toThrow('Error message');
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should throw a generic error when response has no detail', async () => {
      // Create a new instance to access private method via any
      const service = new ApiService() as any;
      const mockResponse = createMockResponse(500, {});

      await expect(service.handleResponse(mockResponse)).rejects.toThrow('API error: 500');
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should make a GET request successfully', async () => {
      const mockResponse = createMockResponse();
      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await apiService.get(mockEndpoint);

      expect(mockFetch).toHaveBeenCalledWith(mockFullUrl, {
        method: 'GET',
        headers: expect.any(Headers),
      });
      expect(result).toEqual(mockResponseData);
    });

    it('should throw an error when GET request fails', async () => {
      const errorData = { detail: 'Get failed' };
      const mockResponse = createMockResponse(400, errorData);
      mockFetch.mockResolvedValueOnce(mockResponse);

      await expect(apiService.get(mockEndpoint)).rejects.toThrow('Get failed');
    });
  });

  describe('post', () => {
    it('should make a POST request successfully', async () => {
      const mockResponse = createMockResponse();
      mockFetch.mockResolvedValueOnce(mockResponse);
      const postData = { name: 'Test Post' };

      const result = await apiService.post(mockEndpoint, postData);

      expect(mockFetch).toHaveBeenCalledWith(mockFullUrl, {
        method: 'POST',
        headers: expect.any(Headers),
        body: JSON.stringify(postData),
      });
      expect(result).toEqual(mockResponseData);
    });

    it('should throw an error when POST request fails', async () => {
      const errorData = { detail: 'Post failed' };
      const mockResponse = createMockResponse(400, errorData);
      mockFetch.mockResolvedValueOnce(mockResponse);

      await expect(apiService.post(mockEndpoint, {})).rejects.toThrow('Post failed');
    });
  });

  describe('postFormUrlEncoded', () => {
    it('should make a form-urlencoded POST request successfully', async () => {
      const mockResponse = createMockResponse();
      mockFetch.mockResolvedValueOnce(mockResponse);
      const formData = { username: 'test', password: 'password' };
      const expectedFormBody = 'username=test&password=password';

      const result = await apiService.postFormUrlEncoded(mockEndpoint, formData);

      expect(mockFetch).toHaveBeenCalledWith(mockFullUrl, {
        method: 'POST',
        headers: expect.any(Headers),
        body: expectedFormBody,
      });
      expect(result).toEqual(mockResponseData);
    });

    it('should throw an error when form-urlencoded POST request fails', async () => {
      const errorData = { detail: 'Form post failed' };
      const mockResponse = createMockResponse(400, errorData);
      mockFetch.mockResolvedValueOnce(mockResponse);

      await expect(apiService.postFormUrlEncoded(mockEndpoint, {})).rejects.toThrow('Form post failed');
    });
  });

  describe('put', () => {
    it('should make a PUT request successfully', async () => {
      const mockResponse = createMockResponse();
      mockFetch.mockResolvedValueOnce(mockResponse);
      const putData = { name: 'Test Put' };

      const result = await apiService.put(mockEndpoint, putData);

      expect(mockFetch).toHaveBeenCalledWith(mockFullUrl, {
        method: 'PUT',
        headers: expect.any(Headers),
        body: JSON.stringify(putData),
      });
      expect(result).toEqual(mockResponseData);
    });

    it('should throw an error when PUT request fails', async () => {
      const errorData = { detail: 'Put failed' };
      const mockResponse = createMockResponse(400, errorData);
      mockFetch.mockResolvedValueOnce(mockResponse);

      await expect(apiService.put(mockEndpoint, {})).rejects.toThrow('Put failed');
    });
  });

  describe('delete', () => {
    it('should make a DELETE request successfully', async () => {
      const mockResponse = createMockResponse();
      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await apiService.delete(mockEndpoint);

      expect(mockFetch).toHaveBeenCalledWith(mockFullUrl, {
        method: 'DELETE',
        headers: expect.any(Headers),
      });
      expect(result).toEqual(mockResponseData);
    });

    it('should throw an error when DELETE request fails', async () => {
      const errorData = { detail: 'Delete failed' };
      const mockResponse = createMockResponse(400, errorData);
      mockFetch.mockResolvedValueOnce(mockResponse);

      await expect(apiService.delete(mockEndpoint)).rejects.toThrow('Delete failed');
    });
  });
});
