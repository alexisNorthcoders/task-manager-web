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

      // Disconnect WebSocket when user logs out
      import('../services/websocket').then(({ webSocketService }) => {
        webSocketService.disconnect();
      });
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

          // Ensure WebSocket is connected when user data is refreshed
          import('../services/websocket').then(({ webSocketService }) => {
            webSocketService.connect();
          });

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
              // Import and trigger WebSocket connection after successful auth
              import('../services/websocket').then(({ webSocketService }) => {
                webSocketService.connect();
              });
            } else {
              // Token is invalid or expired
              console.warn('Token is invalid or expired, clearing auth');
              update(state => ({
                ...state,
                isAuthenticated: false,
                isLoading: false
              }));
              apiClient.clearAuthToken();
            }
          } catch (error) {
            console.error('Failed to initialize auth:', error);
            // Check if this is an authentication error (400, 401, or auth-related messages)
            const isAuthError = error instanceof Error && (
              error.message.includes('401') ||
              error.message.includes('400') ||
              error.message.includes('Authentication error') ||
              error.message.includes('Unauthorized') ||
              error.message.includes('JWT') ||
              error.message.includes('Token')
            );
            
            if (isAuthError) {
              console.warn('Authentication failed, clearing token:', error.message);
              apiClient.clearAuthToken();
            } else {
              console.warn('Network or server error, keeping token for retry:', error.message);
            }
            
            update(state => ({
              ...state,
              isAuthenticated: false,
              isLoading: false
            }));
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