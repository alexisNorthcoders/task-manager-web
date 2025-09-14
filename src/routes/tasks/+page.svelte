<script lang="ts">
  import { onMount } from 'svelte';
  import ProtectedRoute from '$lib/components/ProtectedRoute.svelte';
  import NotificationCenter from '$lib/components/NotificationCenter.svelte';
  import KeyboardShortcutsHelp from '$lib/components/KeyboardShortcutsHelp.svelte';
  import { tasksStore } from '$lib/stores/tasks';
  import { usersStore } from '$lib/stores/users';
  import { selectedTaskIds, selectionHelpers } from '$lib/stores/selection';
  import { bulkUpdateTasks, bulkDeleteTasks, bulkAssignUsers } from '$lib/api/tasks';
  import { keyboardService } from '$lib/services/keyboard';
  import type { Task, BulkUpdateTaskInput } from '$lib/types';

  let filteredTasks: Task[] = [];
  
  // Filter and search state
  let searchQuery = '';
  let statusFilter = 'all';
  let sortBy = 'created';
  let sortOrder = 'desc';

  // Bulk operations state
  let showBulkActions = false;
  let bulkOperationLoading = false;
  let bulkOperationError = '';

  // Keyboard shortcuts state
  let showKeyboardHelp = false;
  
  // Sort dropdown state
  let showSortDropdown = false;

  onMount(() => {
    // Load data asynchronously
    tasksStore.load();
    usersStore.load();

    // Set up keyboard shortcut event listeners
    document.addEventListener('keyboard-select-all', handleKeyboardSelectAll);
    document.addEventListener('keyboard-bulk-delete', handleKeyboardBulkDelete);
    document.addEventListener('keyboard-bulk-status', handleKeyboardBulkStatus);
    document.addEventListener('keyboard-show-help', handleKeyboardShowHelp);

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (showSortDropdown && !(event.target as Element).closest('[data-sort-dropdown]')) {
        showSortDropdown = false;
      }
    };
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('keyboard-select-all', handleKeyboardSelectAll);
      document.removeEventListener('keyboard-bulk-delete', handleKeyboardBulkDelete);
      document.removeEventListener('keyboard-bulk-status', handleKeyboardBulkStatus);
      document.removeEventListener('keyboard-show-help', handleKeyboardShowHelp);
      document.removeEventListener('click', handleClickOutside);
    };
  });

  // Reactive bulk actions visibility
  $: showBulkActions = $selectedTaskIds.size > 0;

  function applyFilters() {
    let filtered = [...$tasksStore.tasks];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'completed') {
        filtered = filtered.filter(task => task.completed);
      } else if (statusFilter === 'pending') {
        filtered = filtered.filter(task => !task.completed);
      } else {
        filtered = filtered.filter(task => task.status === statusFilter);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31');
          bValue = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31');
          break;
        case 'created':
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    filteredTasks = filtered;
  }

  async function toggleTaskCompletion(task: Task) {
    try {
      await tasksStore.toggleCompletion(task.id);
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await tasksStore.delete(taskId);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'TODO': return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  // Reactive updates when filters change or tasks change
  $: if ($tasksStore.tasks || searchQuery !== undefined || statusFilter !== undefined || sortBy !== undefined || sortOrder !== undefined) {
    applyFilters();
  }

  // Bulk operations functions
  async function handleBulkDelete() {
    if (!confirm(`Are you sure you want to delete ${$selectedTaskIds.size} selected tasks?`)) return;
    
    bulkOperationLoading = true;
    bulkOperationError = '';

    try {
      const taskIds = Array.from($selectedTaskIds);
      const result = await bulkDeleteTasks(taskIds);
      
      if (result.success) {
        selectionHelpers.clear();
        await tasksStore.load(); // Refresh tasks
      } else {
        bulkOperationError = `Failed to delete some tasks: ${result.errors.join(', ')}`;
      }
    } catch (err) {
      bulkOperationError = `Failed to delete tasks: ${err instanceof Error ? err.message : 'Unknown error'}`;
    } finally {
      bulkOperationLoading = false;
    }
  }

  async function handleBulkStatusUpdate(status: 'TODO' | 'IN_PROGRESS' | 'DONE') {
    bulkOperationLoading = true;
    bulkOperationError = '';

    try {
      const taskIds = Array.from($selectedTaskIds);
      const input: BulkUpdateTaskInput = { status, completed: status === 'DONE' };
      const result = await bulkUpdateTasks(taskIds, input);
      
      if (result.success) {
        selectionHelpers.clear();
        await tasksStore.load(); // Refresh tasks
      } else {
        bulkOperationError = `Failed to update some tasks: ${result.errors.join(', ')}`;
      }
    } catch (err) {
      bulkOperationError = `Failed to update tasks: ${err instanceof Error ? err.message : 'Unknown error'}`;
    } finally {
      bulkOperationLoading = false;
    }
  }

  async function handleBulkAssign(userIds: string[]) {
    bulkOperationLoading = true;
    bulkOperationError = '';

    try {
      const taskIds = Array.from($selectedTaskIds);
      const result = await bulkAssignUsers(taskIds, userIds);
      
      if (result.success) {
        selectionHelpers.clear();
        await tasksStore.load(); // Refresh tasks
      } else {
        bulkOperationError = `Failed to assign users to some tasks: ${result.errors.join(', ')}`;
      }
    } catch (err) {
      bulkOperationError = `Failed to assign users: ${err instanceof Error ? err.message : 'Unknown error'}`;
    } finally {
      bulkOperationLoading = false;
    }
  }

  function handleSelectAll() {
    const taskIds = filteredTasks.map(task => task.id);
    if (selectionHelpers.areAllSelected(taskIds, $selectedTaskIds)) {
      selectionHelpers.deselectAll(taskIds);
    } else {
      selectionHelpers.selectAll(taskIds);
    }
  }

  // Keyboard event handlers
  function handleKeyboardSelectAll() {
    handleSelectAll();
  }

  function handleKeyboardBulkDelete() {
    handleBulkDelete();
  }

  function handleKeyboardBulkStatus(event: Event) {
    const { status } = (event as CustomEvent).detail;
    handleBulkStatusUpdate(status);
  }

  function handleKeyboardShowHelp() {
    showKeyboardHelp = true;
  }
</script>

<svelte:head>
  <title>Tasks - Task Manager</title>
</svelte:head>

<ProtectedRoute>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Top Navigation Bar -->
        <div class="flex items-center justify-between py-3 border-b border-gray-100">
          <div class="flex items-center space-x-6">
            <a href="/dashboard" class="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              <span class="font-medium">Back</span>
            </a>
            <div class="h-6 w-px bg-gray-300"></div>
            <a href="/templates" class="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Templates
            </a>
          </div>
          
          <div class="flex items-center space-x-3">
            <NotificationCenter />
            <button
              on:click={() => showKeyboardHelp = true}
              class="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              title="Keyboard shortcuts (?)"
              aria-label="Show keyboard shortcuts help"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Page Title -->
        <div class="py-4">
          <h1 class="text-3xl font-bold text-gray-900">Tasks</h1>
          <p class="text-gray-600 mt-1">Manage and organize your tasks</p>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Search and Filters -->
      <div class="mb-6 space-y-4">
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- Search -->
          <div class="flex-1">
            <input
              type="text"
              placeholder="Search tasks..."
              bind:value={searchQuery}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <!-- Status Filter -->
          <select
            bind:value={statusFilter}
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Tasks</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
          </select>

          <!-- Sort -->
          <div class="flex gap-2">
            <div class="relative" data-sort-dropdown>
              <button
                on:click={() => showSortDropdown = !showSortDropdown}
                class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 min-w-[120px]"
              >
                <span class="text-sm">
                  {sortBy === 'created' ? 'Created' : 
                   sortBy === 'title' ? 'Title' : 
                   sortBy === 'status' ? 'Status' : 
                   sortBy === 'dueDate' ? 'Due Date' : 'Created'}
                </span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              
              {#if showSortDropdown}
                <div class="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  <button
                    on:click={() => { sortBy = 'created'; showSortDropdown = false; }}
                    class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg {sortBy === 'created' ? 'bg-blue-50 text-blue-700' : ''}"
                  >
                    Created
                  </button>
                  <button
                    on:click={() => { sortBy = 'title'; showSortDropdown = false; }}
                    class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 {sortBy === 'title' ? 'bg-blue-50 text-blue-700' : ''}"
                  >
                    Title
                  </button>
                  <button
                    on:click={() => { sortBy = 'status'; showSortDropdown = false; }}
                    class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 {sortBy === 'status' ? 'bg-blue-50 text-blue-700' : ''}"
                  >
                    Status
                  </button>
                  <button
                    on:click={() => { sortBy = 'dueDate'; showSortDropdown = false; }}
                    class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 last:rounded-b-lg {sortBy === 'dueDate' ? 'bg-blue-50 text-blue-700' : ''}"
                  >
                    Due Date
                  </button>
                </div>
              {/if}
            </div>
            
            <button
              on:click={() => sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'}
              class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0 h-[38px] flex items-center justify-center"
              title="Sort order"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      <!-- Task Count and Selection Info -->
      <div class="mb-4 flex items-center justify-between">
        <div class="text-sm text-gray-600">
          Showing {filteredTasks.length} of {$tasksStore.tasks.length} tasks
          {#if $selectedTaskIds.size > 0}
            <span class="ml-2 text-blue-600 font-medium">
              ({$selectedTaskIds.size} selected)
            </span>
          {/if}
        </div>

        {#if filteredTasks.length > 0}
          <div class="flex items-center gap-2">
            <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={selectionHelpers.areAllSelected(filteredTasks.map(t => t.id), $selectedTaskIds)}
                indeterminate={selectionHelpers.areSomeSelected(filteredTasks.map(t => t.id), $selectedTaskIds)}
                on:change={handleSelectAll}
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Select all
            </label>
          </div>
        {/if}
      </div>

      <!-- Bulk Actions Toolbar -->
      {#if showBulkActions}
        <div class="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <!-- Header with selection count and close button -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span class="font-semibold text-blue-900">
                {$selectedTaskIds.size} task{$selectedTaskIds.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <button
              on:click={() => selectionHelpers.clear()}
              class="p-1 text-gray-500 hover:text-gray-700 rounded"
              title="Clear selection"
              aria-label="Clear selection"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Mobile-first action buttons -->
          <div class="space-y-3">
            <!-- Mark as section -->
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-2">Mark as:</h3>
              <div class="flex flex-wrap gap-2">
                <button
                  on:click={() => handleBulkStatusUpdate('TODO')}
                  disabled={bulkOperationLoading}
                  class="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  To Do
                </button>
                <button
                  on:click={() => handleBulkStatusUpdate('IN_PROGRESS')}
                  disabled={bulkOperationLoading}
                  class="px-4 py-2 text-sm font-medium bg-white text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  In Progress
                </button>
                <button
                  on:click={() => handleBulkStatusUpdate('DONE')}
                  disabled={bulkOperationLoading}
                  class="px-4 py-2 text-sm font-medium bg-white text-green-700 border border-green-300 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Complete
                </button>
              </div>
            </div>

            <!-- Delete action -->
            <div class="pt-2 border-t border-blue-200">
              <button
                on:click={handleBulkDelete}
                disabled={bulkOperationLoading}
                class="px-4 py-2 text-sm font-medium bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Delete Selected
              </button>
            </div>
          </div>

          {#if bulkOperationLoading}
            <div class="mt-4 flex items-center gap-2 text-blue-700">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span class="text-sm">Processing...</span>
            </div>
          {/if}

          {#if bulkOperationError}
            <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span class="text-red-700 text-sm">{bulkOperationError}</span>
              </div>
            </div>
          {/if}
        </div>
      {/if}

      <!-- Error Message -->
      {#if $tasksStore.error}
        <div class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {$tasksStore.error}
          <button on:click={() => tasksStore.load()} class="ml-2 underline hover:no-underline">
            Try again
          </button>
        </div>
      {/if}

      <!-- Task List -->
      {#if $tasksStore.isLoading}
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      {:else if filteredTasks.length === 0}
        <div class="text-center py-12">
          <div class="text-gray-500">
            {$tasksStore.tasks.length === 0 ? 'No tasks yet.' : 'No tasks match your filters.'}
          </div>
          {#if $tasksStore.tasks.length === 0}
            <a href="/tasks/new" class="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Create your first task
            </a>
          {:else}
            <button on:click={() => { searchQuery = ''; statusFilter = 'all'; }} class="mt-4 text-blue-600 hover:text-blue-500 underline">
              Clear filters
            </button>
          {/if}
        </div>
      {:else}
        <div class="space-y-4">
          {#each filteredTasks as task (task.id)}
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div class="flex items-start justify-between">
                <!-- Task Selection and Content -->
                <div class="flex items-start space-x-3 flex-1 min-w-0">
                  <!-- Multi-select Checkbox -->
                  <input
                    type="checkbox"
                    checked={selectionHelpers.isSelected(task.id, $selectedTaskIds)}
                    on:change={() => selectionHelpers.toggle(task.id)}
                    class="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />

                  <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-3">
                      <!-- Task Title -->
                      <h3 class="text-lg font-medium text-gray-900 {task.completed ? 'line-through text-gray-500' : ''}">
                        {task.title}
                      </h3>

                      <!-- Status Badge -->
                      <span class="px-2 py-1 text-xs font-medium rounded-full {getStatusColor(task.status)}">
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>

                    <!-- Task Description -->
                    {#if task.description}
                      <p class="mt-2 text-gray-600 {task.completed ? 'line-through' : ''}">{task.description}</p>
                    {/if}

                    <!-- Task Metadata -->
                    <div class="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span>Created {formatDate(task.createdAt)}</span>
                      {#if task.dueDate}
                        <span class="flex items-center gap-1">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                          </svg>
                          Due {formatDate(task.dueDate)}
                        </span>
                      {/if}
                      {#if task.estimationHours}
                        <span class="flex items-center gap-1">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          {task.estimationHours}h
                        </span>
                      {/if}
                    </div>

                    <!-- Assigned Users -->
                    {#if task.assignedUsers && task.assignedUsers.length > 0}
                      <div class="mt-3">
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class="text-xs text-gray-500 flex items-center gap-1">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 013 0z"/>
                            </svg>
                            Assigned to:
                          </span>
                          {#each task.assignedUsers as user, index (user.id)}
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {user.firstName} {user.lastName}
                            </span>
                          {/each}
                        </div>
                      </div>
                    {/if}
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center space-x-2">
                  <a href="/tasks/{task.id}/edit" class="text-blue-600 hover:text-blue-500 p-1" aria-label="Edit task">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </a>
                  <button on:click={() => handleDeleteTask(task.id)} class="text-red-600 hover:text-red-500 p-1" aria-label="Delete task">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </main>
  </div>

  <!-- Floating Action Button -->
  <a 
    href="/tasks/new" 
    class="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200 z-50 group"
    title="Create new task"
    aria-label="Create new task"
  >
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
    </svg>
    <!-- Tooltip -->
    <div class="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
      New Task
    </div>
  </a>

  <!-- Keyboard Shortcuts Help Modal -->
  <KeyboardShortcutsHelp bind:show={showKeyboardHelp} />
</ProtectedRoute>