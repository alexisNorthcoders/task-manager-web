<script lang="ts">
  import { keyboardService } from '../services/keyboard';
  
  export let show = false;
  
  $: shortcuts = keyboardService.getShortcuts();
  
  function closeHelp() {
    show = false;
  }
  
  function groupShortcuts(shortcuts: any[]) {
    const groups: Record<string, any[]> = {};
    shortcuts.forEach(shortcut => {
      const context = shortcut.context || 'global';
      if (!groups[context]) groups[context] = [];
      groups[context].push(shortcut);
    });
    return groups;
  }
  
  $: groupedShortcuts = groupShortcuts(shortcuts);
  
  function getContextTitle(context: string): string {
    switch (context) {
      case 'global': return 'Global Shortcuts';
      case 'tasks': return 'Task Management';
      case 'templates': return 'Templates';
      default: return context;
    }
  }
</script>

{#if show}
  <!-- Backdrop -->
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" on:click={closeHelp}>
    <!-- Modal -->
    <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white" on:click|stopPropagation>
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-medium text-gray-900">Keyboard Shortcuts</h3>
        <button on:click={closeHelp} class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      
      <!-- Shortcuts List -->
      <div class="space-y-6">
        {#each Object.entries(groupedShortcuts) as [context, contextShortcuts]}
          <div>
            <h4 class="text-md font-medium text-gray-800 mb-3">{getContextTitle(context)}</h4>
            <div class="space-y-2">
              {#each contextShortcuts as shortcut}
                <div class="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <span class="text-sm text-gray-700">{shortcut.description}</span>
                  <kbd class="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded-lg">
                    {keyboardService.formatShortcut(shortcut)}
                  </kbd>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
      
      <!-- Footer -->
      <div class="mt-6 flex justify-end">
        <button
          on:click={closeHelp}
          class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  kbd {
    box-shadow: inset 0 -2px 0 #cdcdcd;
  }
</style>