<script lang="ts">
  import { onMount } from 'svelte';
  import { createTaskComment, updateTaskComment, deleteTaskComment } from '$lib/api/comments';
  import { auth } from '$lib/stores/auth';
  import type { TaskComment, CreateTaskCommentInput, UpdateTaskCommentInput } from '$lib/types';

  export let taskId: string;
  export let comments: TaskComment[] = [];
  export let onCommentAdded: (comment: TaskComment) => void = () => {};
  export let onCommentUpdated: (comment: TaskComment) => void = () => {};
  export let onCommentDeleted: (commentId: string) => void = () => {};

  let newComment = '';
  let editingCommentId: string | null = null;
  let editingContent = '';
  let replyingToId: string | null = null;
  let replyContent = '';
  let isSubmitting = false;
  let error = '';

  $: currentUser = $auth.user;

  function startEdit(comment: TaskComment) {
    editingCommentId = comment.id;
    editingContent = comment.content;
  }

  function cancelEdit() {
    editingCommentId = null;
    editingContent = '';
  }

  function startReply(commentId: string) {
    replyingToId = commentId;
    replyContent = '';
  }

  function cancelReply() {
    replyingToId = null;
    replyContent = '';
  }

  async function handleSubmitComment() {
    if (!newComment.trim() || isSubmitting) return;

    isSubmitting = true;
    error = '';

    try {
      const input: CreateTaskCommentInput = {
        taskId,
        content: newComment.trim()
      };

      const comment = await createTaskComment(input);
      comments = [...comments, comment];
      newComment = '';
      onCommentAdded(comment);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to add comment';
    } finally {
      isSubmitting = false;
    }
  }

  async function handleUpdateComment() {
    if (!editingCommentId || !editingContent.trim() || isSubmitting) return;

    isSubmitting = true;
    error = '';

    try {
      const input: UpdateTaskCommentInput = {
        content: editingContent.trim()
      };

      const comment = await updateTaskComment(editingCommentId, input);
      comments = comments.map(c => c.id === editingCommentId ? comment : c);
      editingCommentId = null;
      editingContent = '';
      onCommentUpdated(comment);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to update comment';
    } finally {
      isSubmitting = false;
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    isSubmitting = true;
    error = '';

    try {
      await deleteTaskComment(commentId);
      comments = comments.filter(c => c.id !== commentId);
      onCommentDeleted(commentId);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete comment';
    } finally {
      isSubmitting = false;
    }
  }

  async function handleSubmitReply() {
    if (!replyingToId || !replyContent.trim() || isSubmitting) return;

    isSubmitting = true;
    error = '';

    try {
      const input: CreateTaskCommentInput = {
        taskId,
        content: replyContent.trim(),
        parentCommentId: replyingToId
      };

      const comment = await createTaskComment(input);
      // Add reply to the parent comment
      comments = comments.map(c => 
        c.id === replyingToId 
          ? { ...c, replies: [...c.replies, comment] }
          : c
      );
      replyContent = '';
      replyingToId = null;
      onCommentAdded(comment);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to add reply';
    } finally {
      isSubmitting = false;
    }
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  function canEditComment(comment: TaskComment): boolean {
    return !!(currentUser && (currentUser.id === comment.author.id || currentUser.role === 'ADMIN'));
  }
</script>

<div class="space-y-6">
  <!-- Add Comment Form -->
  <div class="bg-white rounded-lg border border-gray-200 p-4">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Add Comment</h3>
    <form on:submit|preventDefault={handleSubmitComment} class="space-y-4">
      <div>
        <textarea
          bind:value={newComment}
          placeholder="Write a comment..."
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          disabled={isSubmitting}
        ></textarea>
      </div>
      <div class="flex justify-end">
        <button
          type="submit"
          disabled={!newComment.trim() || isSubmitting}
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Adding...' : 'Add Comment'}
        </button>
      </div>
    </form>
  </div>

  <!-- Error Message -->
  {#if error}
    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      {error}
    </div>
  {/if}

  <!-- Comments List -->
  <div class="space-y-4">
    {#each comments as comment (comment.id)}
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <!-- Comment Header -->
        <div class="flex items-start justify-between mb-2">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-sm font-medium text-blue-600">
                {comment.author.firstName[0]}{comment.author.lastName[0]}
              </span>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">
                {comment.author.firstName} {comment.author.lastName}
              </p>
              <p class="text-xs text-gray-500">
                @{comment.author.username} • {formatDate(comment.createdAt)}
                {#if comment.updatedAt !== comment.createdAt}
                  (edited)
                {/if}
              </p>
            </div>
          </div>
          
          {#if canEditComment(comment)}
            <div class="flex space-x-2">
              <button
                on:click={() => startEdit(comment)}
                class="text-sm text-gray-600 hover:text-gray-900"
                disabled={isSubmitting}
              >
                Edit
              </button>
              <button
                on:click={() => handleDeleteComment(comment.id)}
                class="text-sm text-red-600 hover:text-red-900"
                disabled={isSubmitting}
              >
                Delete
              </button>
            </div>
          {/if}
        </div>

        <!-- Comment Content -->
        {#if editingCommentId === comment.id}
          <div class="space-y-2">
            <textarea
              bind:value={editingContent}
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isSubmitting}
            ></textarea>
            <div class="flex space-x-2">
              <button
                on:click={handleUpdateComment}
                disabled={!editingContent.trim() || isSubmitting}
                class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
              <button
                on:click={cancelEdit}
                class="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </div>
        {:else}
          <div class="text-gray-900 whitespace-pre-wrap">
            {comment.content}
          </div>
        {/if}

        <!-- Reply Button -->
        <div class="mt-3">
          <button
            on:click={() => startReply(comment.id)}
            class="text-sm text-blue-600 hover:text-blue-800"
            disabled={isSubmitting}
          >
            Reply
          </button>
        </div>

        <!-- Reply Form -->
        {#if replyingToId === comment.id}
          <div class="mt-4 pl-4 border-l-2 border-gray-200">
            <div class="space-y-2">
              <textarea
                bind:value={replyContent}
                placeholder="Write a reply..."
                rows="2"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isSubmitting}
              ></textarea>
              <div class="flex space-x-2">
                <button
                  on:click={handleSubmitReply}
                  disabled={!replyContent.trim() || isSubmitting}
                  class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Replying...' : 'Reply'}
                </button>
                <button
                  on:click={cancelReply}
                  class="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        {/if}

        <!-- Replies -->
        {#if comment.replies && comment.replies.length > 0}
          <div class="mt-4 space-y-3">
            {#each comment.replies as reply (reply.id)}
              <div class="pl-4 border-l-2 border-gray-200">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex items-center space-x-2">
                    <div class="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <span class="text-xs font-medium text-gray-600">
                        {reply.author.firstName[0]}{reply.author.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">
                        {reply.author.firstName} {reply.author.lastName}
                      </p>
                      <p class="text-xs text-gray-500">
                        @{reply.author.username} • {formatDate(reply.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  {#if canEditComment(reply)}
                    <button
                      on:click={() => handleDeleteComment(reply.id)}
                      class="text-xs text-red-600 hover:text-red-900"
                      disabled={isSubmitting}
                    >
                      Delete
                    </button>
                  {/if}
                </div>
                <div class="text-gray-900 whitespace-pre-wrap text-sm">
                  {reply.content}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>

  {#if comments.length === 0}
    <div class="text-center py-8 text-gray-500">
      <p>No comments yet. Be the first to comment!</p>
    </div>
  {/if}
</div>
