import React, { useState, useEffect } from 'react';
import { Box, Button, ColumnLayout,Header,SpaceBetween,StatusIndicator,Link,Popover,Modal,Alert,ProgressBar,ExpandableSection,Flashbar,Spinner} from '@cloudscape-design/components';
import { FetchData } from "../resources/data-provider";

const ACCURACY_EVAL_SERVICE_URL = process.env.REACT_APP_ACCURACY_EVAL_SERVICE_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

const REFRESH_INTERVAL_MS = 5000;

function TaskDetail ({selectedTask, onImageClick, onReportClick,  onBack}) {

  const [moderationSubmittedFlag, setModerationSubmittedFlag ] = useState(false);
  const [task, setTask] = useState(selectedTask)
  const [loadingStatus, setLoadingStatus] = useState(null) // null, LOADING, LOADED

  const [showSummary, setShowSummary] = useState(true);
  const [expandSummary, setExpandSummary] = useState(false);
  const [showModeration, setShowModeration] = useState(false);
  const [expandModeration, setExpandModeration] = useState(false);
  const [showHumanReview, setShowHumanReview] = useState(false);
  const [expandHumanReview, setExpandHumanReview] = useState(false);
  const [actions, setActions] = useState([]);
  const [showModerateModal, setShowModerateModal]= useState(false);

  const [lastRefresh, setLastRefresh] = useState(null);

  // Status values: ["CREATED", "MODERATING", "MODERATION_COMPLETED", "HUMAN_REVIEWING", "COMPLETED", "FAILED"]
  // Action values: ["TO_S3", "START_MOD", "MOD_PROGRESS", "GO_TO_A2I", "REVIEW_PROGRESS", "CHECK_REPORT", "REVIEW_IMAGES"]
  function setPanelStatus(t) {
    if(t !== null && t.status !== null) {
      // Summary section
      switch(t.status) {
        case "CREATED":
          setShowSummary(true);
          setExpandSummary(true);
          setShowModeration(false);
          setExpandModeration(false);
          setShowHumanReview(false);
          setExpandHumanReview(false);
          if (t.total_files === null || t.total_files == 0)
            setActions(["TO_S3"]);
          else
            setActions(["START_MOD"]);
          break;
        case "MODERATING":
          setShowSummary(true);
          setExpandSummary(false);
          setShowModeration(true);
          setShowHumanReview(false);
          setExpandModeration(true);
          setExpandHumanReview(false);
          setActions(["MOD_PROGRESS"]);
          break;      
        case "MODERATION_COMPLETED":
          setShowSummary(true);
          setExpandSummary(false);
          setShowModeration(true);
          setExpandModeration(false);
          setShowHumanReview(true);
          setExpandHumanReview(true);
          setActions(["GO_TO_A2I","REVIEW_IMAGES"]);
          break;    
        case "HUMAN_REVIEWING":
          setShowSummary(true);
          setExpandSummary(false);
          setShowModeration(true);
          setShowHumanReview(true);
          setExpandModeration(false);
          setExpandHumanReview(true);
          setActions(["GO_TO_A2I","CHECK_REPORT","REVIEW_PROGRESS","REVIEW_IMAGES"]);
          break;    
        case "COMPLETED":
          setShowSummary(true);
          setExpandSummary(true);
          setShowModeration(true);
          setShowHumanReview(true);
          setExpandModeration(true);
          setExpandHumanReview(true);
          setActions(["CHECK_REPORT","REVIEW_IMAGES"]);
          break;      
        }
    }
  }

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
      setModerationSubmittedFlag(true);
      FetchData('/task/start-moderation', "post", {
        id: task.id
      }).then((data) => {
            var j = JSON.parse(data.body)
            setTask(j);
            reloadTask();
        })
        .catch((err) => {
          setModerationSubmittedFlag(false);
          console.log(err.message);
        });
    }
  }

  useEffect(() => {
    if (loadingStatus === null) {
     reloadTask();
    }
  });

  async function reloadTask() {
    //console.log(task);
    setLoadingStatus("LOADING");
    setModerationSubmittedFlag(false);

    FetchData('/task/task-with-count',"post", {
      id: task.id
    }).then((data) => {
          var j = JSON.parse(data.body)
          setTask(j);
          setPanelStatus(j);
          setLoadingStatus("LOADED");
      })
      .catch((err) => {
        console.log(err.message);
        setLoadingStatus("LOADED");
      });
    return;
  }

  const handleRefresh = e => {
    reloadTask();
  }

  const handleReportClick = e => {
    e.task = task;
    onReportClick(e);
  }
  const handleImagesClick = e => {
    e.task = task;
    onImageClick(e);
  }
  const Summary = () => (
    <div>
    <ColumnLayout columns={4} variant="text-grid">
        <div>
          <Box variant="awsui-key-label">Description</Box>
          <div>{task!==null?task.description:""}</div>
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
          <Box variant="awsui-key-label">Created</Box>
          <div>{task!==null?task.created_by:""}</div>
          <div>{task!==null?task.created_ts:""}</div>
        </div>   
    </ColumnLayout>
    </div>
  );

  const ModerationSummary = () => (
    <div>
    <ColumnLayout columns={3} variant="text-grid">
        <div>
          <Box variant="awsui-key-label">Total uploaded images</Box>
          <Box variant="awsui-value-large">{task!==null && task.total_files !== null?parseInt(task.total_files).toLocaleString('en-US'):""}</Box>
        </div>
        <div>
          <Box variant="awsui-key-label">Total number of images processed by Rekognition</Box>
          <Box variant="awsui-value-large">{task!==null && task["processed"] !== undefined?task.processed.toLocaleString('en-US'):""}</Box>
        </div>
        <div>
          <Box variant="awsui-key-label">Total number of images flagged by Rekognition as inappropriate</Box>
          <Box variant="awsui-value-large">{task!==null && task["labeled"] !== undefined?task.labeled.toLocaleString('en-US'):""}</Box>
        </div>  
      </ColumnLayout>
    </div>
  );

  const HumanReviewSummary = () => (
    <div>
    <ColumnLayout columns={4} variant="text-grid">
        <div>
          <Box variant="awsui-key-label">Total number of images flagged by Rekognition as inappropriate</Box>
          <Box variant="awsui-value-large">{task!==null && task["labeled"] !== undefined?task.labeled.toLocaleString('en-US'):""}</Box>
        </div>  
        <div>
          <Box variant="awsui-key-label">Images reviewed by huamn</Box>
          <Box variant="awsui-value-large">{task!==null && task["reviewed"] !== undefined?task.reviewed.toLocaleString('en-US'):""}</Box>
        </div>  
        <div>
          <Box variant="awsui-key-label">Numbers of False Positive</Box>
          <Box variant="awsui-value-large">{task!==null && task["false_positive"] !== undefined?task.false_positive.toLocaleString('en-US'):""}</Box>
        </div>
        <div>
          <Box variant="awsui-key-label">Numbers of True Positive</Box>
          <Box variant="awsui-value-large">{task!==null && task["true_positive"] !== undefined?task.true_positive.toLocaleString('en-US'):""}</Box>
        </div>
      </ColumnLayout>
    </div>
  );

  const Action = () => (
    <div>
    {actions.includes("START_MOD")?
    <Box margin={'l'} float='right'>
      <Button variant="primary" onClick={handleStartModerationClick} disabled={moderationSubmittedFlag}>Start moderation</Button>
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
        Amazon Rekognition will moderate the <b>{task.total_files}</b> images in the S3 bucket: <b>s3://{task.s3_bucket}/{task.s3_key_prefix}</b> <br/>You should not add new images to the folder after the moderation process starts.
      </Modal>
    </Box>:<div/>}

    {actions.includes("TO_S3")?
      <Alert>
          <b>You have initiated an accuracy evaluation task successfully!</b>
          <br/>As for the next step, you will need to copy the images to the S3 bucket folder: <b>s3://{task.s3_bucket}/{task.s3_key_prefix}</b> provisioned for this task. Then come back to continue the process. 
          <br/>We recommend providing more than 5,000 images for better accuracy evaluation. Fewer images will provide less data points and potentially produce a skewed result.
          <br/>If your sample images are already in an S3 bucket, use the below bash command to bulk copy images from the source S3 bucket to the one set up for this evaluation task. (Ensure your IAM user/role has proper access to both buckets.)
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
                    navigator.clipboard.writeText(`aws s3 sync s3://YOUR_SOURCE_S3_BUCKET/YOUR_FOLDER/ s3://${task.s3_bucket}/${task.s3_key_prefix}`);
                  }}
                />
              </Popover>
            </Box>
            <b>aws s3 sync s3://YOUR_SOURCE_S3_BUCKET/YOUR_FOLDER/ s3://{task.s3_bucket}/{task.s3_key_prefix}</b>
            <br/><br/>
            <Link 
              isExternal={true} 
              externalIconAriaLabel="Opens in a new tab" 
              href='https://docs.aws.amazon.com/cloudshell/latest/userguide/multiple-files-upload-download.html'>
                 Refer to the document for more instructions if your images are outside S3.
            </Link>
          </span>  
          </Alert> 
    :<div/>
    } 

    {actions.includes("GO_TO_A2I")?
    <Alert>
        Rekognition moderated all the images in the S3 bucket folder. Now, you can log in to the Augmented AI (A2I) portal to review the moderation result. 
        Choose job <b>{task.a2i_job_title}</b> from the list and click "Start working" to review the moderation results.
        <br/><br/><Link variant="primary" external='true' href={task.a2i_url !== null?task.a2i_url:""}>Open A2I human review portal</Link>
    </Alert>: <div/>
    }   

    {actions.includes("MOD_PROGRESS")?
      <Flashbar
      items={[
        {
          content: (
          <ProgressBar
            variant="flash"
            value={(task.processed * 100)/task.total_files}
            label="Rekognition image moderation progress. Model will flag everything above 50%. You can change that confidence score later on the results page."
          />
      )}]}>

      </Flashbar>
    :<div/>}

    {actions.includes("REVIEW_PROGRESS")?
      <div>
      <br/>
      <Flashbar
      items={[
        {
          content: (
          <ProgressBar
            variant="flash"
            value={(task.reviewed * 100)/task.labeled}
            label="Huamn review (using A2I) progress"
          />
      )}]}>
      </Flashbar>
      </div>
    :<div/>}
    </div>)

    return (
      <div>
        <Header
          actions={
            <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              {loadingStatus === "LOADING"?<Spinner />:
                task.status !== 'COMPLETED'?
                <div>Refresh to update task status - <Button variant="normal" iconName="refresh" onClick={handleRefresh} /></div>:<div/>}
              {actions.includes("CHECK_REPORT")?
              <Button variant='primary' onClick={handleReportClick}>Review report</Button>:<div/>}
              {actions.includes("REVIEW_IMAGES")?
              <Button variant='primary' onClick={handleImagesClick}>Check images</Button>:<div/>}
              
              <Button variant="normal" onClick={onBack}>
                Back to list
              </Button>
            </SpaceBetween>
          </Box>
          }
        >Rekognition image accuracy evalution task</Header>
        <br/>
        {showSummary?
        <ExpandableSection 
          defaultExpanded={expandSummary} 
          variant="container" 
          headerText={task.name}
          headerDescription={<StatusIndicator type={task.status === 'COMPLETED' ? 'success' : task.status === 'FAILED'? 'error': 'info' }>{task.status}</StatusIndicator>}
          >
            <Summary />
        </ExpandableSection>:<div/>}
        <br/>
        {showModeration ?
        <ExpandableSection 
          defaultExpanded={expandModeration} 
          variant="container" 
          headerText="Moderation summary"
          headerDescription={task.labeled + ' / ' + task.total_files + ' images labeled by Rekognition image moderation API'}>
            <ModerationSummary />
        </ExpandableSection>:<div/>}
        <br/>
        {showHumanReview ?
        <ExpandableSection 
          defaultExpanded={expandHumanReview} 
          variant="container" 
          headerText="Human review summary" >
            <HumanReviewSummary />
        </ExpandableSection>:<div/>}
        <br />
        {actions.length > 0? 
        <Action></Action>
        :<div/>}
      </div>
    );
}

export {TaskDetail};