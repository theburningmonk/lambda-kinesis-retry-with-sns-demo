'use strict';

const co  = require('co');
const AWS = require('aws-sdk');
const sns = new AWS.SNS();

const lib = require('./lib');   // <-- this is where the business logic lies
const fallbackSnsTopic = process.env.snsFallback;

function parsePayload (record) {
  try {
    let json = new Buffer(record.kinesis.data, 'base64').toString('utf8');
    console.log('decoded payload:', json);
    
    return JSON.parse(json);
  } catch (err) {
    console.error(`Failed to decode & JSON parse data [${record.kinesis.data}]. Skipped.`);
    return null;
  }
}

function getEvents (records) {
  if (!records || records.length === 0) {
    return [];
  }

  return records
    .map(r => parsePayload(r))
    .filter(p => p !== null && p !== undefined);
}

let publishToSns = co.wrap(function* (records) {
  for (let record of records) {
    let req = {
      Message: JSON.stringify(record),
      TopicArn: fallbackSnsTopic
    };

    yield sns.publish(req).promise();
  }
});

module.exports.handler = co.wrap(function* (event, context, callback) {
  console.log(JSON.stringify(event));

  let records = getEvents(event.Records);
  let failedRecords = [];
  let response = {
    successCount: 0,
    failureCount: 0
  };

  for (let record of records) {
    try {      
      lib.process(record);

      response.successCount++;
    } catch (err) {
      console.error(err);

      failedRecords.push(record);
      response.failureCount++;
    }
  }

  if (failedRecords.length > 0) {
    yield publishToSns(failedRecords);
  }

  callback(null, response);
});