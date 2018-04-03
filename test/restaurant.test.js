const { throws } = require('./asyncAssert');
const assert = require('assert');
const ax = require('./ax')();
const db = require('../lib/db');
const server = require('../index');
const testEmail = 'zchangan@163.com';

describe('Restaurant Account', async function () {
  before(async () => {
    await db.transaction(async (query) => {
      const tables = await query('SHOW TABLES');
      for (const table of tables) {
        await query('TRUNCATE TABLE ??', [Object.values(table)[0]]);
      }
    });
  });
  describe('Register', async function () {
    it('Missing field', async function () {
      await throws(() => ax.post('/restaurant', {
        name: 'testName',
        password: '~!@#$%'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'email格式不正确');
      await throws(() => ax.post('/restaurant', {
        email: 'test@test.com',
        password: '~!@#$%'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'name格式不正确');
      await throws(() => ax.post('/restaurant', {
        email: 'test@test.com',
        name: 'testName'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'password格式不正确');
    });

    it('Email validation', async function () {
      await ax.post('/restaurant', {
        email: testEmail,
        name: '1',
        password: '123456'
      });
      await throws(() => ax.post('/restaurant', {
        email: '@',
        name: '1',
        password: '~!@#$%'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'email格式不正确');
    });

    it('Email uniqueness', async function () {
      await throws(() => ax.post('/restaurant', {
        email: testEmail,
        name: '1',
        password: '~!@#$%'
      }), ({ response: r }) => r.status === 400 && r.data.message === '邮箱已经被使用');
    });

    it('Name validation', async function () {
      await ax.post('/restaurant', {
        email: '2@test.com',
        name: '1'.repeat(50),
        password: '~!@#$%'
      });
      await throws(() => ax.post('/restaurant', {
        email: '3@test.com',
        name: '1'.repeat(51),
        password: '~!@#$%'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'name格式不正确');
      await throws(() => ax.post('/restaurant', {
        email: '3@test.com',
        name: '',
        password: '~!@#$%'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'name格式不正确');
    });

    it('Password validation', async function () {
      await ax.post('/restaurant', {
        email: '3@test.com',
        name: '1',
        password: '\\<>}{?'
      });
      await throws(() => ax.post('/restaurant', {
        email: '4@test.com',
        name: '1',
        password: '\\'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'password格式不正确');
      await throws(() => ax.post('/restaurant', {
        email: '4@test.com',
        name: '1',
        password: '0'.repeat(33)
      }), ({ response: r }) => r.status === 400 && r.data.message === 'password格式不正确');
    });
  });

  describe('Login', async function () {
    it('Missing field', async function () {
      await throws(() => ax.post('/restaurant/session', {
        password: '~!@#$%'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'email格式不正确');
      await throws(() => ax.post('/restaurant/session', {
        email: 'test@test.com'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'password格式不正确');
    });

    it('Email validation', async function () {
      await ax.post('/restaurant/session', {
        email: '2@test.com',
        password: '~!@#$%'
      });
      await throws(() => ax.post('/restaurant/session', {
        email: '@',
        password: '~!@#$%'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'email格式不正确');
    });

    it('Password validation', async function () {
      await ax.post('/restaurant/session', {
        email: '3@test.com',
        password: '\\<>}{?'
      });
      await throws(() => ax.post('/restaurant/session', {
        email: '4@test.com',
        password: '\\'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'password格式不正确');
      await throws(() => ax.post('/restaurant/session', {
        email: '4@test.com',
        password: '0'.repeat(33)
      }), ({ response: r }) => r.status === 400 && r.data.message === 'password格式不正确');
    });
  });

  describe('Get Self Information', async function () {
    it('Get before login', async function () {
      await ax.delete('/restaurant/session');
      await throws(
        () => ax.get('/restaurant/self'),
        ({ response: r }) => r.status === 400 && r.data.message === '请先登录'
      );
    });
    it('Get after login', async function () {
      await ax.post('/restaurant/session', {
        email: '3@test.com',
        password: '\\<>}{?'
      });
      const { data } = await ax.get('/restaurant/self');
      assert.deepStrictEqual(data, {
        restaurant_id: 3,
        email: '3@test.com',
        confirm_email: false,
        name: '1'
      });
    });
  });

  describe('Send Confirm Email', async function () {
    it('Send before login', async function () {
      await ax.delete('/restaurant/session');
      await throws(
        () => ax.post('/restaurant/emailConfirm'),
        ({ response: r }) => r.status === 400 && r.data.message === '请先登录'
      );
    });
    it('Send after login', async function () {
      await ax.post('/restaurant/session', {
        email: testEmail,
        password: '123456'
      });
      await ax.post('/restaurant/emailConfirm');
    });
  });

  describe('Confirm email', async function () {
    it('Missing field', async function () {
      await throws(
        () => ax.get('/restaurant/emailConfirm'),
        ({ response: r }) => r.status === 400 && r.data.message === 'cipher格式不正确'
      );
    });
    it('With wrong cipher', async function () {
      await throws(
        () => ax.get('/restaurant/emailConfirm', {
          params: {
            cipher: 'aaa'
          }
        }),
        ({ response: r }) => r.status === 400 && r.data.message === '错误的验证信息'
      );
    });
    it('With right cipher', async function () {
      const link = require('../app/service/restaurant').getLastLink();
      await ax.get(link);
      const { data } = await ax.get('/restaurant/self');
      assert.deepStrictEqual(data, {
        restaurant_id: 1,
        email: testEmail,
        confirm_email: true,
        name: '1'
      });
    });
  });

  describe('Duplicated email confirm', async function () {
    it('Duplicated sending', async function () {
      await throws(
        () => ax.post('/restaurant/emailConfirm'),
        ({ response: r }) => r.status === 400 && r.data.message === '邮箱已经激活，请勿重复操作'
      );
    });
    it('Duplicated confirming', async function () {
      const link = require('../app/service/restaurant').getLastLink();
      await throws(
        () => ax.get(link),
        ({ response: r }) => r.status === 400 && r.data.message === '邮箱已经激活，请勿重复操作'
      );
    });
  });

  describe('Logout', async function () {
    it('Logout after login', async function () {
      await ax.post('/restaurant/session', {
        email: '3@test.com',
        password: '\\<>}{?'
      });
      await ax.delete('/restaurant/session');
    });
    it('Logout before login', async function () {
      await ax.delete('/restaurant/session');
    });
  });

  after(() => {
    server.end();
  });
});
