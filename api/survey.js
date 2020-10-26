'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk');

const CONSTANTS = require('./utils/constants');
const helper = require('./utils/helper');

AWS.config.setPromisesDependency(require('bluebird'));

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.login = (event, context, callback) => {
  const requestBody = JSON.parse(event.body);

  const { email, password } = requestBody;

  if (email && password) {
    callback(null, {
      statusCode: 200,
      headers: CONSTANTS.CORS_HEADERS,
      body: JSON.stringify({
        success: helper.isValidUser(email, password)
      })
    });
  } else {
    callback(null, {
      statusCode: 500,
      headers: CONSTANTS.CORS_HEADERS,
      body: JSON.stringify({
        message: 'Invalid input'
      })
    });
  }
}

module.exports.submit = (event, context, callback) => {
  const requestBody = JSON.parse(event.body);

  const { name, active, expiryDate, url, fromEmail, triggerActivityClosure, triggerCaseClosure, accessibility } = requestBody;

  const valid = validate({ name, active, expiryDate, url, fromEmail, triggerActivityClosure, triggerCaseClosure, accessibility });
  if (!valid) {
    callback(null, {
      statusCode: CONSTANTS.HTTP_STATUS_CODES.BAD_INPUT,
      headers: CONSTANTS.CORS_HEADERS,
      body: JSON.stringify({
        message: `Invalid input data`
      })
    });
  } else {
    submitSurveyP(surveyInfo(name, active, expiryDate, url, fromEmail, triggerActivityClosure, triggerCaseClosure, accessibility))
      .then(res => {
        callback(null, {
          statusCode: 200,
          headers: CONSTANTS.CORS_HEADERS,
          body: JSON.stringify({
            message: `Sucessfully submitted survey with email ${fromEmail}`,
            surveyId: res.id
          })
        });
      })
      .catch(err => {
        console.log(err);
        callback(null, {
          headers: CONSTANTS.CORS_HEADERS,
          statusCode: 500,
          body: JSON.stringify({
            message: `Unable to submit survey with email ${fromEmail}`
          })
        })
      });
  }

};

module.exports.list = (event, context, callback) => {
  var params = {
    TableName: process.env.SURVEY_TABLE,
    ProjectionExpression: "id, #c1, active, expiryDate, #c2, fromEmail, triggerActivityClosure, triggerCaseClosure, #c3",
    ExpressionAttributeNames: {
      "#c1": "name",
      "#c2": "url",
      // "#c3": "trigger",
      "#c3": "accessibility"
    }
  };

  console.log("Scanning Survey table.");
  const onScan = (err, data) => {

    if (err) {
      console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
      callback(err);
    } else {
      console.log("Scan succeeded.");
      return callback(null, {
        statusCode: 200,
        headers: CONSTANTS.CORS_HEADERS,
        body: JSON.stringify({
          surveys: data.Items
        })
      });
    }

  };

  dynamoDb.scan(params, onScan);
}

const validate = ({ name, active, expiryDate, url, fromEmail, triggerActivityClosure, triggerCaseClosure, accessibility }) => {
  if (!name || !active || !expiryDate || !url || !fromEmail || !triggerActivityClosure || !triggerCaseClosure || !accessibility) {
    return false;
  } else {
    true;
  }
}

const submitSurveyP = survey => {
  console.log('Submitting survey');
  const surveyInfo = {
    TableName: process.env.SURVEY_TABLE,
    Item: survey,
  };
  return dynamoDb.put(surveyInfo).promise()
    .then(res => survey);
};

const surveyInfo = (name, active, expiryDate, url, fromEmail, triggerActivityClosure, triggerCaseClosure, accessibility) => {
  const timestamp = new Date().getTime();
  return {
    id: uuid.v1(),
    name: name,
    active: active,
    expiryDate: expiryDate,
    url: url,
    fromEmail: fromEmail,
    triggerCaseClosure: triggerCaseClosure,
    triggerActivityClosure: triggerActivityClosure,
    accessibility: accessibility,
  };
};