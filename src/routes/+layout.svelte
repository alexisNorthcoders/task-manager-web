<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import { webSocketService } from '$lib/services/websocket';
  import SideMenu from '$lib/components/SideMenu.svelte';
  import NotificationCenter from '$lib/components/NotificationCenter.svelte';
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

  let showSideMenu = false;

  function handleLogout() {
    auth.clearUser();
    goto('/');
  }

  function toggleSideMenu() {
    showSideMenu = !showSideMenu;
  }

  function closeSideMenu() {
    showSideMenu = false;
  }

  // Check if current page is auth page
  $: isAuthPage = $page.url.pathname.startsWith('/auth');
  $: isHomePage = $page.url.pathname === '/';
</script>

<div class="min-h-screen bg-gray-50">
  <!-- Navigation Header (only for authenticated pages) -->
  {#if $auth.isAuthenticated && !isAuthPage && !isHomePage}
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-14">
          <!-- Logo and Navigation -->
          <div class="flex items-center space-x-4">
            <button
              on:click={toggleSideMenu}
              class="flex items-center space-x-2 hover:bg-gray-100 rounded-lg p-2 transition-colors"
              aria-label="Open menu"
            >
              <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-sm">TM</span>
              </div>
            </button>
            
            <nav class="hidden md:flex space-x-6">
              <a
                href="/dashboard"
                class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors {$page.url.pathname === '/dashboard' ? 'bg-gray-100 text-gray-900' : ''}"
              >
                Dashboard
              </a>
              <a
                href="/templates"
                class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors {$page.url.pathname.startsWith('/templates') ? 'bg-gray-100 text-gray-900' : ''}"
              >
                Templates
              </a>
              <a
                href="/settings"
                class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors {$page.url.pathname.startsWith('/settings') ? 'bg-gray-100 text-gray-900' : ''}"
              >
                Settings
              </a>
            </nav>
          </div>

          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <!-- Notifications -->
            <NotificationCenter />

            <!-- User Avatar and Info -->
            <div class="flex items-center space-x-3">
              {#if $auth.user?.avatarUrl}
                <img
                  src={$auth.user.avatarUrl}
                  alt="User avatar"
                  class="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                />
              {:else}
                <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-gray-200">
                  <span class="text-white font-semibold text-xs">
                    {($auth.user?.firstName?.charAt(0) || '') + ($auth.user?.lastName?.charAt(0) || '')}
                  </span>
                </div>
              {/if}
              <div class="hidden sm:block">
                <p class="text-sm font-medium text-gray-900">{$auth.user?.firstName || 'User'}</p>
                <p class="text-xs text-gray-500">{$auth.user?.role || 'USER'}</p>
              </div>
            </div>

            <button
              on:click={handleLogout}
              class="text-sm text-red-600 hover:text-red-500 px-3 py-2 rounded-md hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  {/if}

  <!-- Main Content -->
  <main class="{isAuthPage || isHomePage ? '' : 'pt-2'}">
    <slot />
  </main>

  <!-- Side Menu -->
  {#if $auth.isAuthenticated && !isAuthPage && !isHomePage}
    <SideMenu bind:isOpen={showSideMenu} on:close={closeSideMenu} />
  {/if}
</div>

<style>
  main {
    min-height: 100vh;
  }
</style>