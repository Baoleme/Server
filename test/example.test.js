const assert = require('assert');

describe('Module', async function () {
  describe('function', async function () {
    it('case', async function () {
      const a = await new Promise((resolve, reject) => {
        resolve(1);
      });
      assert(a === 2);
    });
  });
});
