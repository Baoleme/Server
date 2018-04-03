const { throws } = require('./asyncAssert');
const assert = require('assert');
const ax = require('./ax')();
const db = require('../lib/db');
const server = require('../index');

describe('Restaurant Account', async function () {
  before(async () => {
    await db.transaction(async (query) => {
      const tables = await query('SHOW TABLES');
      for (const table of tables) {
        await query('TRUNCATE TABLE ??', [Object.values(table)[0]]);
      }
    });
  });
  describe('Restaurant Register', async function () {
    it('Missing Field', async function () {
      await throws(() => ax.post('http://localhost:8520/restaurant', {
        name: 'testName',
        password: '~!@#$%'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'email格式不正确');
      await throws(() => ax.post('http://localhost:8520/restaurant', {
        email: 'test@test.com',
        password: '~!@#$%'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'name格式不正确');
      await throws(() => ax.post('http://localhost:8520/restaurant', {
        email: 'test@test.com',
        name: 'testName'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'password格式不正确');
    });

    it('Email Validation', async function () {
      await ax.post('http://localhost:8520/restaurant', {
        email: '1@test.com',
        name: '1',
        password: '~!@#$%'
      });
      await throws(() => ax.post('http://localhost:8520/restaurant', {
        email: '@',
        name: '1',
        password: '~!@#$%'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'email格式不正确');
    });

    it('Email Uniqueness', async function () {
      await throws(() => ax.post('http://localhost:8520/restaurant', {
        email: '1@test.com',
        name: '1',
        password: '~!@#$%'
      }), ({ response: r }) => r.status === 400 && r.data.message === '邮箱已经被使用');
    });

    it('Name Validation', async function () {
      await ax.post('http://localhost:8520/restaurant', {
        email: '2@test.com',
        name: '1'.repeat(50),
        password: '~!@#$%'
      });
      await throws(() => ax.post('http://localhost:8520/restaurant', {
        email: '3@test.com',
        name: '1'.repeat(51),
        password: '~!@#$%'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'name格式不正确');
      await throws(() => ax.post('http://localhost:8520/restaurant', {
        email: '3@test.com',
        name: '',
        password: '~!@#$%'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'name格式不正确');
    });

    it('Password Validation', async function () {
      await ax.post('http://localhost:8520/restaurant', {
        email: '3@test.com',
        name: '1',
        password: '\\<>}{?'
      });
      await throws(() => ax.post('http://localhost:8520/restaurant', {
        email: '4@test.com',
        name: '1',
        password: '\\'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'password格式不正确');
      await throws(() => ax.post('http://localhost:8520/restaurant', {
        email: '4@test.com',
        name: '1',
        password: '0'.repeat(33)
      }), ({ response: r }) => r.status === 400 && r.data.message === 'password格式不正确');
    });
  });

  describe('Restaurant Login', async function () {
    it('Missing Field', async function () {
      await throws(() => ax.post('http://localhost:8520/restaurant/session', {
        password: '~!@#$%'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'email格式不正确');
      await throws(() => ax.post('http://localhost:8520/restaurant/session', {
        email: 'test@test.com'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'password格式不正确');
    });

    it('Email Validation', async function () {
      await ax.post('http://localhost:8520/restaurant/session', {
        email: '1@test.com',
        password: '~!@#$%'
      });
      await throws(() => ax.post('http://localhost:8520/restaurant/session', {
        email: '@',
        password: '~!@#$%'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'email格式不正确');
    });

    it('Password Validation', async function () {
      await ax.post('http://localhost:8520/restaurant/session', {
        email: '3@test.com',
        password: '\\<>}{?'
      });
      await throws(() => ax.post('http://localhost:8520/restaurant/session', {
        email: '4@test.com',
        password: '\\'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'password格式不正确');
      await throws(() => ax.post('http://localhost:8520/restaurant/session', {
        email: '4@test.com',
        password: '0'.repeat(33)
      }), ({ response: r }) => r.status === 400 && r.data.message === 'password格式不正确');
    });
  });

  describe('Get Restaurant Self Information', async function () {
    it('Get after login', async function () {
      await ax.post('http://localhost:8520/restaurant/session', {
        email: '3@test.com',
        password: '\\<>}{?'
      });
      const { data } = await ax.get('http://localhost:8520/restaurant/self');
      assert.deepStrictEqual(data, {
        restaurant_id: 3,
        email: '3@test.com',
        confirm_email: false,
        name: '1'
      });
    });
    it('Get after logout', async function () {
      await ax.delete('http://localhost:8520/restaurant/session');
      await throws(
        () => ax.get('http://localhost:8520/restaurant/self'),
        ({ response: r }) => r.status === 400 && r.data.message === '请先登录'
      );
    });
  });

  describe('Restaurant Logout', async function () {
    it('Logout with login status', async function () {
      await ax.post('http://localhost:8520/restaurant/session', {
        email: '3@test.com',
        password: '\\<>}{?'
      });
      await ax.delete('http://localhost:8520/restaurant/session');
    });
    it('Logout without login status', async function () {
      await ax.delete('http://localhost:8520/restaurant/session');
    });
  });

  after(() => {
    server.end();
  });
});
