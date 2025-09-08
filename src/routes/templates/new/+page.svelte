<script lang="ts">
  import { goto } from '$app/navigation';
  import ProtectedRoute from '$lib/components/ProtectedRoute.svelte';
  import { createTaskTemplate } from '$lib/api/tasks';
  import type { CreateTaskTemplateInput } from '$lib/types';

  let formData: CreateTaskTemplateInput = {
    name: '',
    title: '',
    description: '',
    estimationHours: undefined
  };

  let loading = false;
  let error = '';
  let success = false;

  async function handleSubmit() {
    if (!formData.name.trim() || !formData.title.trim()) {
      error = 'Name and title are required';
      return;
    }

    try {
      loading = true;
      error = '';
      
      const template = await createTaskTemplate({
        name: formData.name.trim(),
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        estimationHours: formData.estimationHours || undefined
      });

      success = true;
      
      // Redirect to templates page after a short delay
      setTimeout(() => {
        goto('/templates');
      }, 1500);

    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to create template';
    } finally {
      loading = false;
    }
  }

  function handleCancel() {
    goto('/templates');
  }
</script>

<svelte:head>
  <title>New Template - Task Manager</title>
</svelte:head>

<ProtectedRoute>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <h1 class="text-2xl font-bold text-gray-900">Create New Template</h1>
          <a href="/templates" class="text-gray-600 hover:text-gray-500">
            ← Back to Templates
          </a>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div class="bg-white shadow rounded-lg">
        <form on:submit|preventDefault={handleSubmit} class="p-6 space-y-6">
          
          <!-- Success Message -->
          {#if success}
            <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              Template created successfully! Redirecting to templates...
            </div>
          {/if}

          <!-- Error Message -->
          {#if error}
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          {/if}

          <!-- Template Name -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
              Template Name *
            </label>
            <input
              type="text"
              id="name"
              bind:value={formData.name}
              placeholder="e.g., Bug Fix Template, Feature Development, Code Review..."
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p class="mt-1 text-sm text-gray-500">
              A unique identifier for this template
            </p>
          </div>

          <!-- Task Title -->
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
              Default Task Title *
            </label>
            <input
              type="text"
              id="title"
              bind:value={formData.title}
              placeholder="e.g., Fix critical bug in user authentication"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p class="mt-1 text-sm text-gray-500">
              The default title that will be used when creating tasks from this template
            </p>
          </div>

          <!-- Description -->
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
              Default Description
            </label>
            <textarea
              id="description"
              bind:value={formData.description}
              rows="4"
              placeholder="Describe the task template and what needs to be done..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
            <p class="mt-1 text-sm text-gray-500">
              Optional description that will be included in tasks created from this template
            </p>
          </div>

          <!-- Estimation Hours -->
          <div>
            <label for="estimationHours" class="block text-sm font-medium text-gray-700 mb-2">
              Estimated Hours
            </label>
            <input
              type="number"
              id="estimationHours"
              bind:value={formData.estimationHours}
              min="0"
              max="10000"
              step="0.5"
              placeholder="e.g., 2.5"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p class="mt-1 text-sm text-gray-500">
              Optional default estimation for tasks created from this template
            </p>
          </div>

          <!-- Form Actions -->
          <div class="flex items-center justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              on:click={handleCancel}
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating...' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</ProtectedRoute>