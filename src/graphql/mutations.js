/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createTask = /* GraphQL */ `
  mutation CreateTask(
    $input: CreateTaskInput!
    $condition: ModelTaskConditionInput
  ) {
    createTask(input: $input, condition: $condition) {
      id
      name
      description
      created_by
      created_ts
      last_update_ts
      source_s3_bucket
      source_s3_prefix
      status
      moderation_result_table
      a2i_workflow_arn
      a2i_portal_url
      createdAt
      updatedAt
    }
  }
`;
export const updateTask = /* GraphQL */ `
  mutation UpdateTask(
    $input: UpdateTaskInput!
    $condition: ModelTaskConditionInput
  ) {
    updateTask(input: $input, condition: $condition) {
      id
      name
      description
      created_by
      created_ts
      last_update_ts
      source_s3_bucket
      source_s3_prefix
      status
      moderation_result_table
      a2i_workflow_arn
      a2i_portal_url
      createdAt
      updatedAt
    }
  }
`;
export const deleteTask = /* GraphQL */ `
  mutation DeleteTask(
    $input: DeleteTaskInput!
    $condition: ModelTaskConditionInput
  ) {
    deleteTask(input: $input, condition: $condition) {
      id
      name
      description
      created_by
      created_ts
      last_update_ts
      source_s3_bucket
      source_s3_prefix
      status
      moderation_result_table
      a2i_workflow_arn
      a2i_portal_url
      createdAt
      updatedAt
    }
  }
`;
