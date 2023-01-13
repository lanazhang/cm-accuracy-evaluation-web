// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import { CollectionPreferences, StatusIndicator, Link } from '@cloudscape-design/components';
import { addColumnSortLabels } from '../common/labels';

export const COLUMN_DEFINITIONS = addColumnSortLabels([
  {
    id: 'name',
    sortingField: 'name',
    header: 'Task name',
    cell: item => item.name,
    minWidth: 180,
  },
  {
    id: 'status',
    sortingField: 'status',
    header: 'Status',
    cell: item => (
      <StatusIndicator type={item.status === 'COMPLETED' ? 'success' : item.status === 'FAILED'? 'error': 'info' }>{item.status}</StatusIndicator>
    ),
    minWidth: 120,
  },
  {
    id: 'created_by',
    sortingField: 'created_by',
    cell: item => item.created_by,
    header: 'Created by',
    minWidth: 160,
  },
  {
    id: 'created_ts',
    sortingField: 'created_ts',
    cell: item => item.created_ts,
    header: 'Created at',
    minWidth: 160,
  },]);

const VISIBLE_CONTENT_OPTIONS = [
  {
    label: 'Evaluation task',
    options: [
      { id: 'name', label: 'Task name', editable: false },
      { id: 'status', label: 'Status' },
      { id: 'created_by', label: 'Created by' },
      { id: 'created_ts', label: 'Created at' },
    ],
  },
];

export const PAGE_SIZE_OPTIONS = [
  { value: 10, label: '10 Tasks' },
  { value: 30, label: '30 Tasks' },
  { value: 50, label: '50 Tasks' },
];

export const DEFAULT_PREFERENCES = {
  pageSize: 30,
  visibleContent: ['name', 'status', 'created_by', 'created_ts'],
  wrapLines: false,
  stripedRows: false,
};
