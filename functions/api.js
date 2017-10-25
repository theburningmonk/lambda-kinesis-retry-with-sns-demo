'use strict';

const _       = require('lodash');
const co      = require('co');
const AWS     = require('aws-sdk');
const kinesis = new AWS.Kinesis();

const stream  = process.env.stream;

module.exports.handler = co.wrap(function* (event, context, callback) {
  console.log(JSON.stringify(event));

  let fail = _.get(event, "queryStringParameters.fail", "false").toLowerCase() === "true";

  let req = {
    Data: JSON.stringify({ fail }),
    PartitionKey: "hellow",
    StreamName: stream
  };

  yield kinesis.putRecord(req).promise();

  let response = {
    statusCode: 200,
    body: JSON.stringify({})
  };

  callback(null, response);
});