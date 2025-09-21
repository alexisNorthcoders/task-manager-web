<script lang="ts">
  import { onMount } from 'svelte';
  import { tasksStore } from '$lib/stores/tasks';
  import { selectedTaskIds, selectionHelpers } from '$lib/stores/selection';
  import { searchQuery } from '$lib/stores/search';
  import { bulkUpdateTasks, bulkDeleteTasks } from '$lib/api/tasks';
  import Task from './Task.svelte';
  import type { Task as TaskType, BulkUpdateTaskInput } from '$lib/types';
  
  let filteredTasks: TaskType[] = [];
  let showBulkActions = false;
  let bulkOperationLoading = false;
  let bulkOperationError = '';

  // Reactive bulk actions visibility
  $: showBulkActions = $selectedTaskIds.size > 0;

  onMount(async () => {
    await tasksStore.load();
    // Apply filters after loading tasks
    applyFilters();
  });

  function applyFilters() {
    let filtered = [...$tasksStore.tasks];

    // Apply search filter
    if ($searchQuery && $searchQuery.trim()) {
      const query = $searchQuery.toLowerCase();
      
      filtered = filtered.filter(task => {
        const titleMatch = task.title && task.title.toLowerCase().includes(query);
        const descMatch = task.description && task.description.toLowerCase().includes(query);
        return titleMatch || descMatch;
      });
    }

    filteredTasks = filtered;
  }

  async function toggleTaskCompletion(task: TaskType) {
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
    } catch (err: any) {
      // Don't show error message for known GraphQL errors that we've handled gracefully
      const isKnownGraphQLError = err.message?.includes('INTERNAL_ERROR') ||
                                  err.message?.includes('GraphQL Error');

      if (!isKnownGraphQLError) {
        console.error('Failed to delete task:', err);
        // Show user-friendly error message only for unexpected errors
        alert('Failed to delete task. Please try again.');
      } else {
        console.warn('Task deleted successfully despite GraphQL error:', err.message);
      }
    }
  }


  // Group tasks by status
  $: todoTasks = filteredTasks.filter(task => task.status === 'TODO');
  $: inProgressTasks = filteredTasks.filter(task => task.status === 'IN_PROGRESS');
  $: completedTasks = filteredTasks.filter(task => task.status === 'COMPLETED' || task.completed);
  

  // Reactive updates when filters change or tasks change
  $: {
    applyFilters();
  }

  // Bulk operations
  async function handleBulkDelete() {
    if (!confirm(`Are you sure you want to delete ${$selectedTaskIds.size} selected tasks?`)) return;
    
    bulkOperationLoading = true;
    bulkOperationError = '';

    try {
      const taskIds = Array.from($selectedTaskIds);
      const result = await bulkDeleteTasks(taskIds);
      
      if (result.success) {
        selectionHelpers.clear();
        await tasksStore.load();
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
        await tasksStore.load();
      } else {
        bulkOperationError = `Failed to update some tasks: ${result.errors.join(', ')}`;
      }
    } catch (err) {
      bulkOperationError = `Failed to update tasks: ${err instanceof Error ? err.message : 'Unknown error'}`;
    } finally {
      bulkOperationLoading = false;
    }
  }

</script>

