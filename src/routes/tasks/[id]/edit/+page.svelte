<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { getTask, updateTask } from '$lib/api/tasks';
  import { assignUsersToTask, unassignUsersFromTask } from '$lib/api/users';
  import { usersStore } from '$lib/stores/users';
  import ProtectedRoute from '$lib/components/ProtectedRoute.svelte';
  import type { Task, UpdateTaskInput, User } from '$lib/types';

  let task: Task | null = null;
  let formData: UpdateTaskInput = {
    title: '',
    description: '',
    dueDate: '',
    estimationHours: undefined,
    status: 'TODO',
    completed: false
  };
  
  let isLoading = true;
  let isSaving = false;
  let error = '';
  let validationErrors: Record<string, string> = {};
  
  // User assignment state
  let selectedUserIds: string[] = [];
  let isAssigningUsers = false;

  $: taskId = $page.params.id;

  onMount(async () => {
    if (taskId) {
      await Promise.all([
        loadTask(taskId),
        usersStore.load()
      ]);
    }
  });

  async function loadTask(id: string) {
    try {
      isLoading = true;
      error = '';
      task = await getTask(id);
      
      // Populate form with task data
      formData = {
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate || '',
        estimationHours: task.estimationHours || undefined,
        status: task.status,
        completed: task.completed
      };
      
      // Initialize selected users
      selectedUserIds = task.assignedUsers.map(user => user.id);
    } catch (err) {
      console.error('Failed to load task:', err);
      error = err instanceof Error ? err.message : 'Failed to load task';
    } finally {
      isLoading = false;
    }
  }

  // Real-time validation
  $: {
    validationErrors = {};
    
    if (formData.title && formData.title.trim().length < 3) {
      validationErrors.title = 'Title must be at least 3 characters';
    }
    
    if (formData.title && formData.title.length > 100) {
      validationErrors.title = 'Title must be less than 100 characters';
    }
    
    if (formData.description && formData.description.length > 500) {
      validationErrors.description = 'Description must be less than 500 characters';
    }
    
    if (formData.estimationHours && (formData.estimationHours < 0.5 || formData.estimationHours > 1000)) {
      validationErrors.estimationHours = 'Estimation must be between 0.5 and 1000 hours';
    }
    
    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Only warn about past dates for new due dates, not existing ones
      if (task && task.dueDate !== formData.dueDate && dueDate < today) {
        validationErrors.dueDate = 'Due date cannot be in the past';
      }
    }
  }

  $: isFormValid = formData.title && formData.title.trim().length >= 3 && 
                   formData.title.length <= 100 &&
                   (!formData.description || formData.description.length <= 500) &&
                   (!formData.estimationHours || (formData.estimationHours >= 0.5 && formData.estimationHours <= 1000)) &&
                   Object.keys(validationErrors).length === 0;

  async function handleSubmit() {
    if (!isFormValid || !taskId) return;

    isSaving = true;
    error = '';

    try {
      // Clean up the data
      const updateData: UpdateTaskInput = {
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        dueDate: formData.dueDate || undefined,
        estimationHours: formData.estimationHours || undefined,
        status: formData.status,
        completed: formData.completed
      };

      await updateTask(taskId, updateData);
      goto('/tasks');
    } catch (err) {
      console.error('Failed to update task:', err);
      error = err instanceof Error ? err.message : 'Failed to update task';
    } finally {
      isSaving = false;
    }
  }

  function handleCancel() {
    goto('/tasks');
  }

  async function handleUserAssignment() {
    if (!task || !taskId) return;

    isAssigningUsers = true;
    error = '';

    try {
      // Get current and new user IDs
      const currentUserIds = task.assignedUsers.map(user => user.id);
      const usersToAdd = selectedUserIds.filter(id => !currentUserIds.includes(id));
      const usersToRemove = currentUserIds.filter(id => !selectedUserIds.includes(id));

      // Apply changes
      if (usersToAdd.length > 0) {
        task = await assignUsersToTask(taskId, usersToAdd);
      }
      if (usersToRemove.length > 0) {
        task = await unassignUsersFromTask(taskId, usersToRemove);
      }
    } catch (err) {
      console.error('Failed to update user assignments:', err);
      error = err instanceof Error ? err.message : 'Failed to update user assignments';
    } finally {
      isAssigningUsers = false;
    }
  }

  function toggleUserSelection(userId: string) {
    if (selectedUserIds.includes(userId)) {
      selectedUserIds = selectedUserIds.filter(id => id !== userId);
    } else {
      selectedUserIds = [...selectedUserIds, userId];
    }
  }

  // Sync status and completed fields
  $: if (formData.completed && formData.status !== 'COMPLETED') {
    formData.status = 'COMPLETED';
  } else if (!formData.completed && formData.status === 'COMPLETED') {
    formData.status = 'TODO';
  }
</script>

<svelte:head>
  <title>Edit Task - Task Manager</title>
