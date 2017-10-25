'use strict';

module.exports.process = (record) => {
  if (record.fail === true) {
    throw new Error("they made me do it...");
  }
};