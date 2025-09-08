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