import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  ColumnLayout,
  Container,
  Header,
  SpaceBetween,
  StatusIndicator,
  Link,
  Pagination,
  Popover,
  Modal
} from '@cloudscape-design/components';
import Cards from "@cloudscape-design/components/cards";
import Badge from "@cloudscape-design/components/badge";

const ACCURACY_EVAL_SERVICE_URL = process.env.REACT_APP_ACCURACY_EVAL_SERVICE_URL;
const API_KEY = process.env.REACT_APP_API_KEY;


// ["CREATED", "MODERATING", "MODERATION_COMPLETED", "HUMAN_REVIEWING", "COMPLETED", "FAILED"]

function getAvgToxicityConfidence(task) {
  var total = 0;
  var count = 0;
  var toxicity_count = 0
  if (task !== undefined)
    task.toxicity.forEach(function(i, idx) {
        if (i.toxicity >= 0.5) {
          total += i.toxicity;
          toxicity_count++;
        }
        count++;
      }
    )
  var avg = 0
  if (toxicity_count > 0) {
    avg = total/toxicity_count;
  }
  return {"average_confidence_score": avg, "total_count": count, "toxicity_count": toxicity_count}
}

function getToxicSegments(task_full) {
  if (task_full == undefined)
    return null;
  var j = Object.assign({}, task_full);
  j.toxicity = task_full.toxicity.filter(t=> t.toxicity >= 0.5);  
  return j;
}

function TaskDetail ({selectedTask, onBack}) {

  const [loadedFlag, setLoadedFlag ] = useState(false);
  const [moderationSubmittedFlag, setModerationSubmittedFlag ] = useState(false);
  const [task, setTask] = useState(selectedTask)

  const [showModerateModal, setShowModerateModal] = useState(false);
  const [toxicityToggleChecked, setToxicityToggleChecked] = useState(true);

  const handleStartModerationClick = e => {
    setShowModerateModal(true);
  }

  const handleCloseModerationModal = e => {
    setShowModerateModal(false);
  }
  const handleConfirmStartModerationClick = e => {
    setShowModerateModal(false);
    if (!moderationSubmittedFlag)
    {
      fetch(ACCURACY_EVAL_SERVICE_URL + 'task/start-moderation', {
        method: 'POST',
        body: JSON.stringify({
          id: task.id
        }),
        headers: {
           'Content-type': 'application/json; charset=UTF-8',
           'x-api-key': API_KEY
        },
        })
        .then((response) => response.json())
        .then((data) => {
            var j = JSON.parse(data.body)
            setTask(j);
        })
        .catch((err) => {
          console.log(err.message);
        });
        setModerationSubmittedFlag(true);
    }
  }

  useEffect(() => {
    if (!loadedFlag && (task.total_files === null || task.total_files === 0))
    {
      fetch(ACCURACY_EVAL_SERVICE_URL + 'task/task-with-count', {
        method: 'POST',
        body: JSON.stringify({
          id: task.id
        }),
        headers: {
           'Content-type': 'application/json; charset=UTF-8',
           'x-api-key': API_KEY
        },
        })
        .then((response) => response.json())
        .then((data) => {
            var j = JSON.parse(data.body)
            setTask(j);
        })
        .catch((err) => {
          console.log(err.message);
        });

      setLoadedFlag(true);
    }
  })

  const TaskDetails = () => (
    <div>
    <ColumnLayout columns={4} variant="text-grid">
        <div>
          <Box variant="awsui-key-label">Task name and description</Box>
          <div>{task!==null?task.name:""}</div>
          <div>{task!==null?task.description:""}</div>
        </div>
        <div>
          <Box variant="awsui-key-label">Status</Box>
          <div>
          <StatusIndicator type={task.status === 'COMPLETED' ? 'success' : task.status === 'FAILED'? 'error': 'info' }>{task.status}</StatusIndicator>
          </div>
        </div>        
        <div>
          <Box variant="awsui-key-label">S3 URI</Box>
          <div>{task!==null && task.s3_bucket !== null ?`s3://${task.s3_bucket}/${task.s3_key_prefix}`:""}</div>
        </div>  
        <div>
          <Box variant="awsui-key-label">Numbers of images uploaded</Box>
          <div>{task!==null && task.total_files !== null && parseInt(task.total_files) > 0?parseInt(task.total_files).toLocaleString('en-US'): 0}</div>
        </div>          
        <div>
          <Box variant="awsui-key-label">Created by</Box>
          <div>{task!==null?task.created_by:""}</div>
        </div>   
        <div>
          <Box variant="awsui-key-label">Created at</Box>
          <div>{task!==null?task.created_ts:""}</div>
        </div>   
    </ColumnLayout>
    <br/>
    {task !== null && task.status === "CREATED" && task.total_files !== null && parseInt(task.total_files) > 0?
    <Box margin={'l'} float='right'>
      <Button variant="primary" onClick={handleStartModerationClick}>Start moderation</Button>
      <Modal 
        onDismiss={handleCloseModerationModal} 
        visible={showModerateModal}
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={handleCloseModerationModal}>Cancel</Button>
              <Button variant="primary" onClick={handleConfirmStartModerationClick}>Confirm start moderation</Button>
            </SpaceBetween>
          </Box>
        }
        header="Start moderating images">
        Amazon Rekognition will moderate the <b>{task.total_files}</b> images in the S3 bucket: <b>s3://{task.s3_bucket}/{task.s3_key_prefix}</b>. You will no longer be allowed to add new images to the bucket once the moderation process start.
      </Modal>
    </Box>:<div/>}
    {task !== null && task.status === "CREATED" && (task.total_files === null || parseInt(task.total_files) === 0)?
    <Container>
          As for the next step, you will need to copy the images to the S3 bucket folder: <b>s3://{task.s3_bucket}/{task.s3_key_prefix}</b>. Then come back to continue the process. 
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
    </Container>:<div/>
    }
    </div>
  );

  const ModeratiinDetail = () => (
    <div>
    <ColumnLayout columns={3} variant="text-grid">
        <div>
          <Box variant="awsui-key-label">Total number of images in the S3 bucket</Box>
          <div>{task!==null?parseInt(task.total_files).toLocaleString('en-US'):""}</div>
        </div>
        <div>
          <Box variant="awsui-key-label">Number of images moderated by Rekognition</Box>
          <div>
          100
          </div>
        </div>
        <div>
          <Box variant="awsui-key-label">Number of images labeled by Rekognition</Box>
          <div>
          3
          </div>
        </div>  
    </ColumnLayout>
    <br/>
    <Container>
        Login to the Augmented AI (A2I) portal to review the moderation result.
        <br/><Link>Human review portal</Link>
    </Container>

    </div>
  );

    return (
      <div>
        <Container
          header={
            <div>
            <Header
              variant="h2"
              info={''}>
              Rekognition image accuracy evaluation task
            </Header>
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="normal" onClick={onBack}>
                  Back to list
                </Button>
              </SpaceBetween>
            </Box> 
            </div>
          }>
          <TaskDetails />
        </Container>
        <br/>
        {(task !== null && task.status !== "CREATED") ?
        <Container
          header={
            <div>
            <Header
              variant="h2"
              info=''>
                Review the moderation result
            </Header>
            </div>
          }>
          <ModeratiinDetail />
        </Container>:<div/>}
      </div>
    );
}

export {TaskDetail};