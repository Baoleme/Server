const { throws } = require('./asyncAssert');
const assert = require('assert');
const FormData = require('form-data');
const ax = require('./ax')();
const db = require('../lib/db');
const testEmail = 'zchangan@163.com';

describe('Customer Order', async function () {
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
      name: '1234'
    });

    await ax.post('/dish', {
      'category_id': 1,
      'name': 'dish1',
      'price': 1,
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

    await ax.post('/table',
      ['1', '2', '3']);

    //await ax.delete('/restaurant/session');

    await ax.post('/customer/session', {
      code: 'xxxxxx'
    });
  });

  // post '/order'
  describe('Order', async function () {

    it('Missing Field', async function () {
      await throws(() => ax.post('/order', {
        price: 1,
        table: '1',
        dish: [
          {
            'dish_id': 1,
            'specifications': [
              0
            ],
            'count': 1
          }
        ],
        remark: 'Null'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'restaurant_id格式不正确');

      await throws(() => ax.post('/order', {
        restaurant_id: 1,
        table: '1',
        dish: [
          {
            'dish_id': 1,
            'specifications': [
              0
            ],
            'count': 1
          }
        ],
        remark: 'Null'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'price格式不正确');

      await throws(() => ax.post('/order', {
        restaurant_id: 1,
        price: 1,
        dish: [
          {
            'dish_id': 1,
            'specifications': [
              0
            ],
            'count': 1
          }
        ],
        remark: 'Null'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'table格式不正确');

      await throws(() => ax.post('/order', {
        restaurant_id: 1,
        price: 1,
        table: '10',
        remark: 'Null'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'dish格式不正确');
    });

    it('Restaurant id validation', async function () {
      await throws(() => ax.post('/order', {
        restaurant_id: -1,
        price: 1,
        table: '10',
        dish: [
          {
            'dish_id': 1,
            'specifications': [
              0
            ],
            'count': 1
          }
        ],
        remark: 'Null'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'restaurant_id格式不正确'
      );

      await throws(() => ax.post('/order', {
        restaurant_id: '1',
        price: 1,
        table: '10',
        dish: [
          {
            'dish_id': 1,
            'specifications': [
              0
            ],
            'count': 1
          }
        ],
        remark: 'Null'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'restaurant_id格式不正确'
      );
    });

    it('Table validation', async function () {
      await throws(() => ax.post('/order', {
        restaurant_id: 1,
        price: 1,
        table: 25,
        dish: [
          {
            'dish_id': 1,
            'specifications': [
              0
            ],
            'count': 1
          }
        ],
        remark: 'Null'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'table格式不正确');

      await throws(() => ax.post('/order', {
        restaurant_id: 1,
        price: 1,
        table: '1'.repeat(46),
        dish: [
          {
            'dish_id': 1,
            'specifications': [
              0
            ],
            'count': 1
          }
        ],
        remark: 'Null'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'table格式不正确');
    });

    it('Price validation', async function () {
      await throws(() => ax.post('/order', {
        restaurant_id: 1,
        price: -1,
        table: '10',
        dish: [
          {
            'dish_id': 1,
            'specifications': [
              0
            ],
            'count': 1
          }
        ],
        remark: 'Null'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'price格式不正确');

      await throws(() => ax.post('/order', {
        restaurant_id: 1,
        price: '1',
        table: '10',
        dish: [
          {
            'dish_id': 1,
            'specifications': [
              0
            ],
            'count': 1
          }
        ],
        remark: 'Null'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'price格式不正确');
    });

    it('Remark validation', async function () {
      await throws(() => ax.post('/order', {
        restaurant_id: 1,
        price: 1,
        table: '10',
        dish: [
          {
            'dish_id': 1,
            'specifications': [
              0
            ],
            'count': 1
          }
        ],
        remark: 1
      }), ({ response: r }) => r.status === 400 && r.data.message === 'remark格式不正确');
    });

    it('Dish validation', async function () {
      await throws(() => ax.post('/order', {
        restaurant_id: 1,
        price: 1,
        table: '10',
        dish: [
          {
            'dish_id': -1,
            'specifications': [
              0
            ],
            'count': 1
          }
        ],
        remark: 'Null'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'dish.dish_id格式不正确');

      await throws(() => ax.post('/order', {
        restaurant_id: 1,
        price: 1,
        table: '10',
        dish: [
          {
            'dish_id': 1,
            'specifications': [
              -1
            ],
            'count': 1
          }
        ],
        remark: 'Null'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'dish.specifications格式不正确');

      await throws(() => ax.post('/order', {
        restaurant_id: 1,
        price: 1,
        table: '10',
        dish: [
          {
            'dish_id': 1,
            'specifications': [
              0
            ],
            'count': 0
          }
        ],
        remark: 'Null'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'dish.count格式不正确');

      await throws(() => ax.post('/order', {
        restaurant_id: 1,
        price: 1,
        table: '10',
        dish: [
          {
            'dish_id': 1,
            'specifications': [
              0
            ],
            'count': 1,
            'price': 1
          }
        ],
        remark: 'Null'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'dish中有多余字段');
    });

    it('Order validation', async function () {

      // TODO:
      // 1. 确认菜品存在
      // 2. 确认菜品属于该餐厅
      // 3. 确认菜品正在销售
      // 4. 确认总价无误
      await ax.post('/order', {
        restaurant_id: 1,
        price: 1,
        table: '1',
        dish: [
          {
            'dish_id': 1,
            'specifications': [
              0
            ],
            'count': 1
          }
        ],
        remark: 'Null'
      });
    });
  });
  // get '/order'
  // describe('Get order lists', async function() {

  // });

  // get '/restaurant/{id}'
  describe('Get restaurant information', async function () {
    it('Restaurant id validation', async function () {
      await throws(
        () => ax.get('/restaurant/-1'),
        ({ response: r }) => r.status === 400 && r.data.message === 'id格式不正确'
      );
    });

    it('Get dish and restaurant information', async function () {
      const { data } = await ax.get('/restaurant/1');
      assert.deepStrictEqual(data, {
        confirm_email: false,
        description: null,
        email: testEmail,
        license_url: `http://localhost:8520/files/license/${testEmail}.docx`,
        logo_url: 'https://api.baoleme.andiedie.cn/files/default-logo.png',
        name: '1',
        phone: null,
        restaurant_id: 1
      });
    });
  });

  // get '/restaurant/{id}/table'
  describe('Get restaurant table lists', async function () {
    it('Restaurant id validation', async function () {
      await throws(
        () => ax.get('/restaurant/-1/table'),
        ({ response: r }) => r.status === 400 && r.data.message === 'id格式不正确'
      );
    });

    it('table lists validation', async function () {
      const { data } = await ax.get('/restaurant/1/table');
      assert.deepStrictEqual(data,
        ['1', '2', '3']
      );
    });
  });

  // post '/order/{id}/payment'
  describe('Payment', async function () {
    // await ax.delete('/customer/session');

    // await ax.post('/restaurant/session', {
    //   email: testEmail,
    //   password: '123456'
    // });

    // await throws(
    //   () => ax.post('/order/1', {
    //   state: 'accepted'
    // }), ({ response: r }) => console.log(r.data.message));

    // await ax.delete('/restaurant/session');

    // await ax.post('/customer/session', {
    //   code: 'xxxxxx'
    // });
    // 只允许是正数
    it('Positive order id', async function () {
      await throws(
        // {id}:1
        () => ax.post('/order/-1/payment', {
          code: 'xxxxxx'
        }),
        ({ response: r }) => r.status === 400 && r.data.message === 'id格式不正确');
    });

    it('Order id existence', async function () {
      await throws(
        // {id}:1
        () => ax.post('/order/3/payment', {
          code: 'xxxxxx'
        }),
        ({ response: r }) => r.status === 400 && r.data.message === '订单不存在');
    });

    it('Pay', async function () {

      await throws(
        () => ax.post('order/1/payment', {
        code: 'xxxxxx'
        }),
        ({ response: r }) => console.log(r.data.message));
    });
  });
});
