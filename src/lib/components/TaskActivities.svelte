<script lang="ts">
  import type { TaskActivity, ActivityType } from '$lib/types';

  export let activities: TaskActivity[] = [];

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  function getActivityIcon(activityType: ActivityType): string {
    switch (activityType) {
      case 'TASK_CREATED':
        return '✨';
      case 'TASK_UPDATED':
        return '✏️';
      case 'TASK_DELETED':
        return '🗑️';
      case 'TASK_ASSIGNED':
        return '👥';
      case 'TASK_UNASSIGNED':
        return '👤';
      case 'TASK_STATUS_CHANGED':
        return '🔄';
      case 'TASK_DUE_DATE_CHANGED':
        return '📅';
      case 'TASK_ESTIMATION_CHANGED':
        return '⏱️';
      case 'COMMENT_ADDED':
        return '💬';
      case 'COMMENT_UPDATED':
        return '✏️';
      case 'COMMENT_DELETED':
        return '🗑️';
      case 'ATTACHMENT_ADDED':
        return '📎';
      case 'ATTACHMENT_DELETED':
        return '🗑️';
      default:
        return '📝';
    }
  }

  function getActivityColor(activityType: ActivityType): string {
    switch (activityType) {
      case 'TASK_CREATED':
        return 'text-green-600 bg-green-50';
      case 'TASK_UPDATED':
        return 'text-blue-600 bg-blue-50';
      case 'TASK_DELETED':
        return 'text-red-600 bg-red-50';
      case 'TASK_ASSIGNED':
        return 'text-purple-600 bg-purple-50';
      case 'TASK_UNASSIGNED':
        return 'text-orange-600 bg-orange-50';
      case 'TASK_STATUS_CHANGED':
        return 'text-indigo-600 bg-indigo-50';
      case 'TASK_DUE_DATE_CHANGED':
        return 'text-yellow-600 bg-yellow-50';
      case 'TASK_ESTIMATION_CHANGED':
        return 'text-pink-600 bg-pink-50';
      case 'COMMENT_ADDED':
        return 'text-cyan-600 bg-cyan-50';
      case 'COMMENT_UPDATED':
        return 'text-blue-600 bg-blue-50';
      case 'COMMENT_DELETED':
        return 'text-red-600 bg-red-50';
      case 'ATTACHMENT_ADDED':
        return 'text-emerald-600 bg-emerald-50';
      case 'ATTACHMENT_DELETED':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  }

  function formatActivityDescription(activity: TaskActivity): string {
    let description = activity.description;
    
    if (activity.oldValue && activity.newValue) {
      description += ` (${activity.oldValue} → ${activity.newValue})`;
    } else if (activity.oldValue) {
      description += ` (was: ${activity.oldValue})`;
    } else if (activity.newValue) {
      description += ` (now: ${activity.newValue})`;
    }
    
    return description;
  }
</script>

<div class="space-y-4">
  <h3 class="text-lg font-medium text-gray-900 mb-4">Activity Timeline</h3>
  
  {#if activities.length === 0}
    <div class="text-center py-8 text-gray-500">
      <p>No activity yet.</p>
    </div>
  {:else}
    <div class="flow-root">
      <ul class="-mb-8">
        {#each activities as activity, index (activity.id)}
          <li>
            <div class="relative pb-8">
              {#if index !== activities.length - 1}
                <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
              {/if}
              
              <div class="relative flex space-x-3">
                <!-- Icon -->
                <div class="flex-shrink-0">
                  <div class="h-8 w-8 rounded-full flex items-center justify-center {getActivityColor(activity.activityType)}">
                    <span class="text-sm">{getActivityIcon(activity.activityType)}</span>
                  </div>
                </div>
                
                <!-- Content -->
                <div class="min-w-0 flex-1">
                  <div class="bg-white rounded-lg border border-gray-200 p-4">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-1">
                          <p class="text-sm font-medium text-gray-900">
                            {activity.user.firstName} {activity.user.lastName}
                          </p>
                          <span class="text-xs text-gray-500">
                            @{activity.user.username}
                          </span>
                        </div>
                        
                        <p class="text-sm text-gray-700">
                          {formatActivityDescription(activity)}
                        </p>
                        
                        {#if activity.oldValue && activity.newValue}
                          <div class="mt-2 flex items-center space-x-2 text-xs">
                            <span class="px-2 py-1 bg-red-100 text-red-800 rounded">
                              {activity.oldValue}
                            </span>
                            <span class="text-gray-400">→</span>
                            <span class="px-2 py-1 bg-green-100 text-green-800 rounded">
                              {activity.newValue}
                            </span>
                          </div>
                        {/if}
                      </div>
                      
                      <div class="flex-shrink-0">
                        <time class="text-xs text-gray-500">
                          {formatDate(activity.createdAt)}
                        </time>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>
