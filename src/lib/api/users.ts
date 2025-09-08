import { apiClient } from './client';
import { GET_USERS, ASSIGN_USERS_TO_TASK, UNASSIGN_USERS_FROM_TASK } from './queries';
import type { User, Task } from '../types';

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