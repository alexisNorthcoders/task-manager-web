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
    } catch (error) {
      console.error('GraphQL Error:', error);
      throw error;
    }
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
      const error = await response.text();
      throw new Error(error || 'Authentication failed');
    }

    return response.json();
  }

  getToken() {
    return this.token;
  }

  isAuthenticated() {
    return !!this.token;
  }
}

export const apiClient = new ApiClient();