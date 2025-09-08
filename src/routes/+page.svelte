<script lang="ts">
  import { onMount } from 'svelte';
  
  let mounted = false;
  
  onMount(() => {
    mounted = true;
  });
</script>

<svelte:head>
  <title>Task Manager</title>
  <meta name="description" content="Mobile-first task management application" />
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
  <div class="max-w-md w-full">
    <h1 class="text-4xl font-bold text-gray-900 mb-8 text-center">Task Manager</h1>
    
    {#if mounted}
      <div class="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        <p class="text-lg text-gray-600 mb-4 text-center">Welcome to your mobile-first task management app!</p>
        <p class="text-green-600 font-medium text-center mb-6">SvelteKit + TailwindCSS is running successfully.</p>
        <div class="space-y-3">
          <a href="/auth/login" class="block w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-center font-medium hover:bg-blue-700 transition-colors">Get Started</a>
          <a href="/auth/register" class="block w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-center font-medium hover:bg-gray-300 transition-colors">Create Account</a>
        </div>
      </div>
    {:else}
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="animate-pulse space-y-3">
          <div class="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
          <div class="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    {/if}
  </div>
</div>