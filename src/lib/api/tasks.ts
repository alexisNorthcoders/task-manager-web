import { apiClient } from './client';
import { GET_TASKS, GET_TASK, CREATE_TASK, UPDATE_TASK, DELETE_TASK } from './queries';
import type { Task, CreateTaskInput, UpdateTaskInput } from '../types';

export async function getTasks(): Promise<Task[]> {
  const data = await apiClient.request<{ tasks: Task[] }>(GET_TASKS);
  return data.tasks;
}

export async function getTask(id: string): Promise<Task> {
  const data = await apiClient.request<{ task: Task }>(GET_TASK, { id });
  return data.task;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const data = await apiClient.request<{ createTask: Task }>(CREATE_TASK, { input });
  return data.createTask;
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  const data = await apiClient.request<{ updateTask: Task }>(UPDATE_TASK, { id, input });
  return data.updateTask;
}

export async function deleteTask(id: string): Promise<boolean> {
  const data = await apiClient.request<{ deleteTask: boolean }>(DELETE_TASK, { id });
  return data.deleteTask;
}