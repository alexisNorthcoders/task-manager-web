<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { uploadAvatar, updateUserAvatar } from '$lib/api/users';

  const dispatch = createEventDispatcher();

  let isDragOver = false;
  let isUploading = false;
  let previewUrl: string | null = null;
  let errorMessage = '';
  let successMessage = '';

  function getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  function validateFile(file: File): boolean {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
      errorMessage = 'File size must be less than 5MB';
      return false;
    }

    if (!allowedTypes.includes(file.type)) {
      errorMessage = 'Please select a valid image file (JPG, PNG, GIF, WebP)';
      return false;
    }

    return true;
  }

  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragOver = false;

    const file = event.dataTransfer?.files?.[0];
    if (file) {
      handleFile(file);
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    isDragOver = true;
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    isDragOver = false;
  }

  async function handleFile(file: File) {
    if (!validateFile(file)) {
      return;
    }

    errorMessage = '';
    isUploading = true;

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);

      // Upload file
      const response = await uploadAvatar(file);

      // Update user avatar in store
      auth.updateUserAvatar(response.avatarUrl);

      successMessage = 'Avatar uploaded successfully!';
      errorMessage = '';

      dispatch('avatarUpdated', { avatarUrl: response.avatarUrl });
    } catch (error) {
      console.error('Upload error:', error);
      errorMessage = 'Failed to upload avatar. Please try again.';
      successMessage = '';
      previewUrl = null;
    } finally {
      isUploading = false;
    }
  }

  function clearMessages() {
    errorMessage = '';
    successMessage = '';
  }
</script>

<div class="bg-white rounded-lg shadow-sm border border-gray-200">
  <div class="px-6 py-4 border-b border-gray-200">
    <h2 class="text-lg font-semibold text-gray-900">Profile Picture</h2>
    <p class="text-sm text-gray-600 mt-1">Upload a new avatar image</p>
  </div>

  <div class="p-6">
    <!-- Current Avatar Display -->
    <div class="flex items-center space-x-4 mb-6">
      <div class="flex-shrink-0">
        {#if previewUrl}
          <img
            src={previewUrl}
            alt="Avatar preview"
            class="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
          />
        {:else if $auth.user?.avatarUrl}
          <img
            src={$auth.user.avatarUrl}
            alt="Current avatar"
            class="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
          />
        {:else}
          <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center border-2 border-gray-200">
            <span class="text-white font-semibold text-lg">
              {getInitials($auth.user?.firstName || '', $auth.user?.lastName || '')}
            </span>
          </div>
        {/if}
      </div>
      <div>
        <p class="text-sm font-medium text-gray-900">Current Avatar</p>
        <p class="text-xs text-gray-500">
          {#if previewUrl}
            Preview (not yet saved)
          {:else if $auth.user?.avatarUrl}
            Current profile picture
          {:else}
            Default avatar with initials
          {/if}
        </p>
      </div>
    </div>

    <!-- Upload Area -->
    <div
      class="border-2 border-dashed rounded-lg p-8 text-center transition-colors {isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}"
      class:border-blue-400={isDragOver}
      class:bg-blue-50={isDragOver}
      role="button"
      tabindex="0"
      on:drop={handleDrop}
      on:dragover={handleDragOver}
      on:dragleave={handleDragLeave}
      on:keydown={(e) => e.key === 'Enter' && document.getElementById('file-input')?.click()}
    >
      {#if isUploading}
        <div class="flex flex-col items-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p class="text-sm text-gray-600">Uploading...</p>
        </div>
      {:else}
        <div class="flex flex-col items-center">
          <svg class="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>

          <p class="text-lg font-medium text-gray-900 mb-2">
            {isDragOver ? 'Drop your image here' : 'Upload a new avatar'}
          </p>

          <p class="text-sm text-gray-600 mb-4">
            Drag and drop an image here, or click to browse
          </p>

          <label class="cursor-pointer">
            <span class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Choose File
            </span>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              on:change={handleFileSelect}
              class="hidden"
            />
          </label>
        </div>
      {/if}
    </div>

    <!-- File Requirements -->
    <div class="mt-4">
      <p class="text-xs text-gray-500">
        <strong>Requirements:</strong> JPG, PNG, GIF, or WebP • Max 5MB • Square images recommended
      </p>
    </div>

    <!-- Messages -->
    {#if errorMessage}
      <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-800">{errorMessage}</p>
      </div>
    {/if}

    {#if successMessage}
      <div class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <p class="text-sm text-green-800">{successMessage}</p>
      </div>
    {/if}
  </div>
</div>
