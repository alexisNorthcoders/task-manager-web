<script lang="ts">
  import type { Task } from '$lib/types';

  export let task: Task;
  export let variant: 'todo' | 'in-progress' | 'completed' = 'todo';
  export let showCheckbox: boolean = true;
  export let onToggleSelection: (taskId: string) => void;
  export let onDelete: (taskId: string) => void;
  export let isSelected: boolean = false;

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  function getVariantStyles() {
    switch (variant) {
      case 'todo':
        return {
          container: 'bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-shadow',
          title: 'font-medium text-gray-900 text-sm leading-tight',
          description: 'text-xs text-gray-600 mt-1 line-clamp-2',
          meta: 'text-xs text-gray-500',
          date: 'text-xs text-gray-500'
        };
      case 'in-progress':
        return {
          container: 'bg-white rounded-lg border border-blue-200 p-3 hover:shadow-sm transition-shadow',
          title: 'font-medium text-gray-900 text-sm leading-tight',
          description: 'text-xs text-gray-600 mt-1 line-clamp-2',
          meta: 'text-xs text-gray-500',
          date: 'text-xs text-gray-500'
        };
      case 'completed':
        return {
          container: 'bg-white rounded-lg border border-green-200 p-3 hover:shadow-sm transition-shadow opacity-75',
          title: 'font-medium text-gray-500 text-sm leading-tight line-through',
          description: 'text-xs text-gray-400 mt-1 line-clamp-2 line-through',
          meta: 'text-xs text-gray-400',
          date: 'text-xs text-gray-400'
        };
      default:
        return {
          container: 'bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-shadow',
          title: 'font-medium text-gray-900 text-sm leading-tight',
          description: 'text-xs text-gray-600 mt-1 line-clamp-2',
          meta: 'text-xs text-gray-500',
          date: 'text-xs text-gray-500'
        };
    }
  }

  $: styles = getVariantStyles();
</script>

<div class={styles.container}>
  <div class="flex items-start justify-between">
    <div class="flex items-start space-x-2 flex-1 min-w-0">
      {#if showCheckbox}
        <input
          type="checkbox"
          checked={isSelected}
          on:change={() => onToggleSelection(task.id)}
          class="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      {/if}
      <div class="flex-1 min-w-0">
        <h4 class={styles.title}>{task.title}</h4>
        {#if task.description}
          <p class={styles.description}>{task.description}</p>
        {/if}
        <div class="flex items-center gap-2 mt-2 {styles.meta}">
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
      <button on:click={() => onDelete(task.id)} class="text-gray-400 hover:text-red-600 p-1" aria-label="Delete task">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
      </button>
    </div>
  </div>
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
