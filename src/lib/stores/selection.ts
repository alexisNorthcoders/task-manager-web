import { writable } from 'svelte/store';

// Store for managing selected task IDs for bulk operations
export const selectedTaskIds = writable<Set<string>>(new Set());

// Helper functions for managing selection
export const selectionHelpers = {
  // Toggle a single task selection
  toggle: (taskId: string) => {
    selectedTaskIds.update(selected => {
      const newSelected = new Set(selected);
      if (newSelected.has(taskId)) {
        newSelected.delete(taskId);
      } else {
        newSelected.add(taskId);
      }
      return newSelected;
    });
  },

  // Select all tasks from a list
  selectAll: (taskIds: string[]) => {
    selectedTaskIds.update(selected => {
      const newSelected = new Set(selected);
      taskIds.forEach(id => newSelected.add(id));
      return newSelected;
    });
  },

  // Deselect all tasks from a list
  deselectAll: (taskIds: string[]) => {
    selectedTaskIds.update(selected => {
      const newSelected = new Set(selected);
      taskIds.forEach(id => newSelected.delete(id));
      return newSelected;
    });
  },

  // Clear all selections
  clear: () => {
    selectedTaskIds.set(new Set());
  },

  // Check if a task is selected
  isSelected: (taskId: string, selected: Set<string>) => {
    return selected.has(taskId);
  },

  // Check if all tasks in a list are selected
  areAllSelected: (taskIds: string[], selected: Set<string>) => {
    return taskIds.length > 0 && taskIds.every(id => selected.has(id));
  },

  // Check if some (but not all) tasks in a list are selected
  areSomeSelected: (taskIds: string[], selected: Set<string>) => {
    return taskIds.some(id => selected.has(id)) && !selectionHelpers.areAllSelected(taskIds, selected);
  }
};