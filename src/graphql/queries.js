/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getTask = /* GraphQL */ `
  query GetTask($id: ID!) {
    getTask(id: $id) {
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
export const listTasks = /* GraphQL */ `
  query ListTasks(
    $filter: ModelTaskFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTasks(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
    }
  }
`;
