<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import { getTasks } from '$lib/api/tasks';
  import ProtectedRoute from '$lib/components/ProtectedRoute.svelte';
  import type { Task } from '$lib/types';

  let tasks: Task[] = [];
  let isLoading = true;
  let error = '';

  onMount(async () => {
    await loadTasks();
  });

  async function loadTasks() {
    try {
      isLoading = true;
      tasks = await getTasks();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load tasks';
    } finally {
      isLoading = false;
    }
  }

  function handleLogout() {
    auth.clearUser();
    goto('/');
  }

  $: completedTasks = tasks.filter(task => task.completed).length;
  $: pendingTasks = tasks.length - completedTasks;
</script>

<svelte:head>
  <title>Dashboard - Task Manager</title>
</svelte:head>

<ProtectedRoute>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">Welcome, {$auth.user?.firstName || 'User'}!</span>
            <button
              on:click={handleLogout}
              class="text-sm text-red-600 hover:text-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-3 gap-6 mb-8">
        <div class="card">
          <div class="text-center">
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span class="text-blue-600 font-bold text-lg">{tasks.length}</span>
            </div>
            <p class="text-sm font-medium text-gray-600">Tasks</p>
          </div>
        </div>

        <div class="card">
          <div class="text-center">
            <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span class="text-yellow-600 font-bold text-lg">{pendingTasks}</span>
            </div>
            <p class="text-sm font-medium text-gray-600">Pending</p>
          </div>
        </div>

        <div class="card">
          <div class="text-center">
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span class="text-green-600 font-bold text-lg">{completedTasks}</span>
            </div>
            <p class="text-sm font-medium text-gray-600">Completed</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div class="flex flex-wrap gap-3">
          <a href="/tasks/new" class="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">Create New Task</a>
          <a href="/tasks" class="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors">View All Tasks</a>
          <button on:click={loadTasks} class="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50" disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <!-- Recent Tasks -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Recent Tasks</h2>
        
        {#if isLoading}
          <div class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
          </div>
        {:else if error}
          <div class="text-red-600 text-center py-8">
            <p>{error}</p>
            <button on:click={loadTasks} class="btn-secondary mt-4">Try Again</button>
          </div>
        {:else if tasks.length === 0}
          <div class="text-center py-8 text-gray-500">
            <p>No tasks yet. Create your first task to get started!</p>
            <a href="/tasks/new" class="btn-primary mt-4 inline-block">Create Task</a>
          </div>
        {:else}
          <div class="space-y-3">
            {#each tasks.slice(0, 5) as task}
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex-1">
                  <h3 class="font-medium text-gray-900">{task.title}</h3>
                  <p class="text-sm text-gray-600">{task.description || 'No description'}</p>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="px-2 py-1 text-xs rounded-full {task.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                    {task.status}
                  </span>
                </div>
              </div>
            {/each}
            
            {#if tasks.length > 5}
              <div class="text-center pt-4">
                <a href="/tasks" class="text-primary-600 hover:text-primary-500 text-sm font-medium">
                  View all {tasks.length} tasks →
                </a>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </main>
  </div>
</ProtectedRoute>