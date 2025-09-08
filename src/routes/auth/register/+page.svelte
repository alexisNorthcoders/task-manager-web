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
  let validationErrors: Record<string, string> = {};
  
  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Real-time validation
  $: {
    validationErrors = {};
    
    if (formData.username && formData.username.length < 3) {
      validationErrors.username = 'Username must be at least 3 characters';
    }
    
    if (formData.email && !emailRegex.test(formData.email)) {
      validationErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.firstName && formData.firstName.trim().length < 1) {
      validationErrors.firstName = 'First name is required';
    }
    
    if (formData.lastName && formData.lastName.trim().length < 1) {
      validationErrors.lastName = 'Last name is required';
    }
    
    if (formData.password && formData.password.length < 6) {
      validationErrors.password = 'Password must be at least 6 characters';
    }
    
    if (confirmPassword && formData.password !== confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match';
    }
  }
  
  $: isFormValid = formData.username.length >= 3 && 
                   formData.email && emailRegex.test(formData.email) &&
                   formData.firstName.trim().length > 0 &&
                   formData.lastName.trim().length > 0 &&
                   formData.password.length >= 6 &&
                   formData.password === confirmPassword &&
                   Object.keys(validationErrors).length === 0;

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
      auth.setAuth(response);
      goto('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
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
              class="input mt-1 {validationErrors.firstName ? 'border-red-500 focus:ring-red-500' : ''}"
              placeholder="First name"
              disabled={isLoading}
            />
            {#if validationErrors.firstName}
              <p class="mt-1 text-sm text-red-600">{validationErrors.firstName}</p>
            {/if}
          </div>
          
          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              id="lastName"
              type="text"
              required
              bind:value={formData.lastName}
              class="input mt-1 {validationErrors.lastName ? 'border-red-500 focus:ring-red-500' : ''}"
              placeholder="Last name"
              disabled={isLoading}
            />
            {#if validationErrors.lastName}
              <p class="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>
            {/if}
          </div>
        </div>
        
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
          <input
            id="username"
            type="text"
            required
            bind:value={formData.username}
            class="input mt-1 {validationErrors.username ? 'border-red-500 focus:ring-red-500' : ''}"
            placeholder="Choose a username"
            disabled={isLoading}
          />
          {#if validationErrors.username}
            <p class="mt-1 text-sm text-red-600">{validationErrors.username}</p>
          {/if}
        </div>
        
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            type="email"
            required
            bind:value={formData.email}
            class="input mt-1 {validationErrors.email ? 'border-red-500 focus:ring-red-500' : ''}"
            placeholder="Enter your email"
            disabled={isLoading}
          />
          {#if validationErrors.email}
            <p class="mt-1 text-sm text-red-600">{validationErrors.email}</p>
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
            placeholder="Choose a password"
            disabled={isLoading}
          />
          {#if validationErrors.password}
            <p class="mt-1 text-sm text-red-600">{validationErrors.password}</p>
          {/if}
        </div>
        
        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            required
            bind:value={confirmPassword}
            class="input mt-1 {validationErrors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}"
            placeholder="Confirm your password"
            disabled={isLoading}
          />
          {#if validationErrors.confirmPassword}
            <p class="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
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
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </div>
    </form>
  </div>
</div>