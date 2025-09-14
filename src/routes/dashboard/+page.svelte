<script lang="ts">
  import { onMount } from 'svelte';
  import { getTasks } from '$lib/api/tasks';
  import ProtectedRoute from '$lib/components/ProtectedRoute.svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import PageContainer from '$lib/components/PageContainer.svelte';
  import KanbanBoard from '$lib/components/KanbanBoard.svelte';
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

  $: completedTasks = tasks.filter(task => task.completed).length;
  $: pendingTasks = tasks.length - completedTasks;
</script>

<svelte:head>
  <title>Dashboard - Task Manager</title>
</svelte:head>

<ProtectedRoute>
  <PageHeader title="Dashboard" subtitle="Manage your tasks and track your progress" />
  
  <PageContainer>
      <!-- Kanban Board -->
      <div class="mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Task Management</h2>
        <KanbanBoard />
      </div>
  </PageContainer>

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
</ProtectedRoute>