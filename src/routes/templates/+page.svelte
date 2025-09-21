<script lang="ts">
  import { onMount } from 'svelte';
  import ProtectedRoute from '$lib/components/ProtectedRoute.svelte';
  import ConfirmationDialog from '$lib/components/ConfirmationDialog.svelte';
  import { getTaskTemplates, deleteTaskTemplate, createTaskFromTemplate } from '$lib/api/tasks';
  import { usersStore } from '$lib/stores/users';
  import type { TaskTemplate } from '$lib/types';

  let templates: TaskTemplate[] = [];
  let loading = true;
  let error = '';

  // Create task from template state
  let showCreateFromTemplate = false;
  let selectedTemplate: TaskTemplate | null = null;
  let selectedUserIds: string[] = [];
  let createFromTemplateLoading = false;
  
  // Confirmation dialog state
  let showDeleteConfirm = false;
  let templateToDelete: TaskTemplate | null = null;
  let deleteConfirmLoading = false;

  onMount(async () => {
    await loadTemplates();
    await usersStore.load();
  });

  async function loadTemplates() {
    try {
      loading = true;
      templates = await getTaskTemplates();
      error = '';
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load templates';
    } finally {
      loading = false;
    }
  }

  function handleDeleteTemplate(template: TaskTemplate) {
    templateToDelete = template;
    showDeleteConfirm = true;
  }

  async function confirmDeleteTemplate() {
    if (!templateToDelete) return;
    
    deleteConfirmLoading = true;
    try {
      await deleteTaskTemplate(templateToDelete.id);
      await loadTemplates(); // Refresh the list
      showDeleteConfirm = false;
      templateToDelete = null;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete template';
    } finally {
      deleteConfirmLoading = false;
    }
  }

  function cancelDeleteTemplate() {
    showDeleteConfirm = false;
    templateToDelete = null;
  }

  function openCreateFromTemplate(template: TaskTemplate) {
    selectedTemplate = template;
    selectedUserIds = [];
    showCreateFromTemplate = true;
  }

  function closeCreateFromTemplate() {
    selectedTemplate = null;
    selectedUserIds = [];
    showCreateFromTemplate = false;
  }

  async function handleCreateFromTemplate() {
    if (!selectedTemplate) return;

    try {
      createFromTemplateLoading = true;
      await createTaskFromTemplate(selectedTemplate.id, selectedUserIds.length > 0 ? selectedUserIds : undefined);
      closeCreateFromTemplate();
      // Navigate to dashboard page to see the new task
      window.location.href = '/dashboard';
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to create task from template';
    } finally {
      createFromTemplateLoading = false;
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
</script>

<svelte:head>
  <title>Task Templates - Task Manager</title>
</svelte:head>

<ProtectedRoute>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <h1 class="text-2xl font-bold text-gray-900">Task Templates</h1>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Error Message -->
      {#if error}
        <div class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button on:click={loadTemplates} class="ml-2 underline hover:no-underline">
            Try again
          </button>
        </div>
      {/if}

      <!-- Templates List -->
      {#if loading}
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      {:else if templates.length === 0}
        <div class="text-center py-12">
          <div class="text-gray-500 mb-4">No templates yet.</div>
          <a href="/templates/new" class="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Create your first template
          </a>
        </div>
      {:else}
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {#each templates as template (template.id)}
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <!-- Template Header -->
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-medium text-gray-900 truncate">{template.name}</h3>
                  <p class="text-sm text-gray-600 mt-1">{template.title}</p>
                </div>
                
                <!-- Actions Dropdown -->
                <div class="relative flex-shrink-0 ml-2">
                  <button class="text-gray-400 hover:text-gray-600 p-1" title="More actions">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Template Content -->
              {#if template.description}
                <p class="text-gray-600 text-sm mb-3 line-clamp-2">{template.description}</p>
              {/if}

              <!-- Template Metadata -->
              <div class="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span>Created {formatDate(template.createdAt)}</span>
                {#if template.estimationHours}
                  <span class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {template.estimationHours}h
                  </span>
                {/if}
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-2">
                <button
                  on:click={() => openCreateFromTemplate(template)}
                  class="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Create Task
                </button>
                <a
                  href="/templates/{template.id}/edit"
                  class="p-2 text-gray-600 hover:text-gray-500 border border-gray-300 rounded-md"
                  title="Edit template"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </a>
                <button
                  on:click={() => handleDeleteTemplate(template)}
                  class="p-2 text-red-600 hover:text-red-500 border border-gray-300 rounded-md"
                  title="Delete template"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </main>
  </div>

  <!-- Create Task from Template Modal -->
  {#if showCreateFromTemplate && selectedTemplate}
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <!-- Modal Header -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Create Task from Template</h3>
            <button on:click={closeCreateFromTemplate} class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Template Info -->
          <div class="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 class="font-medium">{selectedTemplate.name}</h4>
            <p class="text-sm text-gray-600">{selectedTemplate.title}</p>
            {#if selectedTemplate.description}
              <p class="text-sm text-gray-500 mt-1">{selectedTemplate.description}</p>
            {/if}
          </div>

          <!-- User Assignment -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Assign to users (optional)
            </label>
            <div class="space-y-2 max-h-32 overflow-y-auto">
              {#each $usersStore.users as user (user.id)}
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    value={user.id}
                    bind:group={selectedUserIds}
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">
                    {user.firstName} {user.lastName} ({user.username})
                  </span>
                </label>
              {/each}
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3">
            <button
              on:click={handleCreateFromTemplate}
              disabled={createFromTemplateLoading}
              class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {createFromTemplateLoading ? 'Creating...' : 'Create Task'}
            </button>
            <button
              on:click={closeCreateFromTemplate}
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Confirmation Dialog -->
  <ConfirmationDialog
    bind:show={showDeleteConfirm}
    title="Delete Template"
    message="Are you sure you want to delete the template &quot;{templateToDelete?.name}&quot;? This action cannot be undone."
    confirmText="Delete"
    cancelText="Cancel"
    variant="danger"
    bind:isLoading={deleteConfirmLoading}
    on:confirm={confirmDeleteTemplate}
    on:cancel={cancelDeleteTemplate}
  />
</ProtectedRoute>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>