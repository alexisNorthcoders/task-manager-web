import { apiClient } from './client';
import type { AuthResponse, LoginInput, RegisterInput, User } from '../types';

export async function login(credentials: LoginInput): Promise<AuthResponse> {
  const response = await apiClient.authRequest('login', credentials);
  
  if (response.token) {
    apiClient.setAuthToken(response.token);
  }
  
  return response;
}

export async function register(userData: RegisterInput): Promise<AuthResponse> {
  const response = await apiClient.authRequest('register', userData);
  
  if (response.token) {
    apiClient.setAuthToken(response.token);
  }
  
  return response;
}

export function getCurrentUser(): User | null {
  const token = apiClient.getToken();
  if (!token) return null;
  
  // For now, we'll need to decode the token or make an API call to get user details
  // This is a simplified version - in production you'd want proper JWT decoding
  return null;
}

export function logout(): void {
  apiClient.clearAuthToken();
}