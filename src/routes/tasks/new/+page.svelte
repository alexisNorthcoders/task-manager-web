<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { tasksStore } from '$lib/stores/tasks';
  import ProtectedRoute from '$lib/components/ProtectedRoute.svelte';
  import { getTaskTemplates } from '$lib/api/tasks';
  import type { CreateTaskInput, TaskTemplate } from '$lib/types';

  let formData: CreateTaskInput = {
    title: '',
    description: '',
    dueDate: '',
    estimationHours: undefined
  };
  
  let isLoading = false;
  let error = '';
  let validationErrors: Record<string, string> = {};
  
  // Template functionality
  let templates: TaskTemplate[] = [];
  let selectedTemplateId = '';
  let templatesLoading = false;

  onMount(async () => {
    await loadTemplates();
  });

  async function loadTemplates() {
    try {
      templatesLoading = true;
      templates = await getTaskTemplates();
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      templatesLoading = false;
    }
  }

  function applyTemplate(templateId: string) {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      formData = {
        ...formData,
        title: template.title,
        description: template.description || '',
        estimationHours: template.estimationHours
      };
    }
  }

  function handleTemplateChange() {
    if (selectedTemplateId) {
      applyTemplate(selectedTemplateId);
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
      
      if (dueDate < today) {
        validationErrors.dueDate = 'Due date cannot be in the past';
      }
    }
  }

  $: isFormValid = formData.title.trim().length >= 3 && 
                   formData.title.length <= 100 &&
                   (!formData.description || formData.description.length <= 500) &&
                   (!formData.estimationHours || (formData.estimationHours >= 0.5 && formData.estimationHours <= 1000)) &&
                   Object.keys(validationErrors).length === 0;

  async function handleSubmit() {
    if (!isFormValid) return;

    isLoading = true;
    error = '';

    try {
      // Clean up the data
      const taskData: CreateTaskInput = {
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        dueDate: formData.dueDate || undefined,
        estimationHours: formData.estimationHours || undefined
      };

      await tasksStore.create(taskData);
      goto('/tasks');
    } catch (err) {
      console.error('Failed to create task:', err);
      error = err instanceof Error ? err.message : 'Failed to create task';
    } finally {
      isLoading = false;
    }
  }

  function handleCancel() {
    goto('/tasks');
  }
</script>

<svelte:head>
  <title>New Task - Task Manager</title>
</svelte:head>

<ProtectedRoute>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <h1 class="text-2xl font-bold text-gray-900">Create New Task</h1>
          <a href="/tasks" class="text-gray-600 hover:text-gray-500">
            ← Back to Tasks
          </a>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form on:submit|preventDefault={handleSubmit} class="space-y-6">
          <!-- Template Selection -->
          {#if templates.length > 0}
            <div>
              <label for="template" class="block text-sm font-medium text-gray-700 mb-2">
                Start from Template (optional)
              </label>
              <select
                id="template"
                bind:value={selectedTemplateId}
                on:change={handleTemplateChange}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading || templatesLoading}
              >
                <option value="">Create from scratch</option>
                {#each templates as template (template.id)}
                  <option value={template.id}>{template.name} - {template.title}</option>
                {/each}
              </select>
              <p class="mt-1 text-sm text-gray-500">
                Select a template to pre-fill the form with default values
              </p>
            </div>
          {/if}

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
              disabled={isLoading}
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
              disabled={isLoading}
            ></textarea>
            {#if validationErrors.description}
              <p class="mt-1 text-sm text-red-600">{validationErrors.description}</p>
            {/if}
            <p class="mt-1 text-sm text-gray-500">
              {formData.description?.length || 0}/500 characters
            </p>
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
              {#if validationErrors.estimationHours}
                <p class="mt-1 text-sm text-red-600">{validationErrors.estimationHours}</p>
              {/if}
              <p class="mt-1 text-sm text-gray-500">
                How many hours do you estimate this will take?
              </p>
            </div>
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
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              class="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</ProtectedRoute>