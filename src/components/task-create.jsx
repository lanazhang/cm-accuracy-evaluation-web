import React, { useState, useEffect } from 'react';
import { Box, Button, Header, FormField, Input, Modal, SpaceBetween, Container, Alert, Textarea, Popover, StatusIndicator} from '@cloudscape-design/components';
import { S3Client } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Link } from '@aws-amplify/ui-react';
const REGION = "us-west-2";

function readFileDataAsBase64(e) {
  const file = e.target.files[0];

  return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
          resolve(event.target.result);
        };

      reader.onerror = (err) => {
          reject(err);
      };

      reader.readAsBinaryString(file);
  });
}

function TaskCreate ({user, onDismiss}) {
  const ACCURACY_EVAL_SERVICE_URL = process.env.REACT_APP_ACCURACY_EVAL_SERVICE_URL;
  const API_KEY = process.env.REACT_APP_API_KEY;

  const [userName, setUserName] = useState(user.username);
  const [taskName, settaskName] = useState("");
  const [taskDescription, settaskDescription] = useState("");
  const [fileType, setFileType] = useState(null);
  const [message, setMessage] = useState(null);
  const [submitFlag, setSubmitFlag] = useState(false);
  const [submitSuccessFlag, setSubmitSuccessFlag] = useState(false);
  const [task, setTask] = useState(null);

  const handleSubmit = e => {
    e.preventDefault();
    setSubmitFlag(true);
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
           'Content-type': fileType,
           'x-api-key': API_KEY
        },
        })
        .then((response) => response.json())
        .then((data) => {
            var resp = JSON.parse(data.body);
            console.log(resp);
            setSubmitSuccessFlag(true);
            setTask(resp);
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
    settaskName(e.detail.value);
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
        {!submitSuccessFlag? 
        <Box margin="s" color="text-body-secondary">
          Start creating an image accuracy evaluation task by specifying a name and description. After completing this step, you will receive an S3 bucket folder where you can upload the images and start the evaluation process.
        </Box>: 
        <Container header= {
            <Header variant="h3">Task created successfully</Header>
          }
          margin="s" 
          color="text-label">
              As for the next step, you will need to copy the images to the S3 bucket folder: <b>`s3://${task.s3_bucket}/${task.s3_key_prefix}`</b>. Then come back to continue the process. 
              <br/>We recommend providing more than 10,000 images for better accuracy evaluation. Fewer images will provide less data points and potentially lead to a skewed result.
              <br/>If your sample images are already in an S3 bucket, you can use the below bash command to bulk copy images from your source S3 bucket to the one set up for this evaluation task. (Ensure your IAM user/role has proper access to both buckets.)
              <br/><br/>
              <span className="custom-wrapping">
                <Box margin={{ right: 'xxs' }} display="inline-block">
                  <Popover
                    size="small"
                    position="top"
                    triggerType="custom"
                    dismissButton={false}
                    content={<StatusIndicator type="success">Command copied</StatusIndicator>}
                  >
                    <Button
                      variant="inline-icon"
                      iconName="copy"
                      onClick={() => {
                        /* copy to clipboard implementation */
                        navigator.clipboard.writeText(`aws s3 sync s3://YOUR_SOURCE_S3_BUCKET/YOUR_FOLDER s3://${task.s3_bucket}/${task.s3_key_prefix}`);
                      }}
                    />
                  </Popover>
                </Box>
                <b>aws s3 sync s3://YOUR_SOURCE_S3_BUCKET/YOUR_FOLDER s3://${task.s3_bucket}/${task.s3_key_prefix}</b>
                <br/><br/>
                <Link 
                  isExternal={true} 
                  externalIconAriaLabel="Opens in a new tab" 
                  href='https://docs.aws.amazon.com/cloudshell/latest/userguide/multiple-files-upload-download.html'>
                    More instruction about bulk copy to S3 bucket
                </Link>
              </span>          
          </Container>}
          <br/>
        <form onSubmit={handleSubmit}>
            <SpaceBetween direction="vertical" size="l">
              <FormField label="Task name" description="A unique name of the accuracy evluation task">
                <Input value={taskName} onChange={handletaskNameChange} ariaRequired={true} invalid={submitFlag && taskName.trim().length === 0} />
              </FormField>
              <FormField label="Description" description="Description of the accuracy evluation task">
                <Textarea value={taskDescription} onChange={handleDescriptionChange} />
              </FormField>
            </SpaceBetween>
        </form>

    </Modal>
  );
}

export {TaskCreate};