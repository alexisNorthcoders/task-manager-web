<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { page } from '$app/stores';
  
  const dispatch = createEventDispatcher();
  
  export let isOpen = false;
  
  function closeMenu() {
    isOpen = false;
    dispatch('close');
  }
  
  function handleItemClick(href: string) {
    closeMenu();
    // Navigation will be handled by the link
  }
</script>

<!-- Backdrop -->
{#if isOpen}
  <div 
    class="fixed inset-0 bg-black bg-opacity-50 z-40"
    on:click={closeMenu}
    on:keydown={(e) => e.key === 'Escape' && closeMenu()}
    role="button"
    tabindex="0"
  ></div>
{/if}

<!-- Side Menu -->
<div class="fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out {isOpen ? 'translate-x-0' : '-translate-x-full'}">
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="flex items-center justify-between p-6 border-b border-gray-200">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
          <span class="text-white font-bold text-lg">TM</span>
        </div>
        <div>
          <h2 class="text-lg font-bold text-gray-900">Task Manager</h2>
          <p class="text-sm text-gray-500">Menu</p>
        </div>
      </div>
      <button
        on:click={closeMenu}
        class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Close menu"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-6">
      <div class="space-y-2">
        <a
          href="/dashboard"
          on:click={() => handleItemClick('/dashboard')}
          class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors {$page.url.pathname === '/dashboard' ? 'bg-blue-50 text-blue-700' : ''}"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"/>
          </svg>
          <span class="font-medium">Dashboard</span>
        </a>

        <a
          href="/templates"
          on:click={() => handleItemClick('/templates')}
          class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors {$page.url.pathname.startsWith('/templates') ? 'bg-blue-50 text-blue-700' : ''}"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <span class="font-medium">Templates</span>
        </a>

        <a
          href="/templates/new"
          on:click={() => handleItemClick('/templates/new')}
          class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors {$page.url.pathname === '/templates/new' ? 'bg-blue-50 text-blue-700' : ''}"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          <span class="font-medium">New Template</span>
        </a>
      </div>

      <!-- Divider -->
      <div class="my-6 border-t border-gray-200"></div>

      <!-- Quick Actions -->
      <div class="space-y-2">
        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h3>
        
        <a
          href="/tasks/new"
          on:click={() => handleItemClick('/tasks/new')}
          class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          <span class="font-medium">New Task</span>
        </a>

        <a
          href="/dashboard"
          on:click={() => handleItemClick('/dashboard')}
          class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          <span class="font-medium">Refresh Data</span>
        </a>
      </div>
    </nav>

    <!-- Footer -->
    <div class="p-6 border-t border-gray-200">
      <div class="text-xs text-gray-500 text-center">
        Task Manager v1.0
      </div>
    </div>
  </div>
</div>