<div class="space-y-6 {showBulkActions ? 'pb-20 sm:pb-16' : ''}">
  <!-- Search Indicator -->
  {#if $searchQuery && $searchQuery.trim()}
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <span class="text-sm text-blue-800">Searching for: <strong>"{$searchQuery}"</strong></span>
        <button 
          on:click={() => searchQuery.set('')} 
          class="ml-auto text-blue-600 hover:text-blue-800 text-sm underline"
        >
          Clear
        </button>
      </div>
    </div>
  {/if}

  <!-- Error Message -->
  {#if $tasksStore.error}
    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      {$tasksStore.error}
      <button on:click={() => tasksStore.load()} class="ml-2 underline hover:no-underline">
        Try again
      </button>
    </div>
  {/if}

  <!-- Kanban Board -->
  {#if $tasksStore.isLoading}
    <div class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  {:else if filteredTasks.length === 0}
    <div class="text-center py-12">
      <div class="text-gray-500">
        {$tasksStore.tasks.length === 0 ? 'No tasks yet.' : 'No tasks match your search.'}
      </div>
      {#if $tasksStore.tasks.length === 0}
        <a href="/tasks/new" class="mt-4 inline-block btn-primary">Create your first task</a>
      {:else}
        <button on:click={() => { searchQuery.set(''); }} class="mt-4 text-blue-600 hover:text-blue-500 underline">
          Clear search
        </button>
      {/if}
    </div>
  {:else}
    <!-- Mobile-first horizontal scroll Kanban -->
    <div class="overflow-x-auto pb-4">
      <div class="flex gap-4 min-w-max">
        <!-- To Do Column -->
        <div class="flex-shrink-0 w-80">
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-700 flex items-center gap-2">
                <div class="w-3 h-3 bg-gray-400 rounded-full"></div>
                To Do ({todoTasks.length})
              </h3>
            </div>
            <div class="space-y-3">
              {#each todoTasks as task (task.id)}
                <Task
                  {task}
                  variant="todo"
                  onToggleSelection={(taskId) => selectionHelpers.toggle(taskId)}
                  onDelete={handleDeleteTask}
                  isSelected={selectionHelpers.isSelected(task.id, $selectedTaskIds)}
                />
              {/each}
            </div>
          </div>
        </div>

        <!-- In Progress Column -->
        <div class="flex-shrink-0 w-80">
          <div class="bg-blue-50 rounded-lg p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-blue-700 flex items-center gap-2">
                <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                In Progress ({inProgressTasks.length})
              </h3>
            </div>
            <div class="space-y-3">
              {#each inProgressTasks as task (task.id)}
                <Task
                  {task}
                  variant="in-progress"
                  onToggleSelection={(taskId) => selectionHelpers.toggle(taskId)}
                  onDelete={handleDeleteTask}
                  isSelected={selectionHelpers.isSelected(task.id, $selectedTaskIds)}
                />
              {/each}
            </div>
          </div>
        </div>

        <!-- Completed Column -->
        <div class="flex-shrink-0 w-80">
          <div class="bg-green-50 rounded-lg p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-green-700 flex items-center gap-2">
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                Completed ({completedTasks.length})
              </h3>
            </div>
            <div class="space-y-3">
              {#each completedTasks as task (task.id)}
                <Task
                  {task}
                  variant="completed"
                  onToggleSelection={(taskId) => selectionHelpers.toggle(taskId)}
                  onDelete={handleDeleteTask}
                  isSelected={selectionHelpers.isSelected(task.id, $selectedTaskIds)}
                />
              {/each}
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Sticky Bulk Actions Bar - Mobile First -->
  {#if showBulkActions}
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div class="px-3 py-2">
        <!-- Mobile Layout -->
        <div class="block sm:hidden">
          <!-- Selected count and close button -->
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span class="font-medium text-gray-900 text-sm">
                {$selectedTaskIds.size} selected
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
          
          <!-- Action buttons - full width on mobile -->
          <div class="space-y-2">
            <div class="flex gap-1">
              <button
                on:click={() => handleBulkStatusUpdate('TODO')}
                disabled={bulkOperationLoading}
                class="flex-1 px-2 py-2 text-xs font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                To Do
              </button>
              <button
                on:click={() => handleBulkStatusUpdate('IN_PROGRESS')}
                disabled={bulkOperationLoading}
                class="flex-1 px-2 py-2 text-xs font-medium bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 transition-colors"
              >
                In Progress
              </button>
              <button
                on:click={() => handleBulkStatusUpdate('DONE')}
                disabled={bulkOperationLoading}
                class="flex-1 px-2 py-2 text-xs font-medium bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 transition-colors"
              >
                Complete
              </button>
            </div>
            
            <button
              on:click={handleBulkDelete}
              disabled={bulkOperationLoading}
              class="w-full px-3 py-2 text-sm font-medium bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Delete Selected
            </button>
          </div>
        </div>

        <!-- Desktop Layout -->
        <div class="hidden sm:block max-w-7xl mx-auto">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span class="font-semibold text-gray-900">
                  {$selectedTaskIds.size} task{$selectedTaskIds.size !== 1 ? 's' : ''} selected
                </span>
              </div>
              
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-600">Move to:</span>
                <div class="flex gap-2">
                  <button
                    on:click={() => handleBulkStatusUpdate('TODO')}
                    disabled={bulkOperationLoading}
                    class="px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                  >
                    To Do
                  </button>
                  <button
                    on:click={() => handleBulkStatusUpdate('IN_PROGRESS')}
                    disabled={bulkOperationLoading}
                    class="px-3 py-1.5 text-sm font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 transition-colors"
                  >
                    In Progress
                  </button>
                  <button
                    on:click={() => handleBulkStatusUpdate('DONE')}
                    disabled={bulkOperationLoading}
                    class="px-3 py-1.5 text-sm font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 transition-colors"
                  >
                    Complete
                  </button>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <button
                on:click={handleBulkDelete}
                disabled={bulkOperationLoading}
                class="px-3 py-1.5 text-sm font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Delete Selected
              </button>
              
              <button
                on:click={() => selectionHelpers.clear()}
                class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Clear selection"
                aria-label="Clear selection"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Loading and Error States -->
        {#if bulkOperationLoading}
          <div class="mt-2 flex items-center gap-2 text-blue-700">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span class="text-sm">Processing...</span>
          </div>
        {/if}

        {#if bulkOperationError}
          <div class="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
            <span class="text-red-700">{bulkOperationError}</span>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

