<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { webSocketService } from '$lib/services/websocket';
  import '../app.css';

  onMount(() => {
    auth.initialize();
    
    // Initialize WebSocket connection when user is authenticated
    const unsubscribe = auth.subscribe((authState) => {
      if (authState.isAuthenticated) {
        console.log('User authenticated, connecting WebSocket');
        webSocketService.connect();
      } else {
        console.log('User not authenticated, disconnecting WebSocket');
        webSocketService.disconnect();
      }
    });

    return unsubscribe;
  });

  onDestroy(() => {
    webSocketService.disconnect();
  });
</script>

<main>
  <slot />
</main>

<style>
  main {
    min-height: 100vh;
  }
</style>