/**
 * Base API service for handling HTTP requests to the backend
 */
import { getCookie, setCookie, removeCookie } from '../utils/cookieUtils';

export class ApiService {
  private baseUrl: string;
  private readonly TOKEN_COOKIE_NAME = 'auth_token';

  constructor() {
    // Get the API URL from environment variables
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  }

  /**
   * Set the authentication token
   */
  public setToken(token: string): void {
    setCookie(this.TOKEN_COOKIE_NAME, token);
  }

  /**
   * Clear the authentication token
   */
  public clearToken(): void {
    removeCookie(this.TOKEN_COOKIE_NAME);
  }

  /**
   * Get the authentication token
   */
  public getToken(): string | null {
    return getCookie(this.TOKEN_COOKIE_NAME);
  }

  /**
   * Create headers for HTTP requests
   */
  private createHeaders(): Headers {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    const token = this.getToken();
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API error: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Make a GET request
   */
  public async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.createHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Make a POST request
   */
  public async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.createHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Make a POST request with form-urlencoded content type
   */
  public async postFormUrlEncoded<T>(endpoint: string, data: any): Promise<T> {
    const headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    const token = this.getToken();
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }

    // Convert data object to URL encoded string
    const formBody = Object.keys(data)
      .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
      .join('&');

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: headers,
      body: formBody,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Make a PUT request
   */
  public async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.createHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Make a DELETE request
   */
  public async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.createHeaders(),
    });

    return this.handleResponse<T>(response);
  }
}

// Export a singleton instance
export const apiService = new ApiService();
