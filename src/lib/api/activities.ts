import { apiClient } from './client';
import type { TaskActivity } from '$lib/types';

const GET_TASK_ACTIVITIES = `
  query GetTaskActivities($taskId: ID!) {
    taskActivities(taskId: $taskId) {
      id
      activityType
      description
      oldValue
      newValue
      createdAt
      user {
        id
        username
        firstName
        lastName
      }
    }
  }
`;

export async function getTaskActivities(taskId: string): Promise<TaskActivity[]> {
  const response = await apiClient.request(GET_TASK_ACTIVITIES, { taskId });
  return response.taskActivities;
}
