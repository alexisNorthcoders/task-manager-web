import { apiClient } from './client';
import type { AuthResponse, LoginInput, RegisterInput } from '../types';

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

export function logout(): void {
  apiClient.clearAuthToken();
}