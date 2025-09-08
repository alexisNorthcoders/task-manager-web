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
  let validationErrors: Record<string, string> = {};
  
  // Real-time validation
  $: {
    validationErrors = {};
    
    if (formData.username && formData.username.length < 3) {
      validationErrors.username = 'Username must be at least 3 characters';
    }
    
    if (formData.password && formData.password.length < 6) {
      validationErrors.password = 'Password must be at least 6 characters';
    }
  }
  
  $: isFormValid = formData.username.length >= 3 && 
                   formData.password.length >= 6 && 
                   Object.keys(validationErrors).length === 0;

  async function handleSubmit() {
    if (!formData.username || !formData.password) {
      error = 'Please fill in all fields';
      return;
    }

    isLoading = true;
    error = '';

    try {
      const response = await login(formData);
      auth.setAuth(response);
      goto('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
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
            class="input mt-1 {validationErrors.username ? 'border-red-500 focus:ring-red-500' : ''}"
            placeholder="Enter your username"
            disabled={isLoading}
          />
          {#if validationErrors.username}
            <p class="mt-1 text-sm text-red-600">{validationErrors.username}</p>
          {/if}
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input
            id="password"
            type="password"
            required
            bind:value={formData.password}
            class="input mt-1 {validationErrors.password ? 'border-red-500 focus:ring-red-500' : ''}"
            placeholder="Enter your password"
            disabled={isLoading}
          />
          {#if validationErrors.password}
            <p class="mt-1 text-sm text-red-600">{validationErrors.password}</p>
          {/if}
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
          disabled={isLoading || !isFormValid}
          class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </form>
  </div>
</div>