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