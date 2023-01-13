import { useState, useEffect } from "react";
import * as React from "react";
import { Box, Button, Table, TextFilter, Modal, SpaceBetween, Container, Alert, Textarea, Link,Pagination, StatusIndicator} from '@cloudscape-design/components';
import { COLUMN_DEFINITIONS, DEFAULT_PREFERENCES, Preferences } from './task-list-config';
import { useLocalStorage } from '../common/localStorage.js';
import { useColumnWidths } from './commons/use-column-widths';
import { TableHeader } from './commons/common-components';
import { TaskDetail } from './task-detail';

const ACCURACY_EVAL_SERVICE_URL = process.env.REACT_APP_ACCURACY_EVAL_SERVICE_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

function TaskList ({onTaskCreate, onItemClick, onSelectionChange}) {


  const [items, setItems] = useState([]);

  const [selectedItems, setSelectedItems ] = useState([]);
  const [loadedFlag, setLoadedFlag ] = useState(false);
  const [columnDefinitions, saveWidths] = useColumnWidths('React-Table-Widths', COLUMN_DEFINITIONS);

  const [showDetail, setShowDetail] = useState(false); 

  useEffect(() => {
    if (items.length === 0 && !loadedFlag) {
      
      fetch(ACCURACY_EVAL_SERVICE_URL + 'task/tasks', {
        method: 'GET',
        headers: {
           'Content-type': 'application/json; charset=UTF-8',
           'x-api-key': API_KEY
        },
        })
        .then((response) => response.json())
        .then((data) => {
            var resp = JSON.parse(data.body)
            setItems(resp);
            setLoadedFlag(true);
        })
        .catch((err) => {
          setLoadedFlag(true);
          console.log(err.message);
        });
      
    }
  })

  const handleViewDetail = e => {
    const id = e.detail.target;
    setSelectedItems([items.find(i =>i.id == id)]);
    setShowDetail(true);
  }

  const handleBackToList = e => {
    setShowDetail(false);
  }

    return (
      <div> <br/>
      {showDetail?<TaskDetail selectedTask={selectedItems[0]} onBack={handleBackToList} />:
        <Table
        onSelectionChange={({ detail }) =>
          setSelectedItems(detail.selectedItems)
        }
        selectedItems={selectedItems}
        ariaLabels={{
          selectionGroupLabel: "Items selection",
          allItemsSelectionLabel: ({ selectedItems }) =>
            `${selectedItems.length} ${
              selectedItems.length === 1 ? "item" : "items"
            } selected`,
          itemSelectionLabel: ({ selectedItems }, item) => {
            const isItemSelected = selectedItems.filter(
              i => i.name === item.name
            ).length;
            return `${item.name} is ${
              isItemSelected ? "" : "not"
            } selected`;
          }
        }}
          columnDefinitions={[
            {
              id: 'name',
              sortingField: 'name',
              header: 'Task name',
              cell: item => (
                <Link variant="primary" target={item.id} onFollow={handleViewDetail}>{item.name}</Link>
              ),
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
            }
          ]}
        items={items}
        loadingText="Loading tasks"
        selectionType="single"
        trackBy="name"
        empty={
          <Box textAlign="center" color="inherit">
            <b>No evaluation tasks</b>
            <Box
              padding={{ bottom: "s" }}
              variant="p"
              color="inherit"
            >
              No task to display.
            </Box>
            <Button>Create task</Button>
          </Box>
        }
        filter={
          <TextFilter
            filteringPlaceholder="Find resources"
            filteringText=""
          />
        }
        header={
          <TableHeader
          variant="awsui-h1-sticky"
          title="Accuracy evaluation tasks"
          actionButtons={
            <SpaceBetween size="xs" direction="horizontal">
              <Button onClick={handleViewDetail} disabled={selectedItems.length === 0} >View details</Button> 
              {/* <Button disabled={!isOnlyOneSelected}>Edit</Button>
              <Button disabled={props.selectedItems.length === 0}>Delete</Button>*/}
              <Button variant="primary" onClick={onTaskCreate}>Create a new task</Button>
            </SpaceBetween>
          }
        />
        }
        pagination={
          <Pagination
            currentPageIndex={1}
            pagesCount={2}
            ariaLabels={{
              nextPageLabel: "Next page",
              previousPageLabel: "Previous page",
              pageLabel: pageNumber =>
                `Page ${pageNumber} of all pages`
            }}
          />
        }
        />}
    </div>
  );
}

export {TaskList};