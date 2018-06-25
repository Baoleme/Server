const { throws } = require('./asyncAssert');
const assert = require('assert');
const FormData = require('form-data');
const ax = require('./ax')();
const db = require('../lib/db');
const server = require('../index');
const testEmail = 'zchangan@163.com';

describe.only('Restaurant Management', async function () {
  before(async () => {
    await db.transaction(async query => {
      const tables = await query('SHOW TABLES');
      for (const table of tables) {
        const tableName = [Object.values(table)[0]];
        await query('DELETE FROM ??', tableName);
        await query('ALTER TABLE ?? AUTO_INCREMENT = 1', tableName);
      }
    });

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

    await regist({
      email: testEmail,
      name: '1',
      password: '123456',
      license: '123'
    });

    await ax.post('/restaurant/session', {
      email: testEmail,
      password: '123456'
    });

    await ax.post('/category', {
      name: 'category1'
    });

    await ax.post('/category', {
      name: 'category2'
    });

    await ax.post('/category', {
      name: 'category3'
    });

    await ax.post('/dish', {
     'category_id': 1,
     'name': 'dish',
     'price': 123,
     'spicy': 0,
     'specifications': [
       {
         'name': 'string',
         'require': true,
         'default': 0,
         'options': [
           {
             'name': 'string',
             'delta': 0
           }
         ]
       }
     ],
     'image_url': [
       'string'
     ],
     'description': 'string',
     'tag': [
       'string'
     ]
   });

  });

  describe('Add table', async function () {
    it ('String validation', async function () {
      await ax.post('/table', ['中山大学']);
    });
    it ('String validation', async function () {
      await throws(() => ax.post('/table', 0),
      ({ response: r }) => r.status === 400 && r.data.message === '数组格式不正确');
    });
    it ('String validation', async function () {
      await throws(() => ax.post('/table', 'saa'),
      ({ response: r }) => r.status === 400 && r.data.message === '数组格式不正确');
    });
  });

  describe('Delete table', async function () {
    it('table id validation', async function () {
      await throws(() => ax.delete('/table', 1),
        ({ response: r }) => r.status === 400 && r.data.message === '数组格式不正确');

      await throws(() => ax.delete('/table', -1),
        ({ response: r }) => r.status === 400 && r.data.message === '数组格式不正确');
    });
  });

  after(() => {
    server.end();
  });
});
