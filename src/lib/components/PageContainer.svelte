<script lang="ts">
  export let maxWidth: string = 'max-w-7xl';
  export let padding: string = 'py-6';
</script>

<div class="{maxWidth} mx-auto px-4 sm:px-6 lg:px-8">
  <div class="{padding}">
    <slot />
  </div>
</div>
