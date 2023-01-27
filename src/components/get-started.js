import React, { useState, useEffect } from 'react';
import diagram from '../static/flow_diagram.png'
import {
    ContentLayout,
    Button,
    Container,
    Header,
    SpaceBetween,
    Link,
    Alert,
    Box,
    RadioGroup
  } from '@cloudscape-design/components';

function GetStarted ({onStart}) {
    const [messages, setMessages] = useState([]);

    return (
        <ContentLayout
            header={
                <SpaceBetween size="m">
                <Header
                    variant="h1"
                    info={<Link>Info</Link>}
                    description="A tool that helps you to evaluate Amazon Rekognition content moderation accuracy using your own data. "
                    actions={
                        <Button onClick={onStart}>Get Started</Button>
                    }
                >
                    AWS Content Moderation Accuracy Evaluation
                </Header>
                {messages.length >0?
                <Alert>This is a generic alert.</Alert>:<div/>}
                </SpaceBetween>
            }
            >
                <Container>
                    <img src={diagram} alt="Evaluation work flow" width="80%"></img>
                    <Box variant="p">
                        The AWS Content Moderation Accuracy Evaluation tool helps you evaluate Amazon Rekognition image moderation's false-positive rate based on your own dataset. 
                        For best results, we recommend you use a dataset with 5,000+ images, as fewer images may lead to a skewed result and a biased conclusion. 
                        <p>To evaluate Content Moderation accuracy:</p>
                        <ol>
                        <li>Initiate a new task and upload your dataset to the Amazon provided S3 bucket folder.</li>
                        <li>Start the moderation task once all the images are in place. Rekognition will then start to moderate images one by one.</li>
                        <li>Rekognition will label some of your images as inappropriate. You then can review these images using A2I to provide human input: if the image truly has inappropriate information (true-positive) or not (false-positive).</li>
                        <li>The tool will combine Rekognition moderation results and human inputs to produce an accuracy report.</li>
                        </ol>
                    </Box>
                </Container>
                {/*
                <Container width="150">
                <RadioGroup
                    value={"moderating"}
                    items={[
                        { value: "created", label: "Task created", description: "Initiated task. Waiting for user to upload images." },
                        { value: "image_ready", label: "Images uploaded to S3 bucket", description: "Images uploaded to the S3 bucket. Ready to start moderation." },
                        { value: "moderating", label: "Moderation in progress", description: "Rekognition moderating the images." },
                        { value: "moderated", label: "Moderation completes", description: "Rekognition has moderated all the images. Ready to start human review.", disabled: true },
                        { value: "reviewing", label: "Human review in progress", description: "Human reviewing the images labeled by Rekognition." },
                        { value: "completed", label: "Completed", description: "The evaluation process completes." },
                    ]}
                    />
                </Container>*/}
            </ContentLayout>
    );
}

export {GetStarted};