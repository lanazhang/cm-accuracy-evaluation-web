import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Amplify } from 'aws-amplify';
import config from './aws-exports';
//Amplify.configure(config);

Amplify.configure({
  // OPTIONAL - if your API requires authentication 
  Auth: {
      identityPoolId: config.aws_cognito_identity_pool_id, // REQUIRED - Amazon Cognito Identity Pool ID
      region: config.aws_project_region, // REQUIRED - Amazon Cognito Region
      userPoolId: config.aws_user_pools_id, // OPTIONAL - Amazon Cognito User Pool ID
      userPoolWebClientId: config.aws_user_pools_web_client_id, // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
      /*
      identityPoolId: "[[[COGNITO_IDENTITY_POOL_ID]]]",
      region: "[[[COGNITO_REGION]]]",
      userPoolId: "[[[COGNITO_USER_POOL_ID]]]",
      userPoolWebClientId: "[[[COGNITO_USER_POOL_CLIENT_ID]]]",
      */
  },
  API: {
      endpoints: [
          {
              name: "CmAccuracyEvalSrv",
              endpoint: "https://vgapm1vmwh.execute-api.us-east-1.amazonaws.com/staging/v1"
              //endpoint: "[[[APIGATEWAY_BASE_URL]]]"
          }
      ]
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
