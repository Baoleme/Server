const { throws } = require('./asyncAssert');
const assert = require('assert');
const ax = require('./ax')();
const db = require('../lib/db');

describe('Customer Account', async function () {
  before(async () => {
    await db.transaction(async query => {
      const tables = await query('SHOW TABLES');
      for (const table of tables) {
        const tableName = [Object.values(table)[0]];
        await query('DELETE FROM ??', tableName);
        await query('ALTER TABLE ?? AUTO_INCREMENT = 1', tableName);
      }
    });
  });
  describe('Login', async function () {
    it('Missing field', async function () {
      await throws(
        () => ax.post('/customer/session'),
        ({ response: r }) => r.status === 400 && r.data.message === 'code格式不正确'
      );
    });

    it('Wrong code', async function () {
      process.env.NODE_ENV = 'development';
      await throws(
        () => ax.post('/customer/session', {
          code: 'wrong'
        }),
        ({ response: r }) => r.status === 400 && r.data.message === '获取Openid失败'
      );
      process.env.NODE_ENV = 'test';
    });

    it('Rigist', async function () {
      await ax.post('/customer/session', {
        code: 'xxxxxx'
      });
    });

    it('Login', async function () {
      await ax.post('/customer/session', {
        code: 'xxxxxx'
      });
    });
  });
  describe('Logout', async function () {
    it('Logout after login', async function () {
      await ax.delete('/customer/session');
    });

    it('Logout before login', async function () {
      await ax.delete('/customer/session');
    });
  });
  describe('Get Self Information', async function () {
    it('Get before login', async function () {
      await throws(
        () => ax.get('/customer/self'),
        ({ response: r }) => r.status === 400 && r.data.message === '请先登录客户账号'
      );
    });

    it('Get after login', async function () {
      await ax.post('/customer/session', {
        code: 'xxxxxx'
      });
      const { data } = await ax.get('/customer/self');
      assert.deepStrictEqual(data, {
        customer_id: 1,
        openid: 'xxxxxx'
      });
    });
  });
});
