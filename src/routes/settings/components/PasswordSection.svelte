<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { updateUserPassword } from '$lib/api/users';

  const dispatch = createEventDispatcher();

  let currentPassword = '';
  let newPassword = '';
  let confirmPassword = '';
  let isSubmitting = false;
  let errorMessage = '';
  let successMessage = '';

  let currentPasswordError = '';
  let newPasswordError = '';
  let confirmPasswordError = '';

  function validateCurrentPassword(): boolean {
    if (!currentPassword.trim()) {
      currentPasswordError = 'Current password is required';
      return false;
    }
    currentPasswordError = '';
    return true;
  }

  function validateNewPassword(): boolean {
    if (!newPassword.trim()) {
      newPasswordError = 'New password is required';
      return false;
    }

    if (newPassword.length < 8) {
      newPasswordError = 'Password must be at least 8 characters long';
      return false;
    }

    if (newPassword === currentPassword) {
      newPasswordError = 'New password must be different from current password';
      return false;
    }

    newPasswordError = '';
    return true;
  }

  function validateConfirmPassword(): boolean {
    if (!confirmPassword.trim()) {
      confirmPasswordError = 'Please confirm your new password';
      return false;
    }

    if (newPassword !== confirmPassword) {
      confirmPasswordError = 'Passwords do not match';
      return false;
    }

    confirmPasswordError = '';
    return true;
  }

  function getPasswordStrength(password: string): { score: number; label: string; color: string } {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) {
      return { score, label: 'Weak', color: 'bg-red-500' };
    } else if (score <= 3) {
      return { score, label: 'Medium', color: 'bg-yellow-500' };
    } else {
      return { score, label: 'Strong', color: 'bg-green-500' };
    }
  }

  $: passwordStrength = getPasswordStrength(newPassword);
  $: isFormValid = !currentPasswordError && !newPasswordError && !confirmPasswordError && currentPassword && newPassword && confirmPassword;

  function clearMessages() {
    errorMessage = '';
    successMessage = '';
  }

  async function handleSubmit() {
    clearMessages();

    // Validate all fields
    const isCurrentValid = validateCurrentPassword();
    const isNewValid = validateNewPassword();
    const isConfirmValid = validateConfirmPassword();

    if (!isCurrentValid || !isNewValid || !isConfirmValid) {
      return;
    }

    if (!isFormValid) {
      return;
    }

    isSubmitting = true;

    try {
      await updateUserPassword({
        currentPassword,
        newPassword
      });

      successMessage = 'Password updated successfully!';
      errorMessage = '';

      // Clear form
      currentPassword = '';
      newPassword = '';
      confirmPassword = '';

      dispatch('passwordUpdated');
    } catch (error) {
      console.error('Password update error:', error);
      if (error instanceof Error) {
        errorMessage = error.message || 'Failed to update password. Please try again.';
      } else {
        errorMessage = 'Failed to update password. Please try again.';
      }
      successMessage = '';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="bg-white rounded-lg shadow-sm border border-gray-200">
  <div class="px-6 py-4 border-b border-gray-200">
    <h2 class="text-lg font-semibold text-gray-900">Change Password</h2>
    <p class="text-sm text-gray-600 mt-1">Update your account password</p>
  </div>

  <div class="p-6">
    <form on:submit|preventDefault={handleSubmit} class="space-y-6">
      <!-- Current Password -->
      <div>
        <label for="current-password" class="block text-sm font-medium text-gray-700 mb-2">
          Current Password *
        </label>
        <input
          id="current-password"
          type="password"
          bind:value={currentPassword}
          on:blur={validateCurrentPassword}
          on:input={clearMessages}
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent {currentPasswordError ? 'border-red-300' : 'border-gray-300'}"
          placeholder="Enter your current password"
          required
        />
        {#if currentPasswordError}
          <p class="mt-1 text-sm text-red-600">{currentPasswordError}</p>
        {/if}
      </div>

      <!-- New Password -->
      <div>
        <label for="new-password" class="block text-sm font-medium text-gray-700 mb-2">
          New Password *
        </label>
        <input
          id="new-password"
          type="password"
          bind:value={newPassword}
          on:blur={validateNewPassword}
          on:input={() => { validateNewPassword(); clearMessages(); }}
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent {newPasswordError ? 'border-red-300' : 'border-gray-300'}"
          placeholder="Enter your new password"
          required
        />
        {#if newPasswordError}
          <p class="mt-1 text-sm text-red-600">{newPasswordError}</p>
        {:else if newPassword}
          <div class="mt-2">
            <div class="flex items-center space-x-2">
              <div class="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-300 {passwordStrength.color}"
                  style="width: {passwordStrength.score * 20}%"
                ></div>
              </div>
              <span class="text-xs text-gray-600 font-medium">{passwordStrength.label}</span>
            </div>
          </div>
        {/if}
      </div>

      <!-- Confirm Password -->
      <div>
        <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-2">
          Confirm New Password *
        </label>
        <input
          id="confirm-password"
          type="password"
          bind:value={confirmPassword}
          on:blur={validateConfirmPassword}
          on:input={() => { validateConfirmPassword(); clearMessages(); }}
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent {confirmPasswordError ? 'border-red-300' : 'border-gray-300'}"
          placeholder="Confirm your new password"
          required
        />
        {#if confirmPasswordError}
          <p class="mt-1 text-sm text-red-600">{confirmPasswordError}</p>
        {/if}
      </div>

      <!-- Password Requirements -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p class="text-sm font-medium text-blue-900 mb-2">Password Requirements:</p>
        <ul class="text-sm text-blue-800 space-y-1">
          <li class="flex items-center">
            <span class="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
            At least 8 characters long
          </li>
          <li class="flex items-center">
            <span class="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
            Different from current password
          </li>
          <li class="flex items-center">
            <span class="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
            Must be confirmed in both fields
          </li>
        </ul>
      </div>

      <!-- Messages -->
      {#if errorMessage}
        <div class="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-800">{errorMessage}</p>
        </div>
      {/if}

      {#if successMessage}
        <div class="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p class="text-sm text-green-800">{successMessage}</p>
        </div>
      {/if}

      <!-- Submit Button -->
      <div class="flex justify-end">
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          class="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {#if isSubmitting}
            <span class="flex items-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Updating...
            </span>
          {:else}
            Update Password
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>
