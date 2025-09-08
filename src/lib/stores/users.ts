import { writable } from 'svelte/store';
import { getUsers } from '../api/users';
import type { User } from '../types';

interface UsersState {
  users: User[];
  isLoading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  isLoading: false,
  error: null
};

function createUsersStore() {
  const { subscribe, set, update } = writable<UsersState>(initialState);

  return {
    subscribe,
    
    async load() {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const users = await getUsers();
        update(state => ({
          ...state,
          users,
          isLoading: false
        }));
      } catch (error) {
        console.error('Failed to load users:', error);
        update(state => ({
          ...state,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load users'
        }));
      }
    },

    reset() {
      set(initialState);
    }
  };
}

export const usersStore = createUsersStore();