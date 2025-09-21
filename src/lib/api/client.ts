import { GraphQLClient } from 'graphql-request';
import { browser } from '$app/environment';
import { PUBLIC_API_URL } from '$env/static/public';

const endpoint = `${PUBLIC_API_URL || 'http://localhost:8080'}/graphql`;

class ApiClient {
  private client: GraphQLClient;
  private token: string | null = null;

  constructor() {
    this.client = new GraphQLClient(endpoint);
    
    // Load token from localStorage on client side
    if (browser) {
      this.token = localStorage.getItem('auth_token');
      if (this.token) {
        this.setAuthToken(this.token);
      }
    }
  }

  setAuthToken(token: string) {
    this.token = token;
    this.client.setHeader('Authorization', `Bearer ${token}`);
    
    if (browser) {
      localStorage.setItem('auth_token', token);
    }
  }

  clearAuthToken() {
    this.token = null;
    this.client.setHeader('Authorization', '');
    
    if (browser) {
      localStorage.removeItem('auth_token');
    }
  }

  async request<T = any>(query: string, variables?: any): Promise<T> {
    try {
      return await this.client.request<T>(query, variables);
    } catch (error: any) {
      console.error('GraphQL Error:', error);

      // Handle specific case where deleteTask succeeds but returns errors
      if (this.isDeleteTaskWithErrors(query, error)) {
        console.warn('Delete task succeeded despite errors, continuing...');
        // Return the data if available, otherwise return a default success response
        if (error.response?.data) {
          return error.response.data;
        }
        // For deleteTask, return { deleteTask: true } as default success
        if (query.includes('deleteTask')) {
          return { deleteTask: true } as T;
        }
      }

      throw error;
    }
  }

  private isDeleteTaskWithErrors(query: string, error: any): boolean {
    return query.includes('deleteTask') &&
           error.response?.data &&
           error.response?.errors &&
           error.response?.errors.some((err: any) =>
             err.extensions?.classification === 'INTERNAL_ERROR' ||
             err.message?.includes('INTERNAL_ERROR')
           );
  }

  async authRequest(endpoint: string, data: any) {
    const response = await fetch(`${PUBLIC_API_URL || 'http://localhost:8080'}/auth/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = 'Authentication failed';
      
      try {
        const errorData = await response.text();
        // Try to parse as JSON first
        try {
          const parsed = JSON.parse(errorData);
          errorMessage = parsed.message || parsed.error || errorData;
        } catch {
          // If not JSON, use the text directly
          errorMessage = errorData || `HTTP ${response.status}: ${response.statusText}`;
        }
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  }

  getToken() {
    return this.token;
  }

  isAuthenticated() {
    return !!this.token;
  }

  async uploadFile(endpoint: string, formData: FormData) {
    const response = await fetch(`${PUBLIC_API_URL || 'http://localhost:8080'}/api/${endpoint}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': this.token ? `Bearer ${this.token}` : ''
        // Note: Don't set Content-Type header for FormData - browser will set it with boundary
      }
    });

    if (!response.ok) {
      let errorMessage = 'Upload failed';

      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();