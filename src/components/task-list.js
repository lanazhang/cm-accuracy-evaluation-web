import { useState, useEffect } from "react";
import * as React from "react";
import { Box, Button, Table, TextFilter, Modal, SpaceBetween, Container, Alert, Textarea, Link,Pagination, StatusIndicator, Header} from '@cloudscape-design/components';
import { TaskDetail } from './task-detail';
import { TaskCreate } from "./task-create";
import { TaskReport } from './task-report';
import { TaskImages } from './task-images';

const ACCURACY_EVAL_SERVICE_URL = process.env.REACT_APP_ACCURACY_EVAL_SERVICE_URL;
const API_KEY = process.env.REACT_APP_API_KEY;
const PAGE_SIZE = 10;

function TaskList ({user, onItemClick, onSelectionChange}) {


  function getCurrentPageItems (items, curPage=null) {
    if (curPage === null) curPage = currentPageIndex;
    if (items === null || items.length === 0) return [];
    else {
      var result = [];
      items.forEach((i, index) => {
        //console.log(index, (currentPageIndex - 1) * PAGE_SIZE, currentPageIndex * PAGE_SIZE);
        if (index >= ((curPage - 1) * PAGE_SIZE) && index < curPage * PAGE_SIZE) {
          result.push(i);
        }
        return result;
      }, result)
    }
    return result;
  }
  const [currentPageIndex, setCurrentPageIndex] = React.useState(1);
  const [items, setItems] = useState([]);
  const [pageItems, setPageItems] = useState([]);
  const [isDescending, setIsDescending] = useState(false);
  const [filterText, setFilterText] = useState(null);

  const [selectedItems, setSelectedItems ] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [showDetail, setShowDetail] = useState(false); 
  const [showReport, setShowReport] = useState(false); 
  const [showImages, setShowImages] = useState(false); 
  const [loadingStatus, setLoadingStatus] = useState(null); //null, LOADING, LOADED 

  
  useEffect(() => {
    if (items.length === 0 && loadingStatus === null) {
      setLoadingStatus("LOADING");
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
            setPageItems(getCurrentPageItems(resp));
            setLoadingStatus("LOADED");
        })
        .catch((err) => {
          setLoadingStatus("LOADED");
          console.log(err.message);
        });
      
    }
  })

  const handleViewDetail = e => {
    const id = e.detail.target;
    setSelectedItems([items.find(i =>i.id == id)]);
    setShowDetail(true);
    setShowCreate(false);
  }

  const handleDeleteSubmit = e => {
    setShowDelete(false);
    var si = Object.assign({}, selectedItems[0]);
    si.status = "DELETING"
    setSelectedItems([si]);

    setLoadingStatus("LOADING");

    if (selectedItems !== null && selectedItems.length > 0) {
      fetch(ACCURACY_EVAL_SERVICE_URL + 'task/task', {
        method: 'DELETE',
        headers: {
           'Content-type': 'application/json; charset=UTF-8',
           'x-api-key': API_KEY
        },
        body: JSON.stringify({
          id: selectedItems[0].id
        }),
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.statusCode == "200")
            setItems([]);
            setPageItems([]);
            setLoadingStatus(null);
          })
        .catch((err) => {
          console.log(err.message);
        });      
    }
  }

  const handleDeleteDismiss = e => {
    setShowDelete(false);
  }

  const handleTaskCreate = e => {
    setShowCreate(true);
  }

  const handleCreateDismiss = e => {
    setShowCreate(false);
  }

  const handleBackToList = e => {
    // reload the list
    setItems([]);
    setPageItems([]);
    setSelectedItems([]);
    setShowDetail(false);
    setShowReport(false);
    setShowImages(false);
    setLoadingStatus(null);
  }

  const handleCreateSubmit = e => {
    setShowCreate(false);    
    setSelectedItems([e.task]);
    setShowDetail(true);
  }

  const handleDelete = e =>{
    setShowDelete(true);
  }

  const handleReport = e => {
    if (e.task !== undefined)
      setSelectedItems([e.task]);
    setShowReport(true);
    setShowDetail(false);
  }
  const handleImages = e => {
    if (e.task !== undefined)
      setSelectedItems([e.task]);
    setShowImages(true);
    setShowDetail(false);
}
  const handleSortingChange = e => {
    //console.log(e);
    if (items.length == 0)
      return

    let is = items.map(i=> i);
    var sortingField = e.detail.sortingColumn.sortingField;
    if (!isDescending) {
      is.sort( (a, b) => {
        if (sortingField === "total_files")
          return a[sortingField] - b[sortingField];
        if (a[sortingField] < b[sortingField]) {
          return -1;
        }
        if (a[sortingField] > b[sortingField]) {
          return 1;
        }
      });
    }
    else {
      is.reverse( (a, b) => {
        if (sortingField === "total_files")
          return a[sortingField] - b[sortingField];

        if (a[sortingField] < b[sortingField]) {
          return -1;
        }
        if (a[sortingField] > b[sortingField]) {
          return 1;
        }
      });
    }
    setIsDescending(!isDescending);
    setItems(is);
    setPageItems(getCurrentPageItems(is));
  }

