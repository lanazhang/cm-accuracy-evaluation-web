// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
const ACCURACY_EVAL_SERVICE_URL = process.env.REACT_APP_ACCURACY_EVAL_SERVICE_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

/*
export default class DataProvider {
  getData(name) {
    return fetch(`../resources/${name}.json`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Response error: ${response.status}`);
        }
        return response.json();
      })
      .then(data => data.map(it => ({ ...it, date: new Date(it.date) })));
  }
}*/

export default function FetchRestData(endpoint, method, body) {
  console.log(endpoint,method,body);
  fetch(ACCURACY_EVAL_SERVICE_URL + endpoint, {
    method: method,
    body: JSON.stringify(body),
    headers: {
       'Content-type': 'application/json; charset=UTF-8',
       'x-api-key': API_KEY
    },
    })
    .then((response) => response.json())
    .then((data) => {
        return JSON.parse(data.body)
    })
    .catch((err) => {
      console.log(err.message);
    });
    return null;
}