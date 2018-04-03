const assert = require('assert');

exports.throws = async (block, error, message) => {
  let fn = () => { };
  try {
    await block();
  } catch (e) {
    fn = () => {
      throw e;
    };
  }
  assert.throws(fn, error, message);
};

exports.doesNotThrow = async (block, error, message) => {
  let fn = () => { };
  try {
    await block();
  } catch (e) {
    fn = () => {
      throw e;
    };
  }
  assert.doesNotThrow(fn, error, message);
};