const handlePaginationChange = e => {
  console.log(e);
  setCurrentPageIndex(e.detail.currentPageIndex);
  setPageItems(getCurrentPageItems(items, e.detail.currentPageIndex));
}

const handleFilterChaneg = e => {
  setFilterText(e.detail.filteringText);
  if (filterText === null || filterText.length == 0) {
    setItems(items);
    setPageItems(getCurrentPageItems(items));
  }
  else if (filterText !== null) {
    let result = []
    items.forEach((i) => {
      if (i.name.toLowerCase().includes(e.detail.filteringText.toLowerCase())) {
        result.push(i);
      }
      return result;
    }, result)
    setPageItems(getCurrentPageItems(result));
  }
}

  return (
      <div> <br/>
      {showDetail?<TaskDetail selectedTask={selectedItems.length > 0?selectedItems[0]:null} onBack={handleBackToList} onImageClick={handleImages} onReportClick={handleReport} />:
        showReport?<TaskReport selectedTask={selectedItems.length > 0?selectedItems[0]:null} onBack={handleBackToList} />:
        showImages?<TaskImages selectedTask={selectedItems.length > 0?selectedItems[0]:null} onBack={handleBackToList} />:
        <Table
          loading={loadingStatus === "LOADING"}
          loadingText="Loading tasks"
          onSortingChange={handleSortingChange}
          onSelectionChange={({ detail }) => {
            setSelectedItems(detail.selectedItems);
            }
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
                i => i.id === item.id
              ).length;
              return `${item.id} is ${
                isItemSelected ? "" : "not"
              } selected`;
            }
          }}
          columnDefinitions={[
            {
              id: 'id',
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
              minWidth: 100,
            },
            {
              id: 'total_files',
              sortingField: 'total_files',
              cell: item => parseInt(item.total_files) > 0?parseInt(item.total_files).toLocaleString('en-US'): 0,
              header: 'Total images',
              minWidth: 100,
            },
            {
              id: 'created_ts',
              sortingField: 'created_ts',
              cell: item => item.created_ts,
              header: 'Created at',
              minWidth: 100,
            },
          ]}
          items={pageItems}
          selectionType="single"
          trackBy="id"
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
              <Button onClick={handleTaskCreate}>Initiate a task</Button>
            </Box>
          }
          filter={
            <TextFilter
              filteringPlaceholder="Find tasks"
              filteringText={filterText}
              onChange={handleFilterChaneg}
            />
          }
          header={
            <Header
            variant="awsui-h1-sticky"
            title="Accuracy evaluation tasks"
            actions={
              <SpaceBetween size="xs" direction="horizontal">
                {/* <Button disabled={!isOnlyOneSelected}>Edit</Button>*/}
                <Button onClick={handleReport} disabled={selectedItems.length === 0 || selectedItems[0].status !== "COMPLETED"} >Check report</Button>
                <Button onClick={handleImages} disabled={selectedItems.length === 0 || selectedItems[0].status !== "COMPLETED"}>Review images</Button>
                <Button onClick={handleDelete} disabled={selectedItems.length === 0 || selectedItems[0].status == "MODERATING"}>Delete task</Button>
                <Button variant="primary" onClick={handleTaskCreate}>Initiate a task</Button>
              </SpaceBetween>
            }
          />
          }
          pagination={
            <Pagination
              currentPageIndex={currentPageIndex}
              onChange={handlePaginationChange}
              pagesCount={items !== null?Math.ceil(items.length/PAGE_SIZE,0): 1}
              ariaLabels={{
                nextPageLabel: "Next page",
                previousPageLabel: "Previous page",
                pageLabel: pageNumber =>
                  `Page ${pageNumber} of all pages`
              }}
            />
          }
        />}
      {showCreate?
      <TaskCreate user={user} onSubmit={handleCreateSubmit} onDismiss={handleCreateDismiss} />
      :<div/>}
      {showDelete?
        <Modal
          visible={true}
          onSubmit={handleDeleteSubmit}
          onDismiss={handleDeleteDismiss}
          size="medium"
          header="Delete task"
          closeAriaLabel="Close dialog"
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
              <Button variant="primary" onClick={handleDeleteSubmit}>
                Delete
              </Button>
              <Button variant="normal" onClick={handleDeleteDismiss}>
                Cancel
              </Button>
              </SpaceBetween>
            </Box>
          }>
          Do you want to delete the task: <b>{selectedItems[0].name}</b>? All related resources will be deleted, including the images uploaded to the S3 bucket folder if you have already uploaded images.
        </Modal>      
      :<div/>}
    </div>
  );
}

export {TaskList};