</svelte:head>

<ProtectedRoute>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <h1 class="text-2xl font-bold text-gray-900">Edit Task</h1>
          <a href="/tasks" class="text-gray-600 hover:text-gray-500">
            ← Back to Tasks
          </a>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {#if isLoading}
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      {:else if error && !task}
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button on:click={() => loadTask(taskId)} class="ml-2 underline hover:no-underline">
            Try again
          </button>
        </div>
      {:else if task}
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form on:submit|preventDefault={handleSubmit} class="space-y-6">
            <!-- Title -->
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                id="title"
                type="text"
                required
                bind:value={formData.title}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent {validationErrors.title ? 'border-red-500 focus:ring-red-500' : ''}"
                placeholder="Enter task title"
                disabled={isSaving}
              />
              {#if validationErrors.title}
                <p class="mt-1 text-sm text-red-600">{validationErrors.title}</p>
              {/if}
            </div>

            <!-- Description -->
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                bind:value={formData.description}
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent {validationErrors.description ? 'border-red-500 focus:ring-red-500' : ''}"
                placeholder="Enter task description (optional)"
                disabled={isSaving}
              ></textarea>
              {#if validationErrors.description}
                <p class="mt-1 text-sm text-red-600">{validationErrors.description}</p>
              {/if}
              <p class="mt-1 text-sm text-gray-500">
                {formData.description?.length || 0}/500 characters
              </p>
            </div>

            <!-- Status and Completion -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Status -->
              <div>
                <label for="status" class="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  bind:value={formData.status}
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSaving}
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <!-- Completed Checkbox -->
              <div class="flex items-center pt-6">
                <input
                  id="completed"
                  type="checkbox"
                  bind:checked={formData.completed}
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  disabled={isSaving}
                />
                <label for="completed" class="ml-2 text-sm font-medium text-gray-700">
                  Mark as completed
                </label>
              </div>
            </div>

            <!-- Due Date and Estimation -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Due Date -->
              <div>
                <label for="dueDate" class="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  id="dueDate"
                  type="date"
                  bind:value={formData.dueDate}
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent {validationErrors.dueDate ? 'border-red-500 focus:ring-red-500' : ''}"
                  disabled={isSaving}
                />
                {#if validationErrors.dueDate}
                  <p class="mt-1 text-sm text-red-600">{validationErrors.dueDate}</p>
                {/if}
              </div>

              <!-- Estimation Hours -->
              <div>
                <label for="estimationHours" class="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Hours
                </label>
                <input
                  id="estimationHours"
                  type="number"
                  min="0.5"
                  max="1000"
                  step="0.5"
                  bind:value={formData.estimationHours}
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent {validationErrors.estimationHours ? 'border-red-500 focus:ring-red-500' : ''}"
                  placeholder="e.g., 2.5"
                  disabled={isSaving}
                />
                {#if validationErrors.estimationHours}
                  <p class="mt-1 text-sm text-red-600">{validationErrors.estimationHours}</p>
                {/if}
              </div>
            </div>

            <!-- User Assignment -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <label class="block text-sm font-medium text-gray-700">
                  Assigned Users
                </label>
                <button
                  type="button"
                  on:click={handleUserAssignment}
                  disabled={isAssigningUsers || isSaving}
                  class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isAssigningUsers ? 'Updating...' : 'Update Assignments'}
                </button>
              </div>

              <!-- Current assigned users -->
              {#if task && task.assignedUsers.length > 0}
                <div class="mb-3">
                  <p class="text-xs text-gray-500 mb-2">Currently assigned:</p>
                  <div class="flex flex-wrap gap-2">
                    {#each task.assignedUsers as user (user.id)}
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {user.firstName} {user.lastName} (@{user.username})
                      </span>
                    {/each}
                  </div>
                </div>
              {/if}

              <!-- User selection -->
              {#if $usersStore.isLoading}
                <div class="text-center py-4 text-gray-500">Loading users...</div>
              {:else if $usersStore.error}
                <div class="text-red-600 text-sm">{$usersStore.error}</div>
              {:else if $usersStore.users.length === 0}
                <div class="text-gray-500 text-sm">No users available</div>
              {:else}
                <div class="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {#each $usersStore.users as user (user.id)}
                    <label class="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user.id)}
                        on:change={() => toggleUserSelection(user.id)}
                        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        disabled={isAssigningUsers || isSaving}
                      />
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p class="text-xs text-gray-500">
                          @{user.username} • {user.email} • {user.role}
                        </p>
                      </div>
                    </label>
                  {/each}
                </div>
              {/if}
            </div>

            <!-- Error Message -->
            {#if error}
              <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            {/if}

            <!-- Actions -->
            <div class="flex items-center justify-end space-x-4 pt-6">
              <button
                type="button"
                on:click={handleCancel}
                class="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !isFormValid}
                class="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      {/if}
    </main>
  </div>
</ProtectedRoute>