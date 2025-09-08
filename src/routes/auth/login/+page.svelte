<script lang="ts">
  import { goto } from '$app/navigation';
  import { login } from '$lib/api/auth';
  import { auth } from '$lib/stores/auth';
  import type { LoginInput } from '$lib/types';

  let formData: LoginInput = {
    username: '',
    password: ''
  };
  
  let isLoading = false;
  let error = '';

  async function handleSubmit() {
    if (!formData.username || !formData.password) {
      error = 'Please fill in all fields';
      return;
    }

    isLoading = true;
    error = '';

    try {
      const response = await login(formData);
      auth.setUser(response.user);
      goto('/dashboard');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Login failed';
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Login - Task Manager</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
  <div class="max-w-md w-full space-y-8">
    <div class="text-center">
      <h2 class="text-3xl font-bold text-gray-900">Sign in to your account</h2>
      <p class="mt-2 text-sm text-gray-600">
        Or <a href="/auth/register" class="text-primary-600 hover:text-primary-500 font-medium">create a new account</a>
      </p>
    </div>
    
    <form on:submit|preventDefault={handleSubmit} class="mt-8 space-y-6">
      <div class="space-y-4">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
          <input
            id="username"
            type="text"
            required
            bind:value={formData.username}
            class="input mt-1"
            placeholder="Enter your username"
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input
            id="password"
            type="password"
            required
            bind:value={formData.password}
            class="input mt-1"
            placeholder="Enter your password"
            disabled={isLoading}
          />
        </div>
      </div>

      {#if error}
        <div class="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      {/if}

      <div>
        <button
          type="submit"
          disabled={isLoading}
          class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </form>
  </div>
</div>