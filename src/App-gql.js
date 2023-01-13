import React, { useState, useEffect } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import { API } from "aws-amplify";
import {
  Button,
  Flex,
  Heading,
  Text,
  TextField,
  View,
  withAuthenticator,
} from "@aws-amplify/ui-react";
import { listTasks } from "./graphql/queries";
import {
  createTask as createTaskMutation,
  deleteTask as deleteTaskMutation,
} from "./graphql/mutations";

const App = ({ signOut }) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    const apiData = await API.graphql({ query: listTasks });
    const tasksFromAPI = apiData.data.listTasks.items;
    setTasks(tasksFromAPI);
  }

  async function createTask(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const data = {
      name: form.get("name"),
      description: form.get("description"),
      created_by: form.get("created_by"),
      created_ts: form.get("created_ts"),
      source_s3_bucket: form.get("source_s3_bucket"),
      source_s3_prefix: form.get("source_s3_prefix"),
      status: form.get("status")
    };
    await API.graphql({
      query: createTaskMutation,
      variables: { input: data },
    });
    fetchTasks();
    event.target.reset();
  }

  async function deleteTask({ id }) {
    const newTasks = tasks.filter((task) => task.id !== id);
    setTasks(newTasks);
    await API.graphql({
      query: deleteTaskMutation,
      variables: { input: { id } },
    });
  }

  return (
    <View className="App">
      <Heading level={1}>My Tasks App</Heading>
      <View as="form" margin="3rem 0" onSubmit={createTask}>
        <Flex direction="row" justifyContent="center">
          <TextField
            name="name"
            placeholder="Task Name"
            label="Task Name"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="description"
            placeholder="Task Description"
            label="Task Description"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="S3 bucket"
            placeholder="S3 bucket for the images"
            label="S3 Bucket"
            labelHidden
            variation="quiet"
            required
          />
          <Button type="submit" variation="primary">
            Create Task
          </Button>
        </Flex>
      </View>
      <Heading level={2}>Current Tasks</Heading>
      <View margin="3rem 0">
        {tasks.map((task) => (
          <Flex
            key={task.id || task.name}
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            <Text as="strong" fontWeight={700}>
              {task.name}
            </Text>
            <Text as="span">{task.description}</Text>
            <Button variation="link" onClick={() => deleteTask(task)}>
              Delete task
            </Button>
          </Flex>
        ))}
      </View>
      <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
};

export default withAuthenticator(App);