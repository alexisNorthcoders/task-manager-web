<script lang="ts">
  import { notifications, clearNotifications, wsConnected } from '../services/websocket';
  import type { WebSocketNotification } from '../types';

  let showNotifications = false;

  function formatNotificationMessage(notification: WebSocketNotification): string {
    switch (notification.type) {
      case 'TASK_CREATED':
        return `New task created: ${notification.task?.title}`;
      case 'TASK_UPDATED':
        return `Task updated: ${notification.task?.title}`;
      case 'TASK_DELETED':
        return `Task deleted (ID: ${notification.taskId})`;
      case 'BULK_OPERATION':
        return `Bulk operation: ${notification.operation} (${notification.count} tasks)`;
      case 'TASK_ASSIGNED':
        return `Task assigned: ${notification.task?.title}`;
      case 'USER_PRESENCE':
        return `${notification.username} is ${notification.isOnline ? 'online' : 'offline'}`;
      default:
        return 'Unknown notification';
    }
  }

  function getNotificationColor(notification: WebSocketNotification): string {
    switch (notification.type) {
      case 'TASK_CREATED':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'TASK_UPDATED':
      case 'TASK_ASSIGNED':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'TASK_DELETED':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'BULK_OPERATION':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'USER_PRESENCE':
        return 'bg-gray-50 border-gray-200 text-gray-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  }

  function formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
</script>

<!-- Notification Bell Icon with Badge -->
<div class="relative">
  <button
    on:click={() => showNotifications = !showNotifications}
    class="relative p-2 text-gray-600 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
    title="Notifications"
  >
    <!-- Bell Icon -->
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
    </svg>

    <!-- Notification Badge -->
    {#if $notifications.length > 0}
      <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
        {$notifications.length > 9 ? '9+' : $notifications.length}
      </span>
    {/if}

    <!-- Connection Status Indicator -->
    <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full {$wsConnected ? 'bg-green-400' : 'bg-red-400'}" title="{$wsConnected ? 'Connected' : 'Disconnected'}"></span>
  </button>

  <!-- Notifications Dropdown -->
  {#if showNotifications}
    <div class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Notifications</h3>
        <div class="flex items-center gap-2">
          <!-- Connection Status -->
          <div class="flex items-center gap-1 text-sm">
            <span class="w-2 h-2 rounded-full {$wsConnected ? 'bg-green-400' : 'bg-red-400'}"></span>
            <span class="text-gray-600">{$wsConnected ? 'Live' : 'Offline'}</span>
          </div>
          
          {#if $notifications.length > 0}
            <button
              on:click={clearNotifications}
              class="text-sm text-blue-600 hover:text-blue-500"
            >
              Clear all
            </button>
          {/if}
        </div>
      </div>

      <!-- Notifications List -->
      <div class="max-h-80 overflow-y-auto">
        {#if $notifications.length === 0}
          <div class="p-4 text-center text-gray-500">
            No notifications yet
          </div>
        {:else}
          {#each $notifications.slice(0, 10) as notification (notification.timestamp)}
            <div class="p-3 border-b border-gray-100 last:border-b-0 {getNotificationColor(notification)}">
              <div class="text-sm">
                {formatNotificationMessage(notification)}
              </div>
              <div class="text-xs text-gray-500 mt-1">
                {formatTime(notification.timestamp)}
              </div>
            </div>
          {/each}
          
          {#if $notifications.length > 10}
            <div class="p-2 text-center text-sm text-gray-500">
              ... and {$notifications.length - 10} more
            </div>
          {/if}
        {/if}
      </div>
    </div>
  {/if}
</div>

<!-- Click outside to close -->
{#if showNotifications}
  <div 
    class="fixed inset-0 z-40"
    on:click={() => showNotifications = false}
  ></div>
{/if}