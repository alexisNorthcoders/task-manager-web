import { apiClient } from './client';
import type { TaskAttachment, TaskAttachmentResponse } from '$lib/types';

const GET_TASK_ATTACHMENTS = `
  query GetTaskAttachments($taskId: ID!) {
    taskAttachments(taskId: $taskId) {
      id
      filename
      originalFilename
      contentType
      fileSize
      filePath
      description
      createdAt
      updatedAt
      isImage
      fileSizeFormatted
      uploader {
        id
        username
        firstName
        lastName
      }
    }
  }
`;

const GET_TASK_IMAGES = `
  query GetTaskImages($taskId: ID!) {
    taskImages(taskId: $taskId) {
      id
      filename
      originalFilename
      contentType
      fileSize
      filePath
      description
      createdAt
      updatedAt
      isImage
      fileSizeFormatted
      uploader {
        id
        username
        firstName
        lastName
      }
    }
  }
`;

const GET_TASK_ATTACHMENT = `
  query GetTaskAttachment($id: ID!) {
    taskAttachment(id: $id) {
      id
      filename
      originalFilename
      contentType
      fileSize
      filePath
      description
      createdAt
      updatedAt
      isImage
      fileSizeFormatted
      uploader {
        id
        username
        firstName
        lastName
      }
    }
  }
`;

const DELETE_TASK_ATTACHMENT = `
  mutation DeleteTaskAttachment($id: ID!) {
    deleteTaskAttachment(id: $id)
  }
`;

export async function getTaskAttachments(taskId: string): Promise<TaskAttachment[]> {
  const response = await apiClient.request(GET_TASK_ATTACHMENTS, { taskId });
  return response.taskAttachments;
}

export async function getTaskImages(taskId: string): Promise<TaskAttachment[]> {
  const response = await apiClient.request(GET_TASK_IMAGES, { taskId });
  return response.taskImages;
}

export async function getTaskAttachment(id: string): Promise<TaskAttachment> {
  const response = await apiClient.request(GET_TASK_ATTACHMENT, { id });
  return response.taskAttachment;
}

export async function deleteTaskAttachment(id: string): Promise<boolean> {
  const response = await apiClient.request(DELETE_TASK_ATTACHMENT, { id });
  return response.deleteTaskAttachment;
}

export async function uploadAttachment(
  taskId: string, 
  file: File, 
  description?: string
): Promise<TaskAttachment> {
  const formData = new FormData();
  formData.append('taskId', taskId);
  formData.append('file', file);
  if (description) {
    formData.append('description', description);
  }

  const result = await apiClient.uploadFile('attachments/upload', formData);
  const response: TaskAttachmentResponse = result.attachment;
  
  // Convert response to TaskAttachment format
  const attachment: TaskAttachment = {
    id: response.id,
    task: {} as any, // Will be populated by the parent component
    uploader: {
      id: '', // Not available in response
      username: response.uploaderUsername,
      firstName: response.uploaderFirstName,
      lastName: response.uploaderLastName,
      email: '', // Not available in response
      role: 'USER' as any, // Not available in response
      createdAt: response.createdAt
    },
    filename: response.filename,
    originalFilename: response.originalFilename,
    contentType: response.contentType,
    fileSize: response.fileSize,
    filePath: response.filePath,
    description: response.description,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
    isImage: response.isImage,
    fileSizeFormatted: response.fileSizeFormatted
  };
  
  return attachment;
}
