<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import '../app.css';

  onMount(() => {
    auth.initialize();
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