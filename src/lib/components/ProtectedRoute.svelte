<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';

  export let redirectTo = '/auth/login';
  
  let isChecking = true;

  onMount(() => {
    // Wait for auth store to initialize
    const unsubscribe = auth.subscribe((authState) => {
      if (!authState.isLoading) {
        isChecking = false;
        if (!authState.isAuthenticated) {
          goto(redirectTo);
        }
      }
    });

    return unsubscribe;
  });
</script>

{#if isChecking}
  <div class="min-h-screen flex items-center justify-center">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
{:else if $auth.isAuthenticated}
  <slot />
{/if}