import { writable } from 'svelte/store';
import type { Task } from '../types';
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks';

interface TasksState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  isLoading: false,
  error: null
};

function createTasksStore() {
  const { subscribe, set, update } = writable<TasksState>(initialState);

  return {
    subscribe,

    // Load all tasks
    async load() {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const tasks = await getTasks();
        update(state => ({ ...state, tasks, isLoading: false }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load tasks';
        update(state => ({ ...state, error: errorMessage, isLoading: false }));
        throw error;
      }
    },

    // Create a new task with optimistic update
    async create(taskData: any) {
      try {
        // Optimistic update: add temporary task
        const tempId = `temp-${Date.now()}`;
        const tempTask: Task = {
          id: tempId,
          title: taskData.title,
          description: taskData.description || '',
          completed: false,
          status: 'TODO',
          dueDate: taskData.dueDate,
          estimationHours: taskData.estimationHours,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          assignedUsers: [],
          comments: [],
          activities: [],
          attachments: []
        };

        update(state => ({
          ...state,
          tasks: [tempTask, ...state.tasks],
          error: null
        }));

        // Make API call
        const newTask = await createTask(taskData);

        // Replace temp task with real task
        update(state => ({
          ...state,
          tasks: state.tasks.map(t => t.id === tempId ? newTask : t)
        }));

        return newTask;
      } catch (error) {
        // Remove temp task on error
        update(state => ({
          ...state,
          tasks: state.tasks.filter(t => !t.id.startsWith('temp-')),
          error: error instanceof Error ? error.message : 'Failed to create task'
        }));
        throw error;
      }
    },

    // Update a task with optimistic update
    async update(taskId: string, taskData: any) {
      // Store original task for rollback
      let originalTask: Task | undefined;
      
      try {
        // Optimistic update
        update(state => {
          const taskIndex = state.tasks.findIndex(t => t.id === taskId);
          if (taskIndex === -1) return state;

          originalTask = state.tasks[taskIndex];
          const updatedTask = {
            ...originalTask,
            ...taskData,
            updatedAt: new Date().toISOString()
          };

          const newTasks = [...state.tasks];
          newTasks[taskIndex] = updatedTask;

          return { ...state, tasks: newTasks, error: null };
        });

        // Make API call
        const updatedTask = await updateTask(taskId, taskData);

        // Update with server response
        update(state => ({
          ...state,
          tasks: state.tasks.map(t => t.id === taskId ? updatedTask : t)
        }));

        return updatedTask;
      } catch (error) {
        // Rollback on error
        if (originalTask) {
          update(state => ({
            ...state,
            tasks: state.tasks.map(t => t.id === taskId ? originalTask! : t),
            error: error instanceof Error ? error.message : 'Failed to update task'
          }));
        }
        throw error;
      }
    },

    // Delete a task with optimistic update
    async delete(taskId: string) {
      // Store original task for rollback
      let originalTask: Task | undefined;
      let originalIndex: number;

      try {
        // Optimistic update
        update(state => {
          const taskIndex = state.tasks.findIndex(t => t.id === taskId);
          if (taskIndex === -1) return state;

          originalTask = state.tasks[taskIndex];
          originalIndex = taskIndex;

          return {
            ...state,
            tasks: state.tasks.filter(t => t.id !== taskId),
            error: null
          };
        });

        // Make API call
        const result = await deleteTask(taskId);

        // If the API call succeeded (returned true), consider it successful
        // even if there were GraphQL errors (like INTERNAL_ERROR for logging)
        if (result === true) {
          // Clear any error state since the deletion succeeded
          update(state => ({ ...state, error: null }));
          return;
        }

        // If we get here, the API call failed and returned false
        throw new Error('Delete operation failed');
      } catch (error: any) {
        // Only rollback if it's not a known GraphQL error that we can handle
        const isKnownGraphQLError = error.message?.includes('INTERNAL_ERROR') ||
                                   error.message?.includes('GraphQL Error');

        if (originalTask && !isKnownGraphQLError) {
          update(state => {
            const newTasks = [...state.tasks];
            newTasks.splice(originalIndex, 0, originalTask!);
            return {
              ...state,
              tasks: newTasks,
              error: error instanceof Error ? error.message : 'Failed to delete task'
            };
          });
        } else if (isKnownGraphQLError) {
          // For known GraphQL errors that we've handled gracefully,
          // just clear the error state since the operation likely succeeded
          update(state => ({ ...state, error: null }));
          console.warn('Delete task completed with known GraphQL error:', error.message);
        }
        throw error;
      }
    },

    // Toggle task completion with optimistic update
    async toggleCompletion(taskId: string) {
      let originalTask: Task | undefined;

      try {
        // Get current task state
        update(state => {
          const task = state.tasks.find(t => t.id === taskId);
          if (task) {
            originalTask = { ...task };
          }
          return state;
        });

        if (!originalTask) return;

        const newCompleted = !originalTask.completed;
        const newStatus = newCompleted ? 'COMPLETED' : 'TODO';

        // Optimistic update
        update(state => ({
          ...state,
          tasks: state.tasks.map(t => 
            t.id === taskId 
              ? { ...t, completed: newCompleted, status: newStatus, updatedAt: new Date().toISOString() }
              : t
          ),
          error: null
        }));

        // Make API call
        const updatedTask = await updateTask(taskId, { 
          completed: newCompleted, 
          status: newStatus 
        });

        // Update with server response
        update(state => ({
          ...state,
          tasks: state.tasks.map(t => t.id === taskId ? updatedTask : t)
        }));

        return updatedTask;
      } catch (error) {
        // Rollback on error
        if (originalTask) {
          update(state => ({
            ...state,
            tasks: state.tasks.map(t => t.id === taskId ? originalTask! : t),
            error: error instanceof Error ? error.message : 'Failed to update task'
          }));
        }
        throw error;
      }
    },

    // Clear error
    clearError() {
      update(state => ({ ...state, error: null }));
    },

    // Get task by ID
    getTask(taskId: string) {
      let task: Task | undefined;
      const unsubscribe = subscribe(state => {
        task = state.tasks.find(t => t.id === taskId);
      });
      unsubscribe();
      return task;
    }
  };
}

export const tasksStore = createTasksStore();