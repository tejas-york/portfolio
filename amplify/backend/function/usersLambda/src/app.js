/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

const express = require("express");
const bodyParser = require("body-parser");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");

const ddbClient = new DynamoDBClient({ region: process.env.TABLE_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

let TableName = "users";
if (process.env.ENV && process.env.ENV !== "NONE") {
  TableName = TableName + "-" + process.env.ENV;
}

const userIdPresent = false; // TODO: update in case is required to use that definition
const partitionKeyName = "id";
const partitionKeyType = "N";
const sortKeyName = "updatedAt";
const sortKeyType = "N";
const hasSortKey = sortKeyName !== "";
const path = "/meta-data";
const UNAUTH = "UNAUTH";
const hashKeyPath = "/:" + partitionKeyName;
const sortKeyPath = hasSortKey ? "/:" + sortKeyName : "";

// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

// convert url string param to expected Type
const convertUrlType = (param, type) => {
  switch (type) {
    case "N":
      return Number.parseInt(param);
    default:
      return param;
  }
};

/**********************
 * Example get method *
 **********************/

app.get("/users", async (req, res) => {
  try {
    const users = await ddbClient.send(
      new ScanCommand({
        TableName,
        Select: "ALL_ATTRIBUTES",
      })
    );
    res.statusCode = users.$metadata.httpStatusCode;
    res.json({
      success: "get call succeed!",
      data: {
        data: users.Items,
        total: users.Count,
      },
    });
  } catch (error) {
    res.json({ success: "Could not load users: " + error.message });
  }
});

app.get("/users/*", async function (req, res) {
  const users = await ddbClient.send(
    new ScanCommand({
      TableName,
      Select: "ALL_ATTRIBUTES",
    })
  );
  res.statusCode = users.$metadata.httpStatusCode;
  res.json({
    success: "get call succeed!",
    data: {
      data: users.Items,
      total: users.Count,
    },
  });
});

/****************************
 * Example post method *
 ****************************/

app.post("/users", async function (req, res) {
  try {
    const users = await ddbClient.send(
      new ScanCommand({
        TableName,
        Select: "ALL_ATTRIBUTES",
      })
    );
    console.log(users.Items);
    // const currTimestamp = new Date().getTime()
    // const createUserObject = {
    //   id: users.Count,
    //   ...req.body,
    //   createdAt: currTimestamp,
    //   updatedAt: currTimestamp
    // };
    // const user = await ddbClient.send(
    //   new PutCommand({
    //     TableName,
    //     Item: createUserObject,
    //   })
    // );
    // res.statusCode = user.$metadata.httpStatusCode;
    res.json({
      success: "post call succeed!",
    });
  } catch (error) {
    res.json({ success: "Could not create users: " + error.message });
  }
});

// app.post("/users/*", function (req, res) {
//   // Add your code here
//   res.json({ success: "post call succeed!", url: req.url, body: req.body });
// });

/****************************
 * Example put method *
 ****************************/

app.put("/users", function (req, res) {
  // Add your code here
  res.json({ success: "put call succeed!", url: req.url, body: req.body });
});

app.put("/users/*", function (req, res) {
  // Add your code here
  res.json({ success: "put call succeed!", url: req.url, body: req.body });
});

/****************************
 * Example delete method *
 ****************************/

app.delete("/users", function (req, res) {
  // Add your code here
  res.json({ success: "delete call succeed!", url: req.url });
});

app.delete("/users/*", function (req, res) {
  // Add your code here
  res.json({ success: "delete call succeed!", url: req.url });
});

app.listen(3000, function () {
  console.log("App started");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
