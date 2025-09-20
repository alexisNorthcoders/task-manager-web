export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
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
  comments: TaskComment[];
  activities: TaskActivity[];
  attachments: TaskAttachment[];
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

export interface UpdatePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateAvatarInput {
  avatarUrl: string;
}

export interface UploadAvatarResponse {
  avatarUrl: string;
  message: string;
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

// Phase 2 new types
export interface TaskComment {
  id: string;
  task: Task;
  author: User;
  content: string;
  parentComment?: TaskComment;
  createdAt: string;
  updatedAt: string;
  replies: TaskComment[];
}

export interface TaskActivity {
  id: string;
  task: Task;
  user: User;
  activityType: ActivityType;
  description: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}

export interface TaskAttachment {
  id: string;
  task: Task;
  uploader: User;
  filename: string;
  originalFilename: string;
  contentType: string;
  fileSize: number;
  filePath: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  isImage: boolean;
  fileSizeFormatted: string;
}

export interface TaskAttachmentResponse {
  id: string;
  filename: string;
  originalFilename: string;
  contentType: string;
  fileSize: number;
  filePath: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  isImage: boolean;
  fileSizeFormatted: string;
  uploaderUsername: string;
  uploaderFirstName: string;
  uploaderLastName: string;
}

export type ActivityType = 
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'TASK_DELETED'
  | 'TASK_ASSIGNED'
  | 'TASK_UNASSIGNED'
  | 'TASK_STATUS_CHANGED'
  | 'TASK_DUE_DATE_CHANGED'
  | 'TASK_ESTIMATION_CHANGED'
  | 'COMMENT_ADDED'
  | 'COMMENT_UPDATED'
  | 'COMMENT_DELETED'
  | 'ATTACHMENT_ADDED'
  | 'ATTACHMENT_DELETED';

export interface CreateTaskCommentInput {
  taskId: string;
  content: string;
  parentCommentId?: string;
}

export interface UpdateTaskCommentInput {
  content: string;
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