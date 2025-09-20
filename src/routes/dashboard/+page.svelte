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
        <KanbanBoard />
      </div>
  </PageContainer>

</ProtectedRoute>