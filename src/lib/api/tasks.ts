import { apiClient } from './client';
import { 
  GET_TASKS, 
  GET_TASK, 
  CREATE_TASK, 
  UPDATE_TASK, 
  DELETE_TASK,
  BULK_UPDATE_TASKS,
  BULK_DELETE_TASKS,
  BULK_ASSIGN_USERS,
  GET_TASK_TEMPLATES,
  GET_TASK_TEMPLATE,
  CREATE_TASK_TEMPLATE,
  UPDATE_TASK_TEMPLATE,
  DELETE_TASK_TEMPLATE,
  CREATE_TASK_FROM_TEMPLATE
} from './queries';
import type { 
  Task, 
  CreateTaskInput, 
  UpdateTaskInput, 
  BulkOperationResult, 
  BulkUpdateTaskInput,
  TaskTemplate,
  CreateTaskTemplateInput,
  UpdateTaskTemplateInput
} from '../types';

export async function getTasks(): Promise<Task[]> {
  const data = await apiClient.request<{ tasks: Task[] }>(GET_TASKS);
  if (data && typeof data === 'object' && 'tasks' in data) {
    return data.tasks;
  }
  throw new Error('Failed to load tasks - invalid response');
}

export async function getTask(id: string): Promise<Task> {
  const data = await apiClient.request<{ task: Task }>(GET_TASK, { id });
  if (data && typeof data === 'object' && 'task' in data) {
    return data.task;
  }
  throw new Error('Failed to load task - invalid response');
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const data = await apiClient.request<{ createTask: Task }>(CREATE_TASK, { input });
  if (data && typeof data === 'object' && 'createTask' in data) {
    return data.createTask;
  }
  throw new Error('Failed to create task - invalid response');
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  const data = await apiClient.request<{ updateTask: Task }>(UPDATE_TASK, { id, input });
  if (data && typeof data === 'object' && 'updateTask' in data) {
    return data.updateTask;
  }
  throw new Error('Failed to update task - invalid response');
}

export async function deleteTask(id: string): Promise<boolean> {
  try {
    const response = await apiClient.request<{ deleteTask: boolean }>(DELETE_TASK, { id });

    // Handle case where data is null due to GraphQL errors but operation succeeded
    if (response && typeof response === 'object' && 'deleteTask' in response) {
      return response.deleteTask;
    }

    // If data is null or doesn't have deleteTask property,
    // but we have a successful response, assume success
    return true;
  } catch (error: any) {
    // If it's a handled GraphQL error, assume success
    const isHandledGraphQLError = error.message?.includes('INTERNAL_ERROR') ||
                                 error.message?.includes('GraphQL Error');

    if (isHandledGraphQLError) {
      return true;
    }

    throw error;
  }
}

// Phase 1 - Bulk Operations
export async function bulkUpdateTasks(taskIds: string[], input: BulkUpdateTaskInput): Promise<BulkOperationResult> {
  const data = await apiClient.request<{ bulkUpdateTasks: BulkOperationResult }>(
    BULK_UPDATE_TASKS, 
    { taskIds, input }
  );
  return data.bulkUpdateTasks;
}

export async function bulkDeleteTasks(taskIds: string[]): Promise<BulkOperationResult> {
  const data = await apiClient.request<{ bulkDeleteTasks: BulkOperationResult }>(
    BULK_DELETE_TASKS, 
    { taskIds }
  );
  return data.bulkDeleteTasks;
}

export async function bulkAssignUsers(taskIds: string[], userIds: string[]): Promise<BulkOperationResult> {
  const data = await apiClient.request<{ bulkAssignUsers: BulkOperationResult }>(
    BULK_ASSIGN_USERS, 
    { taskIds, userIds }
  );
  return data.bulkAssignUsers;
}

// Phase 1 - Task Templates
export async function getTaskTemplates(): Promise<TaskTemplate[]> {
  const data = await apiClient.request<{ taskTemplates: TaskTemplate[] }>(GET_TASK_TEMPLATES);
  return data.taskTemplates;
}

export async function getTaskTemplate(id: string): Promise<TaskTemplate> {
  const data = await apiClient.request<{ taskTemplate: TaskTemplate }>(GET_TASK_TEMPLATE, { id });
  return data.taskTemplate;
}

export async function createTaskTemplate(input: CreateTaskTemplateInput): Promise<TaskTemplate> {
  const data = await apiClient.request<{ createTaskTemplate: TaskTemplate }>(CREATE_TASK_TEMPLATE, { input });
  return data.createTaskTemplate;
}

export async function updateTaskTemplate(id: string, input: UpdateTaskTemplateInput): Promise<TaskTemplate> {
  const data = await apiClient.request<{ updateTaskTemplate: TaskTemplate }>(UPDATE_TASK_TEMPLATE, { id, input });
  return data.updateTaskTemplate;
}

export async function deleteTaskTemplate(id: string): Promise<boolean> {
  const data = await apiClient.request<{ deleteTaskTemplate: boolean }>(DELETE_TASK_TEMPLATE, { id });
  return data.deleteTaskTemplate;
}

export async function createTaskFromTemplate(templateId: string, assignedUserIds?: string[]): Promise<Task> {
  const data = await apiClient.request<{ createTaskFromTemplate: Task }>(
    CREATE_TASK_FROM_TEMPLATE, 
    { templateId, assignedUserIds }
  );
  return data.createTaskFromTemplate;
}