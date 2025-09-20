<script lang="ts">
  import { auth } from '$lib/stores/auth';

  function getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
</script>

<div class="bg-white rounded-lg shadow-sm border border-gray-200">
  <div class="px-6 py-4 border-b border-gray-200">
    <h2 class="text-lg font-semibold text-gray-900">Profile Information</h2>
    <p class="text-sm text-gray-600 mt-1">Your account details</p>
  </div>

  <div class="p-6">
    <div class="flex items-center space-x-4">
      <!-- Avatar -->
      <div class="flex-shrink-0">
        {#if $auth.user?.avatarUrl}
          <img
            src={$auth.user.avatarUrl}
            alt="User avatar"
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

      <!-- User Info -->
      <div class="flex-1">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="first-name" class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <div id="first-name" class="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded border">
              {$auth.user?.firstName || 'Not provided'}
            </div>
          </div>

          <div>
            <label for="last-name" class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <div id="last-name" class="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded border">
              {$auth.user?.lastName || 'Not provided'}
            </div>
          </div>

          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <div id="username" class="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded border">
              {$auth.user?.username}
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div id="email" class="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded border">
              {$auth.user?.email}
            </div>
          </div>

          <div>
            <label for="role" class="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <div id="role" class="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded border">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {$auth.user?.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}">
                {$auth.user?.role}
              </span>
            </div>
          </div>

          <div>
            <label for="member-since" class="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
            <div id="member-since" class="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded border">
              {new Date($auth.user?.createdAt || '').toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 pt-6 border-t border-gray-200">
      <p class="text-sm text-gray-500">
        <strong>Note:</strong> To update your profile information, please contact your administrator.
      </p>
    </div>
  </div>
</div>
