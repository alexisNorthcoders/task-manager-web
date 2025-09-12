import { apiClient } from './client';
import type { TaskComment, CreateTaskCommentInput, UpdateTaskCommentInput } from '$lib/types';

const GET_TASK_COMMENTS = `
  query GetTaskComments($taskId: ID!) {
    taskComments(taskId: $taskId) {
      id
      content
      createdAt
      updatedAt
      author {
        id
        username
        firstName
        lastName
      }
      parentComment {
        id
      }
      replies {
        id
        content
        createdAt
        updatedAt
        author {
          id
          username
          firstName
          lastName
        }
      }
    }
  }
`;

const GET_TASK_COMMENT = `
  query GetTaskComment($id: ID!) {
    taskComment(id: $id) {
      id
      content
      createdAt
      updatedAt
      author {
        id
        username
        firstName
        lastName
      }
      parentComment {
        id
      }
      replies {
        id
        content
        createdAt
        updatedAt
        author {
          id
          username
          firstName
          lastName
        }
      }
    }
  }
`;

const CREATE_TASK_COMMENT = `
  mutation CreateTaskComment($input: CreateTaskCommentInput!) {
    createTaskComment(input: $input) {
      id
      content
      createdAt
      updatedAt
      author {
        id
        username
        firstName
        lastName
      }
      parentComment {
        id
      }
      replies {
        id
        content
        createdAt
        updatedAt
        author {
          id
          username
          firstName
          lastName
        }
      }
    }
  }
`;

const UPDATE_TASK_COMMENT = `
  mutation UpdateTaskComment($id: ID!, $input: UpdateTaskCommentInput!) {
    updateTaskComment(id: $id, input: $input) {
      id
      content
      createdAt
      updatedAt
      author {
        id
        username
        firstName
        lastName
      }
      parentComment {
        id
      }
      replies {
        id
        content
        createdAt
        updatedAt
        author {
          id
          username
          firstName
          lastName
        }
      }
    }
  }
`;

const DELETE_TASK_COMMENT = `
  mutation DeleteTaskComment($id: ID!) {
    deleteTaskComment(id: $id)
  }
`;

export async function getTaskComments(taskId: string): Promise<TaskComment[]> {
  const response = await apiClient.request(GET_TASK_COMMENTS, { taskId });
  return response.taskComments;
}

export async function getTaskComment(id: string): Promise<TaskComment> {
  const response = await apiClient.request(GET_TASK_COMMENT, { id });
  return response.taskComment;
}

export async function createTaskComment(input: CreateTaskCommentInput): Promise<TaskComment> {
  const response = await apiClient.request(CREATE_TASK_COMMENT, { input });
  return response.createTaskComment;
}

export async function updateTaskComment(id: string, input: UpdateTaskCommentInput): Promise<TaskComment> {
  const response = await apiClient.request(UPDATE_TASK_COMMENT, { id, input });
  return response.updateTaskComment;
}

export async function deleteTaskComment(id: string): Promise<boolean> {
  const response = await apiClient.request(DELETE_TASK_COMMENT, { id });
  return response.deleteTaskComment;
}
