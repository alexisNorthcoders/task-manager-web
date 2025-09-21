<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let show = false;
  export let title = 'Confirm Action';
  export let message = 'Are you sure you want to proceed?';
  export let confirmText = 'Confirm';
  export let cancelText = 'Cancel';
  export let variant: 'default' | 'danger' = 'default';
  export let isLoading = false;
  
  const dispatch = createEventDispatcher();
  
  function handleConfirm() {
    dispatch('confirm');
  }
  
  function handleCancel() {
    dispatch('cancel');
  }
  
  function handleBackdropClick(event: MouseEvent | KeyboardEvent) {
    if (event.target === event.currentTarget) {
      handleCancel();
    }
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleCancel();
    }
  }
  
  $: buttonStyles = variant === 'danger' 
    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
    
  $: iconColor = variant === 'danger' ? 'text-red-600' : 'text-blue-600';
  $: iconBg = variant === 'danger' ? 'bg-red-100' : 'bg-blue-100';
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
  <!-- Backdrop -->
  <div 
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" 
    on:click={handleBackdropClick}
    on:keydown={(e) => e.key === 'Enter' && handleBackdropClick(e)}
    role="dialog"
    aria-modal="true"
    aria-labelledby="dialog-title"
    aria-describedby="dialog-message"
    tabindex="-1"
  >
    <!-- Modal -->
    <div 
      class="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-lg bg-white" 
      on:click|stopPropagation
      role="document"
    >
      <!-- Header -->
      <div class="flex items-center justify-center mb-4">
        <div class="flex-shrink-0 w-12 h-12 mx-auto flex items-center justify-center rounded-full {iconBg}">
          {#if variant === 'danger'}
            <svg class="w-6 h-6 {iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          {:else}
            <svg class="w-6 h-6 {iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          {/if}
        </div>
      </div>
      
      <!-- Content -->
      <div class="text-center">
        <h3 id="dialog-title" class="text-lg font-medium text-gray-900 mb-2">
          {title}
        </h3>
        <p id="dialog-message" class="text-sm text-gray-600 mb-6">
          {message}
        </p>
      </div>
      
      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3 sm:gap-3">
        <button
          on:click={handleCancel}
          disabled={isLoading}
          class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {cancelText}
        </button>
        <button
          on:click={handleConfirm}
          disabled={isLoading}
          class="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors {buttonStyles}"
        >
          {#if isLoading}
            <div class="flex items-center justify-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          {:else}
            {confirmText}
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}
