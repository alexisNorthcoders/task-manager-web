export const GET_TASKS = `
  query GetTasks {
    tasks {
      id
      title
      description
      completed
      status
      dueDate
      estimationHours
      createdAt
      updatedAt
      assignedUsers {
        id
        username
        firstName
        lastName
      }
    }
  }
`;

export const GET_TASK = `
  query GetTask($id: ID!) {
    task(id: $id) {
      id
      title
      description
      completed
      status
      dueDate
      estimationHours
      createdAt
      updatedAt
      assignedUsers {
        id
        username
        firstName
        lastName
        email
        role
      }
    }
  }
`;

export const CREATE_TASK = `
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      description
      completed
      status
      dueDate
      estimationHours
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_TASK = `
  mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) {
      id
      title
      description
      completed
      status
      dueDate
      estimationHours
      updatedAt
    }
  }
`;

export const DELETE_TASK = `
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

export const GET_USERS = `
  query GetUsers {
    users {
      id
      username
      email
      firstName
      lastName
      role
      createdAt
    }
  }
`;

export const ASSIGN_USERS_TO_TASK = `
  mutation AssignUsersToTask($taskId: ID!, $userIds: [ID!]!) {
    assignUsersToTask(taskId: $taskId, userIds: $userIds) {
      id
      title
      assignedUsers {
        id
        username
        firstName
        lastName
        email
        role
      }
    }
  }
`;

export const UNASSIGN_USERS_FROM_TASK = `
  mutation UnassignUsersFromTask($taskId: ID!, $userIds: [ID!]!) {
    unassignUsersFromTask(taskId: $taskId, userIds: $userIds) {
      id
      title
      assignedUsers {
        id
        username
        firstName
        lastName
        email
        role
      }
    }
  }
`;

// Phase 1 - Bulk Operations
export const BULK_UPDATE_TASKS = `
  mutation BulkUpdateTasks($taskIds: [ID!]!, $input: BulkUpdateTaskInput!) {
    bulkUpdateTasks(taskIds: $taskIds, input: $input) {
      success
      updatedCount
      errors
    }
  }
`;

export const BULK_DELETE_TASKS = `
  mutation BulkDeleteTasks($taskIds: [ID!]!) {
    bulkDeleteTasks(taskIds: $taskIds) {
      success
      updatedCount
      errors
    }
  }
`;

export const BULK_ASSIGN_USERS = `
  mutation BulkAssignUsers($taskIds: [ID!]!, $userIds: [ID!]!) {
    bulkAssignUsers(taskIds: $taskIds, userIds: $userIds) {
      success
      updatedCount
      errors
    }
  }
`;

// Phase 1 - Task Templates
export const GET_TASK_TEMPLATES = `
  query GetTaskTemplates {
    taskTemplates {
      id
      name
      title
      description
      estimationHours
      createdAt
      updatedAt
    }
  }
`;

export const GET_TASK_TEMPLATE = `
  query GetTaskTemplate($id: ID!) {
    taskTemplate(id: $id) {
      id
      name
      title
      description
      estimationHours
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_TASK_TEMPLATE = `
  mutation CreateTaskTemplate($input: CreateTaskTemplateInput!) {
    createTaskTemplate(input: $input) {
      id
      name
      title
      description
      estimationHours
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_TASK_TEMPLATE = `
  mutation UpdateTaskTemplate($id: ID!, $input: UpdateTaskTemplateInput!) {
    updateTaskTemplate(id: $id, input: $input) {
      id
      name
      title
      description
      estimationHours
      updatedAt
    }
  }
`;

export const DELETE_TASK_TEMPLATE = `
  mutation DeleteTaskTemplate($id: ID!) {
    deleteTaskTemplate(id: $id)
  }
`;

export const CREATE_TASK_FROM_TEMPLATE = `
  mutation CreateTaskFromTemplate($templateId: ID!, $assignedUserIds: [ID!]) {
    createTaskFromTemplate(templateId: $templateId, assignedUserIds: $assignedUserIds) {
      id
      title
      description
      completed
      status
      dueDate
      estimationHours
      createdAt
      updatedAt
      assignedUsers {
        id
        username
        firstName
        lastName
      }
    }
  }
`;