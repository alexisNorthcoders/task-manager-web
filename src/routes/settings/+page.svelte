<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import PageContainer from '$lib/components/PageContainer.svelte';
  import PasswordSection from './components/PasswordSection.svelte';
  import AvatarSection from './components/AvatarSection.svelte';
  import ProfileSection from './components/ProfileSection.svelte';

  onMount(() => {
    if (!$auth.isAuthenticated) {
      goto('/auth/login');
    }
  });

  $: if (!$auth.isAuthenticated) {
    goto('/auth/login');
  }
</script>

<svelte:head>
  <title>User Settings - Task Manager</title>
</svelte:head>

{#if $auth.isAuthenticated}
  <PageContainer>
    <div class="max-w-4xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">User Settings</h1>
        <p class="text-gray-600 mt-2">Manage your account settings and preferences</p>
      </div>

      <div class="space-y-8">
        <!-- Profile Information -->
        <ProfileSection />

        <!-- Avatar Upload -->
        <AvatarSection />

        <!-- Password Change -->
        <PasswordSection />
      </div>
    </div>
  </PageContainer>
{/if}
