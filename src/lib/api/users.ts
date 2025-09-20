import { apiClient } from './client';
import { GET_USERS, ASSIGN_USERS_TO_TASK, UNASSIGN_USERS_FROM_TASK, UPDATE_USER_PASSWORD, UPDATE_USER_AVATAR, GET_CURRENT_USER } from './queries';
import type { User, Task, UpdatePasswordInput, UpdateAvatarInput, UploadAvatarResponse } from '../types';

export async function getUsers(): Promise<User[]> {
  const data = await apiClient.request<{ users: User[] }>(GET_USERS);
  return data.users;
}

export async function assignUsersToTask(taskId: string, userIds: string[]): Promise<Task> {
  const data = await apiClient.request<{ assignUsersToTask: Task }>(
    ASSIGN_USERS_TO_TASK, 
    { taskId, userIds }
  );
  return data.assignUsersToTask;
}

export async function unassignUsersFromTask(taskId: string, userIds: string[]): Promise<Task> {
  const data = await apiClient.request<{ unassignUsersFromTask: Task }>(
    UNASSIGN_USERS_FROM_TASK,
    { taskId, userIds }
  );
  return data.unassignUsersFromTask;
}

export async function updateUserPassword(input: UpdatePasswordInput): Promise<User> {
  const data = await apiClient.request<{ updateUserPassword: User }>(
    UPDATE_USER_PASSWORD,
    { currentPassword: input.currentPassword, newPassword: input.newPassword }
  );
  return data.updateUserPassword;
}

export async function updateUserAvatar(input: UpdateAvatarInput): Promise<User> {
  const data = await apiClient.request<{ updateUserAvatar: User }>(
    UPDATE_USER_AVATAR,
    { avatarUrl: input.avatarUrl }
  );
  return data.updateUserAvatar;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const data = await apiClient.request<{ currentUser: User }>(GET_CURRENT_USER);
    return data.currentUser;
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    return null;
  }
}

export async function uploadAvatar(file: File): Promise<UploadAvatarResponse> {
  const formData = new FormData();
  formData.append('avatar', file);

  return apiClient.uploadFile('user/avatar', formData);
}