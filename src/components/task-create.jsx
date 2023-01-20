import React, { useState, useEffect } from 'react';
import { Box, Button, Header, FormField, Input, Modal, SpaceBetween, Container, Alert, Textarea, Popover, StatusIndicator} from '@cloudscape-design/components';
import { S3Client } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Link } from '@aws-amplify/ui-react';


function TaskCreate ({user, onSubmit, onDismiss}) {
  const ACCURACY_EVAL_SERVICE_URL = process.env.REACT_APP_ACCURACY_EVAL_SERVICE_URL;
  const API_KEY = process.env.REACT_APP_API_KEY;

  const [userName, setUserName] = useState(user.username);
  const [taskName, setTaskName] = useState("");
  const [taskDescription, settaskDescription] = useState("");
  const [message, setMessage] = useState(null);
  const [submitFlag, setSubmitFlag] = useState(false);
  const [submitSuccessFlag, setSubmitSuccessFlag] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();

    setSubmitFlag(true);
    if(taskName.length == 0 || taskName.length > 50) {
      setMessage({
        "status": "error",
        "body": "The task name is required and should be at most 50 characters.",
        "header": "Invalid input"
      })
      return;
    }
    else if(taskDescription.length > 200) {
      setMessage({
        "status": "error",
        "body": "The description should be at most 200 characters.",
        "header": "Invalid input"
      })
      return;
    }

    if (taskName.length > 0) {
       fetch(ACCURACY_EVAL_SERVICE_URL + 'task/create-task', {
        method: 'PUT',
        body: JSON.stringify(
           {
               "task_name": taskName,
               "task_description": taskDescription,
               "created_by": userName
           }
        ),
        headers: {
           'Content-type': "application/json",
           'x-api-key': API_KEY
        },
        })
        .then((response) => response.json())
        .then((data) => {
            var resp = JSON.parse(data.body);
            console.log(resp);
            setSubmitSuccessFlag(true);
            e.task = resp;
            onSubmit(e);
        })
        .catch((err) => {
           console.log(err.message);
           setMessage({
              "status": "error",
              "body": err.message,
              "header": "Failed to create the new task"
            });
        });

    }

  }

  const handletaskNameChange = e => {
    setTaskName(e.detail.value);
  }

  const handleDescriptionChange = e => {
    settaskDescription(e.detail.value);
  }
    return (<Modal
      visible={true}
      onSubmit={handleSubmit}
      onDismiss={onDismiss}
      size="large"
      header="Step 1: initiate an image accuracy evaluation task"
      closeAriaLabel="Close dialog"
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="primary" formAction='true' onClick={handleSubmit} disabled={submitSuccessFlag}>
              Create task
            </Button>
            <Button variant="normal" onClick={onDismiss}>
              {submitSuccessFlag? "Close": "Cancel"}
            </Button>
          </SpaceBetween>
        </Box>
      }>
      {message !== null?  
        <Alert
          statusIconAriaLabel={message.status}
          header={message.header}
        >{message.body}
        </Alert>:<div/>}
        <br/>
        <form onSubmit={handleSubmit}>
            <SpaceBetween direction="vertical" size="l">
              <FormField label="Task name" description="A unique name for the accuracy evaluation task should be at most 50 characters.">
                <Input 
                  value={taskName} 
                  onChange={handletaskNameChange} 
                  ariaRequired={true} 
                  invalid={submitFlag && (taskName.trim().length === 0 || taskName.length > 50)} />
              </FormField>
              <FormField label="Description" description="A description for the accuracy evaluation task should be at most 200 characters.">
                <Textarea 
                  value={taskDescription} 
                  onChange={handleDescriptionChange} 
                  invalid={submitFlag && (taskDescription !== null && taskDescription.length > 200)}/>
              </FormField>
            </SpaceBetween>
        </form>

    </Modal>
  );
}

export {TaskCreate};