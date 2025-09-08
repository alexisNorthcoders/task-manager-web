export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate?: string;
  estimationHours?: number;
  createdAt: string;
  updatedAt: string;
  assignedUsers: User[];
}

export interface AuthResponse {
  token: string;
  type: string;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate?: string;
  estimationHours?: number;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  completed?: boolean;
  status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate?: string;
  estimationHours?: number;
}

export interface RegisterInput {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

// Phase 1 new types
export interface TaskTemplate {
  id: string;
  name: string;
  title: string;
  description?: string;
  estimationHours?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskTemplateInput {
  name: string;
  title: string;
  description?: string;
  estimationHours?: number;
}

export interface UpdateTaskTemplateInput {
  name?: string;
  title?: string;
  description?: string;
  estimationHours?: number;
}

export interface BulkOperationResult {
  success: boolean;
  updatedCount: number;
  errors: string[];
}

export interface BulkUpdateTaskInput {
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
  completed?: boolean;
  assignedUserIds?: string[];
  dueDate?: string;
}

// WebSocket notification types
export interface WebSocketNotification {
  type: 'TASK_CREATED' | 'TASK_UPDATED' | 'TASK_DELETED' | 'BULK_OPERATION' | 'TASK_ASSIGNED' | 'USER_PRESENCE';
  task?: Task;
  taskId?: string;
  operation?: string;
  count?: number;
  username?: string;
  isOnline?: boolean;
  timestamp: number;
}