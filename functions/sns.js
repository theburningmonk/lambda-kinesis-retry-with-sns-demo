'use strict';

const lib = require('./lib');   // <-- this is where the business logic lies

module.exports.handler = (event, context, callback) => {
  console.log(JSON.stringify(event));

  let record = JSON.parse(event.Records[0].Sns.Message);

  lib.process(record);
  
  callback(null, "ok");
};