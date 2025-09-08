import { goto } from '$app/navigation';
import { get } from 'svelte/store';
import { selectedTaskIds, selectionHelpers } from '../stores/selection';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
  context?: string; // Where this shortcut is available
}

class KeyboardShortcutService {
  private shortcuts: KeyboardShortcut[] = [];
  private isListening = false;

  constructor() {
    this.registerDefaultShortcuts();
  }

  private registerDefaultShortcuts() {
    // Global shortcuts
    this.register({
      key: 'n',
      ctrl: true,
      action: () => goto('/tasks/new'),
      description: 'Create new task',
      context: 'global'
    });

    this.register({
      key: 'f',
      ctrl: true,
      action: () => this.focusSearch(),
      description: 'Focus search field',
      context: 'tasks'
    });

    this.register({
      key: 't',
      ctrl: true,
      action: () => goto('/templates'),
      description: 'Go to templates',
      context: 'global'
    });

    this.register({
      key: 'd',
      ctrl: true,
      action: () => goto('/dashboard'),
      description: 'Go to dashboard',
      context: 'global'
    });

    // Task selection shortcuts
    this.register({
      key: 'a',
      ctrl: true,
      action: () => this.selectAllTasks(),
      description: 'Select all tasks',
      context: 'tasks'
    });

    this.register({
      key: 'Escape',
      action: () => this.clearSelection(),
      description: 'Clear selection',
      context: 'tasks'
    });

    this.register({
      key: 'Delete',
      action: () => this.deleteSelectedTasks(),
      description: 'Delete selected tasks',
      context: 'tasks'
    });

    // Bulk action shortcuts
    this.register({
      key: '1',
      ctrl: true,
      action: () => this.setBulkStatus('TODO'),
      description: 'Mark selected as To Do',
      context: 'tasks'
    });

    this.register({
      key: '2',
      ctrl: true,
      action: () => this.setBulkStatus('IN_PROGRESS'),
      description: 'Mark selected as In Progress',
      context: 'tasks'
    });

    this.register({
      key: '3',
      ctrl: true,
      action: () => this.setBulkStatus('DONE'),
      description: 'Mark selected as Complete',
      context: 'tasks'
    });

    // Help shortcut
    this.register({
      key: '?',
      action: () => this.showHelp(),
      description: 'Show keyboard shortcuts help',
      context: 'global'
    });
  }

  register(shortcut: KeyboardShortcut) {
    this.shortcuts.push(shortcut);
  }

  unregister(key: string, ctrl?: boolean, alt?: boolean, shift?: boolean) {
    this.shortcuts = this.shortcuts.filter(s => 
      !(s.key === key && s.ctrl === ctrl && s.alt === alt && s.shift === shift)
    );
  }

  startListening() {
    if (this.isListening) return;

    this.isListening = true;
    document.addEventListener('keydown', this.handleKeyDown);
  }

  stopListening() {
    if (!this.isListening) return;

    this.isListening = false;
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in form fields
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable
    ) {
      // Allow Escape to blur form fields
      if (event.key === 'Escape') {
        target.blur();
        event.preventDefault();
        return;
      }
      return;
    }

    // Find matching shortcut
    const shortcut = this.shortcuts.find(s =>
      s.key.toLowerCase() === event.key.toLowerCase() &&
      !!s.ctrl === event.ctrlKey &&
      !!s.alt === event.altKey &&
      !!s.shift === event.shiftKey
    );

    if (shortcut) {
      event.preventDefault();
      event.stopPropagation();
      
      try {
        shortcut.action();
      } catch (error) {
        console.error('Error executing keyboard shortcut:', error);
      }
    }
  };

  // Action implementations
  private focusSearch() {
    const searchInput = document.querySelector('input[type="text"][placeholder*="Search"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  }

  private selectAllTasks() {
    // This would need to be implemented in the component that uses this service
    // We'll trigger a custom event that the component can listen to
    document.dispatchEvent(new CustomEvent('keyboard-select-all'));
  }

  private clearSelection() {
    selectionHelpers.clear();
  }

  private deleteSelectedTasks() {
    const selectedIds = get(selectedTaskIds);
    if (selectedIds.size > 0) {
      document.dispatchEvent(new CustomEvent('keyboard-bulk-delete'));
    }
  }

  private setBulkStatus(status: 'TODO' | 'IN_PROGRESS' | 'DONE') {
    const selectedIds = get(selectedTaskIds);
    if (selectedIds.size > 0) {
      document.dispatchEvent(new CustomEvent('keyboard-bulk-status', { 
        detail: { status } 
      }));
    }
  }

  private showHelp() {
    document.dispatchEvent(new CustomEvent('keyboard-show-help'));
  }

  // Get shortcuts for display in help
  getShortcuts(context?: string): KeyboardShortcut[] {
    return this.shortcuts.filter(s => !context || s.context === context || s.context === 'global');
  }

  // Format shortcut for display
  formatShortcut(shortcut: KeyboardShortcut): string {
    const parts = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.alt) parts.push('Alt');
    if (shortcut.shift) parts.push('Shift');
    parts.push(shortcut.key === ' ' ? 'Space' : shortcut.key);
    return parts.join(' + ');
  }
}

// Create singleton instance
export const keyboardService = new KeyboardShortcutService();

// Auto-start listening when imported
if (typeof window !== 'undefined') {
  keyboardService.startListening();
}