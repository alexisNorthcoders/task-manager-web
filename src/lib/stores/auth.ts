import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { User } from '../types';
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