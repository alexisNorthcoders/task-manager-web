<script lang="ts">
  export let title: string;
  export let subtitle: string = '';
  export let showBackButton: boolean = false;
  export let backHref: string = '/dashboard';
  export let backText: string = 'Back';
</script>

<div class="bg-white border-b border-gray-200">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="py-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          {#if showBackButton}
            <a 
              href={backHref} 
              class="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              <span class="font-medium">{backText}</span>
            </a>
            <div class="h-6 w-px bg-gray-300"></div>
          {/if}
          
          <div>
            <h1 class="text-3xl font-bold text-gray-900">{title}</h1>
            {#if subtitle}
              <p class="text-gray-600 mt-1">{subtitle}</p>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
