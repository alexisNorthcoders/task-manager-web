import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { User, AuthResponse } from '../types';
import { apiClient } from '../api/client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true
};

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>(initialState);

  return {
    subscribe,
    
    setAuth: (authResponse: AuthResponse) => {
      // Convert AuthResponse to User object
      const user: User = {
        id: '', // We don't have ID from auth response
        username: authResponse.username,
        email: authResponse.email,
        firstName: '', // We don't have these from auth response
        lastName: '',
        role: authResponse.role,
        createdAt: new Date().toISOString()
      };
      
      update(state => ({
        ...state,
        user,
        isAuthenticated: true,
        isLoading: false
      }));
    },
    
    setUser: (user: User) => {
      update(state => ({
        ...state,
        user,
        isAuthenticated: true,
        isLoading: false
      }));
    },
    
    clearUser: () => {
      update(state => ({
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false
      }));
      apiClient.clearAuthToken();
    },
    
    setLoading: (isLoading: boolean) => {
      update(state => ({
        ...state,
        isLoading
      }));
    },
    
    initialize: () => {
      if (browser) {
        const token = apiClient.getToken();
        if (token) {
          // TODO: Validate token with server and get user info
          update(state => ({
            ...state,
            isAuthenticated: !!token,
            isLoading: false
          }));
        } else {
          update(state => ({
            ...state,
            isLoading: false
          }));
        }
      }
    }
  };
}

export const auth = createAuthStore();