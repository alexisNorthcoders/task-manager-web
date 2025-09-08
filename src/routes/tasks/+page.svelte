<script lang="ts">
  import { onMount } from 'svelte';
  import ProtectedRoute from '$lib/components/ProtectedRoute.svelte';
  import { tasksStore } from '$lib/stores/tasks';
  import type { Task } from '$lib/types';

  let filteredTasks: Task[] = [];
  
  // Filter and search state
  let searchQuery = '';
  let statusFilter = 'all';
  let sortBy = 'created';
  let sortOrder = 'desc';

  onMount(async () => {
    await tasksStore.load();
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
</script>

<svelte:head>
  <title>Tasks - Task Manager</title>
</svelte:head>

<ProtectedRoute>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <h1 class="text-2xl font-bold text-gray-900">Tasks</h1>
          <div class="flex items-center space-x-4">
            <a href="/tasks/new" class="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              New Task
            </a>
            <a href="/dashboard" class="text-gray-600 hover:text-gray-500">
              ← Dashboard
            </a>
          </div>
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
            <select
              bind:value={sortBy}
              class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="created">Created Date</option>
              <option value="title">Title</option>
              <option value="status">Status</option>
              <option value="dueDate">Due Date</option>
            </select>
            
            <button
              on:click={() => sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'}
              class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Sort order"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      <!-- Task Count -->
      <div class="mb-4 text-sm text-gray-600">
        Showing {filteredTasks.length} of {$tasksStore.tasks.length} tasks
      </div>

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
                <!-- Task Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-3">
                    <!-- Completion Checkbox -->
                    <button
                      on:click={() => toggleTaskCompletion(task)}
                      class="flex-shrink-0 w-5 h-5 rounded border-2 border-gray-300 flex items-center justify-center hover:border-blue-500 transition-colors {task.completed ? 'bg-green-500 border-green-500' : ''}"
                    >
                      {#if task.completed}
                        <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                        </svg>
                      {/if}
                    </button>

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

                <!-- Actions -->
                <div class="flex items-center space-x-2">
                  <a href="/tasks/{task.id}/edit" class="text-blue-600 hover:text-blue-500 p-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </a>
                  <button on:click={() => handleDeleteTask(task.id)} class="text-red-600 hover:text-red-500 p-1">
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
</ProtectedRoute>