const { throws } = require('./asyncAssert');
const assert = require('assert');
const FormData = require('form-data');
const ax = require('./ax')();
const db = require('../lib/db');
const server = require('../index');
const testEmail = 'zchangan@163.com';

describe('Restaurant Management Part3', async function () {
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

  // TODO
  // 1. 修改前、后category的数量是否相等
  // 2. category_id是否存在
  describe('Update category order', async function () {
    it('Category id validation', async function () {
      await throws(() => ax.put('/category', ['3', '1', '2']),
        ({ response: r }) => r.status === 400 && r.data.message === '参数格式不正确');

      await throws(() => ax.put('/category', [-3, 1, 0, -5]),
        ({ response: r }) => r.status === 400 && r.data.message === '参数格式不正确');
    });

    it('Correct usecase validation', async function () {
      ax.put('/category', [3, 1, 2]);
    });
  });

  // TODO
  // 1. category_id是否存在
  describe('Update category name', async function () {
    it('Category id validation', async function () {
      await throws(() => ax.put('/category/-1', {
          name: 'newCategory'
        }),
        ({ response: r }) => r.status === 400 && r.data.message === 'id格式不正确');

      await throws(() => ax.put('/category/abcd', {
          name: 'newCategory'
        }),
        ({ response: r }) => r.status === 400 && r.data.message === 'id格式不正确');
    });

    it('Category name validation', async function () {
      await throws(() => ax.put('/category/1', {
        name: 123
      }), ({ response: r }) => r.status === 400 && r.data.message === 'name格式不正确');

      await throws(() => ax.put('/category/1', {
        name: ''
      }), ({ response: r }) => r.status === 400 && r.data.message === 'name格式不正确');

      await throws(() => ax.put('/category/1', {
        name: '1'.repeat(46)
      }), ({ response: r }) => r.status === 400 && r.data.message === 'name格式不正确');
    });

    it('Correct usecase validation', async function () {
      ax.put('/category/1', {
        name: 'newCategory'
      });
    });
  });

  describe('Get order count', async function () {
    it ('Order count validation', async function () {
      const { data } = await ax.get('/restaurant/self/order/count');
      assert.deepStrictEqual(data, {
        created: 0,
        paid: 0,
        accepted: 0,
        cancelled: 0,
        completed: 0
      });
    });
  });

  // TODO
  // 1. get完整的列表
  describe('Get category and dish list', async function () {
    it('Category and dish list validation', async function () {
      const { data } =  await ax.get('/dish');
      assert.deepStrictEqual(data[0].restaurant_id, 1);
      assert.deepStrictEqual(data[0].category_id, 3);
      assert.deepStrictEqual(data[0].name, 'category3');
    });
   });

  // after(() => {
  //   server.end();
  // });
});
