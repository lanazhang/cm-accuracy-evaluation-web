// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
const AUDIO_SERVICE_URL = process.env.REACT_APP_AUDIO_SERVICE_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

/*export default class RestDataProvider {
  getData(name) {
    fetch(AUDIO_SERVICE_URL + 'jobs', {
      method: 'POST',
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
  }
}*/

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
}