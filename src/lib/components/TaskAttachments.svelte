<script lang="ts">
  import { onMount } from 'svelte';
  import { getTaskAttachments, deleteTaskAttachment, uploadAttachment } from '$lib/api/attachments';
  import { auth } from '$lib/stores/auth';
  import ConfirmationDialog from './ConfirmationDialog.svelte';
  import type { TaskAttachment } from '$lib/types';
  import { PUBLIC_API_URL } from '$env/static/public';

  export let taskId: string;
  export let onAttachmentAdded: (attachment: TaskAttachment) => void = () => {};
  export let onAttachmentDeleted: (attachmentId: string) => void = () => {};

  let attachments: TaskAttachment[] = [];
  let isLoading = true;
  let error = '';
  let isUploading = false;
  let uploadError = '';
  let showUploadForm = false;
  let selectedFile: File | null = null;
  let description = '';
  
  // Confirmation dialog state
  let showDeleteConfirm = false;
  let attachmentToDelete: string | null = null;
  let deleteConfirmLoading = false;

  $: currentUser = $auth.user;

  onMount(() => {
    loadAttachments();
  });

  async function loadAttachments() {
    try {
      isLoading = true;
      error = '';
      attachments = await getTaskAttachments(taskId);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load attachments';
    } finally {
      isLoading = false;
    }
  }

  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      selectedFile = target.files[0];
      uploadError = '';
    }
  }

  async function handleUpload() {
    if (!selectedFile || isUploading) return;

    isUploading = true;
    uploadError = '';

    try {
      const attachment = await uploadAttachment(taskId, selectedFile, description || undefined);
      attachments = [attachment, ...attachments];
      selectedFile = null;
      description = '';
      showUploadForm = false;
      onAttachmentAdded(attachment);
    } catch (err) {
      uploadError = err instanceof Error ? err.message : 'Failed to upload attachment';
    } finally {
      isUploading = false;
    }
  }

  function cancelUpload() {
    selectedFile = null;
    description = '';
    showUploadForm = false;
    uploadError = '';
  }

  function handleDelete(attachmentId: string) {
    attachmentToDelete = attachmentId;
    showDeleteConfirm = true;
  }

  async function confirmDeleteAttachment() {
    if (!attachmentToDelete) return;
    
    deleteConfirmLoading = true;
    try {
      await deleteTaskAttachment(attachmentToDelete);
      attachments = attachments.filter(a => a.id !== attachmentToDelete);
      onAttachmentDeleted(attachmentToDelete);
      showDeleteConfirm = false;
      attachmentToDelete = null;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete attachment';
    } finally {
      deleteConfirmLoading = false;
    }
  }

  function cancelDeleteAttachment() {
    showDeleteConfirm = false;
    attachmentToDelete = null;
  }

  function canDeleteAttachment(attachment: TaskAttachment): boolean {
    return !!(currentUser && attachment.uploader && (currentUser.id === attachment.uploader.id || currentUser.role === 'ADMIN'));
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  function getFileIcon(contentType: string | undefined): string {
    if (!contentType) return '📎';
    if (contentType.startsWith('image/')) return '🖼️';
    if (contentType.includes('pdf')) return '📄';
    if (contentType.includes('word')) return '📝';
    if (contentType.includes('text')) return '📄';
    return '📎';
  }
</script>

<div class="space-y-6">
  <!-- Header and Upload Button -->
  <div class="flex items-center justify-between">
    <h3 class="text-lg font-medium text-gray-900">Attachments</h3>
    <button
      on:click={() => showUploadForm = !showUploadForm}
      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      {showUploadForm ? 'Cancel Upload' : 'Add Attachment'}
    </button>
  </div>

  <!-- Upload Form -->
  {#if showUploadForm}
    <div class="bg-white rounded-lg border border-gray-200 p-4">
      <h4 class="text-md font-medium text-gray-900 mb-4">Upload File</h4>
      <form on:submit|preventDefault={handleUpload} class="space-y-4">
        <div>
          <label for="file" class="block text-sm font-medium text-gray-700 mb-2">
            Select File
          </label>
          <input
            id="file"
            type="file"
            on:change={handleFileSelect}
            accept="image/*,.pdf,.txt,.doc,.docx"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isUploading}
          />
          <p class="mt-1 text-xs text-gray-500">
            Supported formats: Images (JPEG, PNG, GIF, WebP), PDF, TXT, DOC, DOCX (max 10MB)
          </p>
        </div>

        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
            Description (optional)
          </label>
          <input
            id="description"
            type="text"
            bind:value={description}
            placeholder="Brief description of the file"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isUploading}
          />
        </div>

        {#if uploadError}
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {uploadError}
          </div>
        {/if}

        <div class="flex space-x-3">
          <button
            type="submit"
            disabled={!selectedFile || isUploading}
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
          <button
            type="button"
            on:click={cancelUpload}
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            disabled={isUploading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  {/if}

  <!-- Error Message -->
  {#if error}
    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      {error}
      <button on:click={loadAttachments} class="ml-2 underline hover:no-underline">
        Try again
      </button>
    </div>
  {/if}

  <!-- Loading State -->
  {#if isLoading}
    <div class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  {:else if attachments.length === 0}
    <div class="text-center py-8 text-gray-500">
      <p>No attachments yet.</p>
    </div>
  {:else}
    <!-- Attachments Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each attachments as attachment (attachment.id)}
        <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <!-- File Icon and Name -->
          <div class="flex items-start space-x-3 mb-3">
            <div class="flex-shrink-0 text-2xl">
              {getFileIcon(attachment.contentType)}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">
                {attachment.originalFilename || 'Unknown file'}
              </p>
              <p class="text-xs text-gray-500">
                {attachment.fileSizeFormatted || 'Unknown size'} • {attachment.createdAt ? formatDate(attachment.createdAt) : 'Unknown date'}
              </p>
            </div>
            {#if canDeleteAttachment(attachment)}
              <button
                on:click={() => handleDelete(attachment.id)}
                class="flex-shrink-0 text-red-600 hover:text-red-800"
                title="Delete attachment"
                aria-label="Delete attachment"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            {/if}
          </div>

          <!-- Description -->
          {#if attachment.description}
            <p class="text-sm text-gray-600 mb-3">
              {attachment.description}
            </p>
          {/if}

          <!-- Image Preview -->
          {#if attachment.isImage}
            <div class="mb-3">
              <img
                src={`${PUBLIC_API_URL || 'http://localhost:8080'}/api/attachments/download/${attachment.id}`}
                alt={attachment.originalFilename}
                class="w-full h-32 object-cover rounded-lg border border-gray-200"
                loading="lazy"
              />
            </div>
          {/if}

          <!-- Uploader Info -->
          <div class="flex items-center space-x-2 text-xs text-gray-500">
            <div class="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
              <span class="text-xs font-medium text-gray-600">
                {attachment.uploader.firstName[0]}{attachment.uploader.lastName[0]}
              </span>
            </div>
            <span>
              {attachment.uploader.firstName} {attachment.uploader.lastName}
            </span>
          </div>

          <!-- Download Link -->
          <div class="mt-3">
            <a
              href={`${PUBLIC_API_URL || 'http://localhost:8080'}/api/attachments/download/${attachment.id}`}
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Download
            </a>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Confirmation Dialog -->
  <ConfirmationDialog
    bind:show={showDeleteConfirm}
    title="Delete Attachment"
    message="Are you sure you want to delete this attachment? This action cannot be undone."
    confirmText="Delete"
    cancelText="Cancel"
    variant="danger"
    bind:isLoading={deleteConfirmLoading}
    on:confirm={confirmDeleteAttachment}
    on:cancel={cancelDeleteAttachment}
  />
</div>
