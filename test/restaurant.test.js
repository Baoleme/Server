const { throws } = require('./asyncAssert');
const assert = require('assert');
const FormData = require('form-data');
const ax = require('./ax')();
const db = require('../lib/db');
const testEmail = 'zchangan@163.com';
// const server = require('../index');

describe('Restaurant Account', async function () {
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
  describe('Register', async function () {
    const regist = async info => {
      const form = new FormData();
      if (info.email) form.append('email', info.email);
      if (info.name) form.append('name', info.name);
      if (info.password) form.append('password', info.password);
      if (info.license) form.append('license', info.license, 'a.docx');
      return ax.post('/restaurant', form, {
        headers: form.getHeaders()
      });
    };
    it('Missing field', async function () {
      await throws(() => regist({
        name: 'testName',
        password: '~!@#$%'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'email格式不正确');
      await throws(() => regist({
        email: 'test@test.com',
        password: '~!@#$%'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'name格式不正确');
      await throws(() => regist({
        email: 'test@test.com',
        name: 'testName'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'password格式不正确');
    });

    it('Email validation', async function () {
      await regist({
        email: testEmail,
        name: '1',
        password: '123456',
        license: '123'
      });
      await throws(() => regist({
        email: '@',
        name: '1',
        password: '~!@#$%',
        license: '123'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'email格式不正确');
    });

    it('Email uniqueness', async function () {
      await throws(() => regist({
        email: testEmail,
        name: '1',
        password: '~!@#$%',
        license: '123'
      }), ({ response: r }) => r.status === 400 && r.data.message === '邮箱已经被使用');
    });

    it('Name validation', async function () {
      await regist({
        email: '2@test.com',
        name: '1'.repeat(45),
        password: '~!@#$%',
        license: '123'
      });
      await throws(() => regist({
        email: '3@test.com',
        name: '1'.repeat(46),
        password: '~!@#$%',
        license: '123'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'name格式不正确');
      await throws(() => regist({
        email: '3@test.com',
        name: '',
        password: '~!@#$%',
        license: '123'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'name格式不正确');
    });

    it('Password validation', async function () {
      await regist({
        email: '3@test.com',
        name: '1',
        password: '\\<>}{?',
        license: '123'
      });
      await throws(() => regist({
        email: '4@test.com',
        name: '1',
        password: '\\',
        license: '123'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'password格式不正确');
      await throws(() => regist({
        email: '4@test.com',
        name: '1',
        password: '0'.repeat(33),
        license: '123'
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
        ({ response: r }) => r.status === 400 && r.data.message === '请先登录餐厅账号'
      );
    });
    it('Get after login', async function () {
      await ax.post('/restaurant/session', {
        email: '3@test.com',
        password: '\\<>}{?'
      });
      const { data } = await ax.get('/restaurant/self');
      assert.deepStrictEqual(data, {
        confirm_email: false,
        description: null,
        email: '3@test.com',
        license_url: 'http://localhost:8520/files/license/3@test.com.docx',
        logo_url: 'https://api.baoleme.andiedie.cn/files/default-logo.png',
        name: '1',
        phone: null,
        restaurant_id: 3,
        address: null
      });
    });
  });

  describe('Send Confirm Email', async function () {
    it('Send before login', async function () {
      await ax.delete('/restaurant/session');
      await throws(
        () => ax.post('/restaurant/emailConfirm'),
        ({ response: r }) => r.status === 400 && r.data.message === '请先登录餐厅账号'
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
      const link = require('../app/service/restaurantAccount').getLastLink();
      await ax.get(link);
      const { data } = await ax.get('/restaurant/self');
      assert.deepStrictEqual(data, {
        restaurant_id: 1,
        email: testEmail,
        confirm_email: true,
        name: '1',
        description: null,
        license_url: `http://localhost:8520/files/license/${testEmail}.docx`,
        logo_url: 'https://api.baoleme.andiedie.cn/files/default-logo.png',
        phone: null,
        address: null
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
      const link = require('../app/service/restaurantAccount').getLastLink();
      await throws(
        () => ax.get(link),
        ({ response: r }) => r.status === 400 && r.data.message === '邮箱已经激活，请勿重复操作'
      );
    });
  });

  describe('Modify Restaurant information', async function () {
    // const update = async info => {
    //   const form = new FormData();
    //   if (info.phone) form.append('phone', info.phone);
    //   if (info.name) form.append('name', info.name);
    //   if (info.password) form.append('password', info.password);
    //   if (info.address) form.append('address', info.address);
    //   if (info.logo_url) form.append('logo_url', info.logo_url);
    //   if (info.description) form.append('description', info.description);
    //   return ax.put('/restaurant/self', form, {
    //     headers: form.getHeaders()
    //   });
    // };

    it('Password Validation', async function () {
      await throws(
        () => ax.put('/restaurant/self/', {
          password: '\\'
        }), ({ response: r }) => r.status === 400 && r.data.message === 'password格式不正确');

      await throws(
        () => ax.put('/restaurant/self/', {
          password: 1
        }), ({ response: r }) => r.status === 400 && r.data.message === 'password格式不正确');
    });

    it('Name Validation', async function () {
      await throws(
        () => ax.put('/restaurant/self/', {
          name: 111
        }), ({ response: r }) => r.status === 400 && r.data.message === 'name格式不正确');
    });

    it('Logo_url Validation', async function () {
      await throws(
        () => ax.put('/restaurant/self/', {
          logo_url: 111
        }), ({ response: r }) => r.status === 400 && r.data.message === 'logo_url格式不正确');
    });

    it('Description Validation', async function () {
      await throws(
        () => ax.put('/restaurant/self/', {
          description: 111
        }), ({ response: r }) => r.status === 400 && r.data.message === 'description格式不正确');
    });

    it('Phone Validation', async function () {
      await throws(
        () => ax.put('/restaurant/self/', {
          phone: 111
        }), ({ response: r }) => r.status === 400 && r.data.message === 'phone格式不正确');

      await throws(
        () => ax.put('/restaurant/self/', {
          phone: '1xxx'
        }), ({ response: r }) => r.status === 400 && r.data.message === 'phone格式不正确');
    });

    it('Address Validation', async function () {
      await throws(
        () => ax.put('/restaurant/self/', {
          address: 111
        }), ({ response: r }) => r.status === 400 && r.data.message === 'address格式不正确');
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

  // after(() => {
  //   server.end();
  // });
});
