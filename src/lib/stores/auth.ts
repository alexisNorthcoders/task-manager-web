import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { User, AuthResponse } from '../types';
import { apiClient } from '../api/client';
import { getCurrentUser } from '../api/users';

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

    refreshUser: async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          update(state => ({
            ...state,
            user,
            isAuthenticated: true,
            isLoading: false
          }));
          return user;
        } else {
          // If we can't get user data, clear auth
          update(state => ({
            ...state,
            user: null,
            isAuthenticated: false,
            isLoading: false
          }));
          return null;
        }
      } catch (error) {
        console.error('Failed to refresh user data:', error);
        update(state => ({
          ...state,
          user: null,
          isAuthenticated: false,
          isLoading: false
        }));
        return null;
      }
    },

    updateUserAvatar: (avatarUrl: string) => {
      update(state => ({
        ...state,
        user: state.user ? { ...state.user, avatarUrl } : null
      }));
    },
    
    initialize: async () => {
      if (browser) {
        const token = apiClient.getToken();
        if (token) {
          // Try to get user data from the server
          try {
            const user = await getCurrentUser();
            if (user) {
              update(state => ({
                ...state,
                user,
                isAuthenticated: true,
                isLoading: false
              }));
            } else {
              // Token is invalid or expired
              update(state => ({
                ...state,
                isAuthenticated: false,
                isLoading: false
              }));
              apiClient.clearAuthToken();
            }
          } catch (error) {
            console.error('Failed to initialize auth:', error);
            update(state => ({
              ...state,
              isAuthenticated: false,
              isLoading: false
            }));
            apiClient.clearAuthToken();
          }
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