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

<div class="min-h-screen flex items-center justify-center px-4">
  <div class="max-w-md w-full">
    <div class="text-center mb-8">
      <div class="flex justify-center mb-6">
        <div class="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center">
          <span class="text-white font-bold text-3xl">TM</span>
        </div>
      </div>
      <h1 class="text-4xl font-bold text-gray-900">Task Manager</h1>
      <p class="text-lg text-gray-600 mt-2">Your productivity companion</p>
    </div>
    
    {#if mounted}
      <div class="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        <p class="text-lg text-gray-600 mb-4 text-center">Welcome to your task management app!</p>
        <div class="space-y-3">
          <a href="/auth/login" class="block w-full btn-primary text-center">Get Started</a>
          <a href="/auth/register" class="block w-full btn-secondary text-center">Create Account</a>
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