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
          'name': 'spe1',
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

    // await ax.post('/qrcode',
    //   ['1', '2', '3']);

    await ax.delete('/restaurant/session');

    await ax.post('/customer/session', {
      code: 'xxxxxx'
    });
  });

  // post '/order'
  // not pass
  describe('Order', async function () {
    it('Missing Field', async function () {
      await throws(() => ax.post('/order', {
        price: 1,
        table: '1',
        dish: [
          {
            dish_id: 1,
            specifications: [
              0
            ],
            count: 1
          }
        ],
        remark: 'Null'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'restaurant_id格式不正确');

      await throws(() => ax.post('/order', {
        restaurant_id: 1,
        table: '1',
        dish: [
          {
            dish_id: 1,
            specifications: [
              0
            ],
            count: 1
          }
        ],
        remark: 'Null'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'price格式不正确');

      await throws(() => ax.post('/order', {
        restaurant_id: 1,
        price: 1,
        dish: [
          {
            dish_id: 1,
            specifications: [
              0
            ],
            count: 1
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
            dish_id: 1,
            specifications: [
              0
            ],
            count: 1
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
            dish_id: 1,
            specifications: [
              0
            ],
            count: 1
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
            dish_id: 1,
            specifications: [
              0
            ],
            count: 1
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
            dish_id: 1,
            specifications: [

            ],
            count: 1
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
            dish_id: 1,
            specifications: [
              0
            ],
            count: 1
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
            dish_id: 1,
            specifications: [
              0
            ],
            count: 1
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
            dish_id: 1,
            specifications: [
              0
            ],
            count: 1
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
            dish_id: -1,
            specifications: [
              0
            ],
            count: 1
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
            dish_id: 1,
            specifications: [
              -1
            ],
            count: 1
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
            dish_id: 1,
            specifications: [
              0
            ],
            count: 0
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
            dish_id: 1,
            specifications: [
              0
            ],
            count: 1,
            price: 1
          }
        ],
        remark: 'Null'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'dish中有多余字段');
    });

    /* it('Order validation', async function () {
      // TODO:
      // 2. 确认菜品属于该餐厅
      // 3. 确认菜品正在销售
      await ax.post('/order', {
        restaurant_id: 1,
        price: 1,
        table: '1',
        dish: [
          {
            dish_id: 1,
            specifications: [
              0
            ],
            count: 1
          }
        ],
        remark: 'Null'
      });

      await ax.post('/order', {
        restaurant_id: 1,
        price: 1,
        table: '2',
        dish: [
          {
            dish_id: 1,
            specifications: [
              0
            ],
            count: 1
          }
        ],
        remark: 'Nothing'
      });

      await throws(() => ax.post('/order', {
        restaurant_id: 1,
        price: 2,
        table: '1',
        dish: [
          {
            dish_id: 1,
            specifications: [
              0
            ],
            count: 1
          }
        ],
        remark: 'Nothing'
      }), ({ response: r }) => r.status === 400 && r.data.message === '价格错误，应该为1');

      await throws(() => ax.post('/order', {
        restaurant_id: 1,
        price: 1,
        table: 'ss',
        dish: [
          {
            dish_id: 1,
            specifications: [
              0
            ],
            count: 1
          }
        ],
        remark: 'Nothing'
      }), ({ response: r }) => r.status === 400 && r.data.message === '桌号不存在');

      await throws(() => ax.post('/order', {
        restaurant_id: 1,
        price: 1,
        table: '2',
        dish: [
          {
            dish_id: 3,
            specifications: [
              0
            ],
            count: 1
          }
        ],
        remark: 'Nothing'
      }), ({ response: r }) => r.status === 400 && r.data.message === '菜品3不存在');
    }); */
  });

  // post '/order/{id}/payment'
  describe('Payment', async function () {
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
        () => ax.post('/order/3/payment', {
          code: 'xxxxxx'
        }),
        ({ response: r }) => r.status === 400 && r.data.message === '订单不存在');
    });
    // TODO
    /* it('Pay', async function () {
      await ax.post('order/1/payment', {
          code: 'xxxxxx'
      });
    }); */
  });
  // get '/order'
  describe('Get order lists', async function () {
    it('page number validation', async function () {
      await throws(() => ax.get('/order', {
        params: {
          page: -1,
          number: 1
        }
      }), ({ response: r }) => r.status === 400 && r.data.message === 'page格式不正确');
    });

    it('Positive number validation', async function () {
      await throws(() => ax.get('/order', {
        params: {
          page: 1,
          number: -1
        }
      }), ({ response: r }) => r.status === 400 && r.data.message === 'number格式不正确');
    });

    // TODO
    /* it('order lists validation', async function () {
      const { data } = await ax.get('/order', {
        params: {
          page: 0,
          number: 1
        }
      });
      assert.deepStrictEqual(data[0].order_id, 2);
      assert.deepStrictEqual(data[0].price, 1);
      assert.deepStrictEqual(data[0].table, '2');
      assert.deepStrictEqual(data[0].payment, null);
      assert.deepStrictEqual(data[0].dish, [{
              count: 1,
              image_url: "string",
              name: "dish1",
              price: 1,
              specifications: "string"
            }]);
      assert.deepStrictEqual(data[0].remark, 'Nothing');
      assert.deepStrictEqual(data[0].customer, {
        customer_id: 1
      });
      assert.deepStrictEqual(data[0].restaurant, {
        email: testEmail,
        confirm_email: 0,
        name: '1',
        logo_url: 'https://api.baoleme.andiedie.cn/files/default-logo.png',
        description: null,
        phone: null,
        license_url: 'http://localhost:8520/files/license/zchangan@163.com.docx',
        restaurant_id: 1
      });
      assert.deepStrictEqual(data[0].remark, 'Nothing');
      assert.deepStrictEqual(data[0].remark, 'Nothing');
    }); */
  });

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
        restaurant_id: 1,
        address: null,
        dish: [
          {
            category_id: 1,
            dish: [
              {
                category_id: 1,
                description: 'string',
                dish_id: 1,
                image_url: [
                  'string'
                ],
                name: 'dish1',
                price: 1,
                restaurant_id: 1,
                selling: true,
                specifications: [
                  {
                    default: 0,
                    name: 'spe1',
                    options: [
                      {
                        delta: 0,
                        name: 'string'
                      }
                    ],
                    require: true
                  }
                ],
                spicy: 0,
                tag: [
                  'string'
                ]
              }
            ],
            name: '1234',
            restaurant_id: 1
          }
        ]
      });
    });
  });

  // get '/restaurant/{id}/table' 转交给restaurant测试
  /* describe('Get restaurant table lists', async function () {
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
  }); */
});
