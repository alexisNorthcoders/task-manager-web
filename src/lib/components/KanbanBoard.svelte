<script lang="ts">
  import { onMount } from 'svelte';
  import { tasksStore } from '$lib/stores/tasks';
  import { selectedTaskIds, selectionHelpers } from '$lib/stores/selection';
  import { bulkUpdateTasks, bulkDeleteTasks } from '$lib/api/tasks';
  import type { Task, BulkUpdateTaskInput } from '$lib/types';

  let filteredTasks: Task[] = [];
  let searchQuery = '';
  let showBulkActions = false;
  let bulkOperationLoading = false;
  let bulkOperationError = '';

  // Reactive bulk actions visibility
  $: showBulkActions = $selectedTaskIds.size > 0;

  onMount(() => {
    tasksStore.load();
  });

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
      month: 'short',
      day: 'numeric'
    });
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'TODO': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'TODO':
        return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>`;
      case 'IN_PROGRESS':
        return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>`;
      case 'COMPLETED':
        return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>`;
      default:
        return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>`;
    }
  }

  // Group tasks by status
  $: todoTasks = filteredTasks.filter(task => task.status === 'TODO');
  $: inProgressTasks = filteredTasks.filter(task => task.status === 'IN_PROGRESS');
  $: completedTasks = filteredTasks.filter(task => task.status === 'COMPLETED' || task.completed);

  // Reactive updates when filters change or tasks change
  $: if ($tasksStore.tasks || searchQuery !== undefined) {
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

  function handleSelectAll() {
    const taskIds = filteredTasks.map(task => task.id);
    if (selectionHelpers.areAllSelected(taskIds, $selectedTaskIds)) {
      selectionHelpers.deselectAll(taskIds);
    } else {
      selectionHelpers.selectAll(taskIds);
    }
  }
</script>

<div class="space-y-6">
  <!-- Search and Selection -->
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <input
          type="text"
          placeholder="Search tasks..."
          bind:value={searchQuery}
          class="input"
        />
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
  </div>

  <!-- Bulk Actions -->
  {#if showBulkActions}
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
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

      <div class="space-y-3">
        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-2">Move to:</h3>
          <div class="flex flex-wrap gap-2">
            <button
              on:click={() => handleBulkStatusUpdate('TODO')}
              disabled={bulkOperationLoading}
              class="px-3 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              To Do
            </button>
            <button
              on:click={() => handleBulkStatusUpdate('IN_PROGRESS')}
              disabled={bulkOperationLoading}
              class="px-3 py-2 text-sm font-medium bg-white text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 disabled:opacity-50"
            >
              In Progress
            </button>
            <button
              on:click={() => handleBulkStatusUpdate('DONE')}
              disabled={bulkOperationLoading}
              class="px-3 py-2 text-sm font-medium bg-white text-green-700 border border-green-300 rounded-lg hover:bg-green-50 disabled:opacity-50"
            >
              Complete
            </button>
          </div>
        </div>

        <div class="pt-2 border-t border-blue-200">
          <button
            on:click={handleBulkDelete}
            disabled={bulkOperationLoading}
            class="px-3 py-2 text-sm font-medium bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 flex items-center gap-2"
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
          <span class="text-red-700 text-sm">{bulkOperationError}</span>
        </div>
      {/if}
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
        <button on:click={() => { searchQuery = ''; }} class="mt-4 text-blue-600 hover:text-blue-500 underline">
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
                <div class="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-shadow">
                  <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-2 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={selectionHelpers.isSelected(task.id, $selectedTaskIds)}
                        on:change={() => selectionHelpers.toggle(task.id)}
                        class="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div class="flex-1 min-w-0">
                        <h4 class="font-medium text-gray-900 text-sm leading-tight">{task.title}</h4>
                        {#if task.description}
                          <p class="text-xs text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                        {/if}
                        <div class="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <span>{formatDate(task.createdAt)}</span>
                          {#if task.dueDate}
                            <span class="flex items-center gap-1">
                              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                              </svg>
                              {formatDate(task.dueDate)}
                            </span>
                          {/if}
                        </div>

                        <!-- Assigned Users -->
                        {#if task.assignedUsers && task.assignedUsers.length > 0}
                          <div class="mt-2">
                            <div class="flex items-center gap-1 flex-wrap">
                              {#each task.assignedUsers.slice(0, 3) as user, index (user.id)}
                                <div class="flex items-center gap-1">
                                  <div class="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span class="text-blue-600 text-xs font-medium">
                                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                    </span>
                                  </div>
                                  {#if index === 0}
                                    <span class="text-xs text-gray-500">{user.firstName}</span>
                                  {/if}
                                </div>
                              {/each}
                              {#if task.assignedUsers.length > 3}
                                <div class="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                                  <span class="text-gray-500 text-xs font-medium">+{task.assignedUsers.length - 3}</span>
                                </div>
                              {/if}
                            </div>
                          </div>
                        {/if}
                      </div>
                    </div>
                    <div class="flex items-center space-x-1 ml-2">
                      <a href="/tasks/{task.id}/edit" class="text-gray-400 hover:text-gray-600 p-1" aria-label="Edit task">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </a>
                      <button on:click={() => handleDeleteTask(task.id)} class="text-gray-400 hover:text-red-600 p-1" aria-label="Delete task">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
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
                <div class="bg-white rounded-lg border border-blue-200 p-3 hover:shadow-sm transition-shadow">
                  <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-2 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={selectionHelpers.isSelected(task.id, $selectedTaskIds)}
                        on:change={() => selectionHelpers.toggle(task.id)}
                        class="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div class="flex-1 min-w-0">
                        <h4 class="font-medium text-gray-900 text-sm leading-tight">{task.title}</h4>
                        {#if task.description}
                          <p class="text-xs text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                        {/if}
                        <div class="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <span>{formatDate(task.createdAt)}</span>
                          {#if task.dueDate}
                            <span class="flex items-center gap-1">
                              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                              </svg>
                              {formatDate(task.dueDate)}
                            </span>
                          {/if}
                        </div>

                        <!-- Assigned Users -->
                        {#if task.assignedUsers && task.assignedUsers.length > 0}
                          <div class="mt-2">
                            <div class="flex items-center gap-1 flex-wrap">
                              {#each task.assignedUsers.slice(0, 3) as user, index (user.id)}
                                <div class="flex items-center gap-1">
                                  <div class="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span class="text-blue-600 text-xs font-medium">
                                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                    </span>
                                  </div>
                                  {#if index === 0}
                                    <span class="text-xs text-gray-500">{user.firstName}</span>
                                  {/if}
                                </div>
                              {/each}
                              {#if task.assignedUsers.length > 3}
                                <div class="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                                  <span class="text-gray-500 text-xs font-medium">+{task.assignedUsers.length - 3}</span>
                                </div>
                              {/if}
                            </div>
                          </div>
                        {/if}
                      </div>
                    </div>
                    <div class="flex items-center space-x-1 ml-2">
                      <a href="/tasks/{task.id}/edit" class="text-gray-400 hover:text-gray-600 p-1" aria-label="Edit task">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </a>
                      <button on:click={() => handleDeleteTask(task.id)} class="text-gray-400 hover:text-red-600 p-1" aria-label="Delete task">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
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
                <div class="bg-white rounded-lg border border-green-200 p-3 hover:shadow-sm transition-shadow opacity-75">
                  <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-2 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={selectionHelpers.isSelected(task.id, $selectedTaskIds)}
                        on:change={() => selectionHelpers.toggle(task.id)}
                        class="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div class="flex-1 min-w-0">
                        <h4 class="font-medium text-gray-500 text-sm leading-tight line-through">{task.title}</h4>
                        {#if task.description}
                          <p class="text-xs text-gray-400 mt-1 line-clamp-2 line-through">{task.description}</p>
                        {/if}
                        <div class="flex items-center gap-2 mt-2 text-xs text-gray-400">
                          <span>{formatDate(task.createdAt)}</span>
                          {#if task.dueDate}
                            <span class="flex items-center gap-1">
                              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                              </svg>
                              {formatDate(task.dueDate)}
                            </span>
                          {/if}
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center space-x-1 ml-2">
                      <a href="/tasks/{task.id}/edit" class="text-gray-400 hover:text-gray-600 p-1" aria-label="Edit task">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </a>
                      <button on:click={() => handleDeleteTask(task.id)} class="text-gray-400 hover:text-red-600 p-1" aria-label="Delete task">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
