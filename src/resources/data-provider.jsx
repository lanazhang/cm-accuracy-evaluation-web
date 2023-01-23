import { Auth, API } from 'aws-amplify';

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

const ModerationCategories = {
  "-- All --": [],
  "Explicit Nudity": ["-- All --", "Nudity", "Graphic Male Nudity", "Graphic Female Nudity", "Sexual Activity", "Illustrated Explicit Nudity", "Adult Toys"],
  "Suggestive": ["-- All --", "Female Swimwear Or Underwear","Male Swimwear Or Underwear","Partial Nudity","Barechested Male","Revealing Clothes","Sexual Situations"],
  "Violence": ["-- All --" ,"Graphic Violence Or Gore", "Physical Violence", "Weapon Violence", "Weapons", "Self Injury"],
  "Visually Disturbing": ["-- All --", "Emaciated Bodies","Corpses","Hanging","Air Crash","Explosions And Blasts"],
  "Rude Gestures": ["-- All --", "Middle Finger"],
  "Drugs": ["-- All --", "Drug Products", "Drug Use", "Pills", "Drug Paraphernalia"],
  "Tobacco": ["-- All --", "Tobacco Products", "Smoking"],
  "Alcohol": ["-- All --", "Drinking", "Alcoholic Beverages"],
  "Gambling": ["-- All --", "Gambling"],
  "Hate Symbols": ["-- All --", "Nazi Party", "White Supremacy", "Extremist"]
}
const TypeFilterValue = [
       { id: "-", text: "-- All --" },
       { id: "true-positive", text: "True Positive" },
       { id: "false-positive", text: "False Positive" },
     ]
const ConfidenceValue = [
       { id: "50", text: "50%" },
       { id: "60", text: "60%" },
       { id: "70", text: "70%" },
       { id: "80", text: "80%" },
       { id: "90", text: "90%" },
     ]

async function FetchData(path, method="post", body=null) {
  const apiName = 'CmAccuracyEvalSrv';
  const init = {
    headers: {
      Authorization: `Bearer ${(await Auth.currentSession())
        .getIdToken()
        .getJwtToken()}`
    }
  };

  if (body !== null) {
    init["body"] = body;
  }

  switch(method) {
    case "get":
      return await API.get(apiName, path, init);
    case "post":
      return await API.post(apiName, path, init);
    case "put":
      return await API.put(apiName, path, init);
  }
  return null;
}

export {ModerationCategories, TypeFilterValue, ConfidenceValue, FetchData};