<script lang="ts">
  import { goto } from '$app/navigation';
  import { register } from '$lib/api/auth';
  import { auth } from '$lib/stores/auth';
  import type { RegisterInput } from '$lib/types';

  let formData: RegisterInput = {
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: ''
  };
  
  let confirmPassword = '';
  let isLoading = false;
  let error = '';

  async function handleSubmit() {
    if (!formData.username || !formData.email || !formData.firstName || !formData.lastName || !formData.password) {
      error = 'Please fill in all fields';
      return;
    }
    
    if (formData.password !== confirmPassword) {
      error = 'Passwords do not match';
      return;
    }
    
    if (formData.password.length < 6) {
      error = 'Password must be at least 6 characters';
      return;
    }

    isLoading = true;
    error = '';

    try {
      const response = await register(formData);
      auth.setUser(response.user);
      goto('/dashboard');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Registration failed';
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Register - Task Manager</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
  <div class="max-w-md w-full space-y-8">
    <div class="text-center">
      <h2 class="text-3xl font-bold text-gray-900">Create your account</h2>
      <p class="mt-2 text-sm text-gray-600">
        Or <a href="/auth/login" class="text-primary-600 hover:text-primary-500 font-medium">sign in to existing account</a>
      </p>
    </div>
    
    <form on:submit|preventDefault={handleSubmit} class="mt-8 space-y-6">
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700">First Name</label>
            <input
              id="firstName"
              type="text"
              required
              bind:value={formData.firstName}
              class="input mt-1"
              placeholder="First name"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              id="lastName"
              type="text"
              required
              bind:value={formData.lastName}
              class="input mt-1"
              placeholder="Last name"
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
          <input
            id="username"
            type="text"
            required
            bind:value={formData.username}
            class="input mt-1"
            placeholder="Choose a username"
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            type="email"
            required
            bind:value={formData.email}
            class="input mt-1"
            placeholder="Enter your email"
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
            placeholder="Choose a password"
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            required
            bind:value={confirmPassword}
            class="input mt-1"
            placeholder="Confirm your password"
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
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </div>
    </form>
  </div>
</div>