/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateTask = /* GraphQL */ `
  subscription OnCreateTask($filter: ModelSubscriptionTaskFilterInput) {
    onCreateTask(filter: $filter) {
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
export const onUpdateTask = /* GraphQL */ `
  subscription OnUpdateTask($filter: ModelSubscriptionTaskFilterInput) {
    onUpdateTask(filter: $filter) {
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
export const onDeleteTask = /* GraphQL */ `
  subscription OnDeleteTask($filter: ModelSubscriptionTaskFilterInput) {
    onDeleteTask(filter: $filter) {
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
