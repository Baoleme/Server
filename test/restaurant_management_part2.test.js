const { throws } = require('./asyncAssert');
const assert = require('assert');
const FormData = require('form-data');
const ax = require('./ax')();
const db = require('../lib/db');
const server = require('../index');
const testEmail = 'zchangan@163.com';

describe('Restaurant Management Part2', async function () {
  before(async () => {
    await db.transaction(async query => {
      const tables = await query('SHOW TABLES');
      for (const table of tables) {
        const tableName = [Object.values(table)[0]];
        await query('DELETE FROM ??', tableName);
        await query('ALTER TABLE ?? AUTO_INCREMENT = 1', tableName);
      }
    });

    const regist_1 = async info => {
      const form = new FormData();
      if (info.email) form.append('email', info.email);
      if (info.name) form.append('name', info.name);
      if (info.password) form.append('password', info.password);
      if (info.license) form.append('license', info.license, 'a.docx');
      return ax.post('/restaurant', form, {
        headers: form.getHeaders()
      });
    };

    await regist_1({
      email: '123456@163.com',
      name: '2',
      password: '123456789',
      license: '123456'
    });

    await ax.post('/restaurant/session', {
      email: '123456@163.com',
      password: '123456789'
    });

    // 添加菜品分类
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
      'name': 'dish1',
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

  describe('Add dish', async function () {
    it ('Missing field', async function () {
      await throws(() => ax.post('/dish', {
        name: 'abcd',
        price: 123
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'category_id格式不正确');

      await throws(() => ax.post('/dish', {
        category_id: 1,
        price: 123
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'name格式不正确');

      await throws(() => ax.post('/dish', {
        category_id: 1,
        name: 'abcd'
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'price格式不正确');
    });

    it ('Category id validation', async function () {
      await throws(() => ax.post('/dish', {
        category_id: -1,
        name: 'abcd',
        price: 123
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'category_id格式不正确');

      await throws(() => ax.post('/dish', {
        category_id: "string",
        name: 'abcd',
        price: 123
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'category_id格式不正确');

      await throws(() => ax.post('/dish', {
        category_id: 100,
        name: 'abcd',
        price: 123
      }),
      ({ response: r }) => r.status === 400 && r.data.message === '分类不存在');
    });

    it ('Name validation', async function () {
      await throws(() => ax.post('/dish', {
        category_id: 1,
        name: 123,
        price: 123
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'name格式不正确');

      await throws(() => ax.post('/dish', {
        category_id: 1,
        name: '',
        price: 123
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'name格式不正确');

      await throws(() => ax.post('/dish', {
        category_id: 1,
        name: '1'.repeat(46),
        price: 123
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'name格式不正确');
    });

    it ('Price validation', async function () {
      await throws(() => ax.post('/dish', {
        category_id: 1,
        name: "abcd",
        price: "string"
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'price格式不正确');
    });

    it ('Spicy validation', async function () {
      await throws(() => ax.post('/dish', {
        category_id: 1,
        name: "abcd",
        price: 123,
        spicy: -10
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'spicy格式不正确');

      await throws(() => ax.post('/dish', {
        category_id: 1,
        name: "abcd",
        price: 123,
        spicy: "abcd"
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'spicy格式不正确');
    });

    it ('Image url validation', async function () {
      await throws(() => ax.post('/dish', {
        category_id: 1,
        name: "abcd",
        price: 123,
        image_url: "string"
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'image_url格式不正确');

      await throws(() => ax.post('/dish', {
        category_id: 1,
        name: "abcd",
        price: 123,
        image_url: [
          123, 456, 789
        ]
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'image_url格式不正确');
    });

    it ('Description validation', async function () {
      await throws(() => ax.post('/dish', {
        category_id: 1,
        name: "abcd",
        price: 123,
        description: 123456
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'description格式不正确');
    });

    it ('Tag validation', async function () {
      await throws(() => ax.post('/dish', {
        category_id: 1,
        name: "abcd",
        price: 123,
        tag: "string"
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'tag格式不正确');

      await throws(() => ax.post('/dish', {
        category_id: 1,
        name: "abcd",
        price: 123,
        tag: [
          123, 456, 789
        ]
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'tag格式不正确');
    });

    it ('Specifications name validation', async function () {
      await throws(() => ax.post('/dish', {
        category_id: 1,
        name: "abcd",
        price: 123,
        specifications: [
          {
            "name": 123,
            "require": true,
            "default": 0,
            "options": [
              {
                "name": "option",
                "delta": 0
              }
            ]
          }
        ]
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'specifications.name格式不正确');

      await throws(() => ax.post('/dish', {
        category_id: 1,
        name: "abcd",
        price: 123,
        specifications: [
          {
            "name": '1'.repeat(46),
            "require": true,
            "default": 0,
            "options": [
              {
                "name": "option",
                "delta": 0
              }
            ]
          }
        ]
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'specifications.name格式不正确');

      await throws(() => ax.post('/dish', {
        category_id: 1,
        name: "abcd",
        price: 123,
        specifications: [
          {
            "name": '',
            "require": true,
            "default": 0,
            "options": [
              {
                "name": "option",
                "delta": 0
              }
            ]
          }
        ]
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'specifications.name格式不正确');
    });

    it ('Specifications require validation', async function () {
      await throws(() => ax.post('/dish', {
        category_id: 1,
        name: "abcd",
        price: 123,
        specifications: [
          {
            "name": "dish1",
            "require": 100,
            "default": 0,
            "options": [
              {
                "name": "option",
                "delta": 0
              }
            ]
          }
        ]
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'specifications.require格式不正确');

      await throws(() => ax.post('/dish', {
        category_id: 1,
        name: "abcd",
        price: 123,
        specifications: [
          {
            "name": "dish1",
            "require": "yes",
            "default": 0,
            "options": [
              {
                "name": "option",
                "delta": 0
              }
            ]
          }
        ]
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'specifications.require格式不正确');
    });

    it ('Specifications default validation', async function () {
      await throws(() => ax.post('/dish', {
        category_id: 1,
        name: "abcd",
        price: 123,
        specifications: [
          {
            "name": "dish1",
            "require": true,
            "default": -100,
            "options": [
              {
                "name": "option",
                "delta": 0
              }
            ]
          }
        ]
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'specifications.default格式不正确');

      await throws(() => ax.post('/dish', {
        category_id: 1,
        name: "abcd",
        price: 123,
        specifications: [
          {
            "name": "dish1",
            "require": true,
            "default": "abc",
            "options": [
              {
                "name": "option",
                "delta": 0
              }
            ]
          }
        ]
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'specifications.default格式不正确');
    });

    it ('Specifications options validation', async function () {
      await throws(() => ax.post('/dish', {
        category_id: 1,
        name: "abcd",
        price: 123,
        specifications: [
          {
            "name": "dish1",
            "require": true,
            "default": 0,
            "options": [
              {
                "name": 123,
                "delta": 0
              }
            ]
          }
        ]
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'specifications.options.name格式不正确');

      await throws(() => ax.post('/dish', {
        category_id: 1,
        name: "abcd",
        price: 123,
        specifications: [
          {
            "name": "dish1",
            "require": true,
            "default": 0,
            "options": [
              {
                "name": '1'.repeat(46),
                "delta": 0
              }
            ]
          }
        ]
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'specifications.options.name格式不正确');

      await throws(() => ax.post('/dish', {
        category_id: 1,
        name: "abcd",
        price: 123,
        specifications: [
          {
            "name": "dish1",
            "require": true,
            "default": 0,
            "options": [
              {
                "name": '',
                "delta": 0
              }
            ]
          }
        ]
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'specifications.options.name格式不正确');

      await throws(() => ax.post('/dish', {
        category_id: 1,
        name: "abcd",
        price: 123,
        specifications: [
          {
            "name": "dish1",
            "require": true,
            "default": 0,
            "options": [
              {
                "name": "option",
                "delta": "string"
              }
            ]
          }
        ]
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'specifications.options.delta格式不正确');
    });

    it('Correct usecase validation', async function () {
      ax.post('/dish', {
        category_id: 1,
        name: "abcd",
        price: 123,
        spicy: 0,
        specifications: [
          {
            "name": "dish1",
            "require": true,
            "default": 0,
            "options": [
              {
                "name": "option",
                "delta": 0
              }
            ]
          }
        ],
        image_url: [
          'string'
        ],
        description: 'string',
        tag: [
          'string'
        ]
      });
    });
  });

  describe('Update dish', async function () {
    it ('Dish id validation', async function () {
      await throws(() => ax.put('/dish/-1'),
        ({ response: r }) => r.status === 400 && r.data.message === 'id格式不正确');

      await throws(() => ax.put('/dish/abcd'),
        ({ response: r }) => r.status === 400 && r.data.message === 'id格式不正确');

      await throws(() => ax.put('/dish/5', {
        category_id: 4,
        name: "newName"
      }),
       ({ response: r }) => r.status === 400 && r.data.message === '菜品不存在');
    });

    it ('Category id validation', async function () {
      await throws(() => ax.put('/dish/2', {
        category_id: -1
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'category_id格式不正确');

      await throws(() => ax.put('/dish/2', {
        category_id: "string"
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'category_id格式不正确');

      await throws(() => ax.put('/dish/2', {
        category_id: 100
      }),
      ({ response: r }) => r.status === 400 && r.data.message === '分类不存在');
    });

    it ('Name validation', async function () {
      await throws(() => ax.put('/dish/2', {
        name: 123
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'name格式不正确');

      await throws(() => ax.put('/dish/2', {
        name: ''
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'name格式不正确');

      await throws(() => ax.put('/dish/2', {
        name: '1'.repeat(46)
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'name格式不正确');
    });

    it ('Price validation', async function () {
      await throws(() => ax.put('/dish/2', {
        price: "string"
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'price格式不正确');
    });

    it ('Selling validation', async function () {
      await throws(() => ax.put('/dish/2', {
        selling: 123
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'selling格式不正确');

      await throws(() => ax.put('/dish/2', {
        selling: "string"
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'selling格式不正确');
    });

    it ('Spicy validation', async function () {
      await throws(() => ax.put('/dish/2', {
        spicy: -10
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'spicy格式不正确');

      await throws(() => ax.put('/dish/2', {
        spicy: "abcd"
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'spicy格式不正确');
    });

    it ('Image url validation', async function () {
      await throws(() => ax.put('/dish/2', {
        image_url: "string"
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'image_url格式不正确');

      await throws(() => ax.put('/dish/2', {
        image_url: [
          123, 456, 789
        ]
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'image_url格式不正确');
    });

    it ('Description validation', async function () {
      await throws(() => ax.put('/dish/2', {
        description: 123456
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'description格式不正确');
    });

    it ('Tag validation', async function () {
      await throws(() => ax.put('/dish/2', {
        tag: "string"
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'tag格式不正确');

      await throws(() => ax.put('/dish/2', {
        tag: [
          123, 456, 789
        ]
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'tag格式不正确');
    });

    it ('Specifications name validation', async function () {
      await throws(() => ax.put('/dish/2', {
        specifications: [
          {
            "name": 123,
            "require": true,
            "default": 0,
            "options": [
              {
                "name": "option",
                "delta": 0
              }
            ]
          }
        ]
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'specifications.name格式不正确');

      await throws(() => ax.put('/dish/2', {
        specifications: [
          {
            "name": '',
            "require": true,
            "default": 0,
            "options": [
              {
                "name": "option",
                "delta": 0
              }
            ]
          }
        ]
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'specifications.name格式不正确');

      await throws(() => ax.put('/dish/2', {
        specifications: [
          {
            "name": '1'.repeat(46),
            "require": true,
            "default": 0,
            "options": [
              {
                "name": "option",
                "delta": 0
              }
            ]
          }
        ]
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'specifications.name格式不正确');
    });

    it ('Specifications require validation', async function () {
      await throws(() => ax.put('/dish/2', {
        specifications: [
          {
            "name": "dish1",
            "require": 100,
            "default": 0,
            "options": [
              {
                "name": "option",
                "delta": 0
              }
            ]
          }
        ]
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'specifications.require格式不正确');

      await throws(() => ax.put('/dish/2', {
        specifications: [
          {
            "name": "dish1",
            "require": "yes",
            "default": 0,
            "options": [
              {
                "name": "option",
                "delta": 0
              }
            ]
          }
        ]
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'specifications.require格式不正确');
    });

    it ('Specifications default validation', async function () {
      await throws(() => ax.put('/dish/2', {
        specifications: [
          {
            "name": "dish1",
            "require": true,
            "default": -100,
            "options": [
              {
                "name": "option",
                "delta": 0
              }
            ]
          }
        ]
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'specifications.default格式不正确');

      await throws(() => ax.put('/dish/2', {
        specifications: [
          {
            "name": "dish1",
            "require": true,
            "default": "abc",
            "options": [
              {
                "name": "option",
                "delta": 0
              }
            ]
          }
        ]
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'specifications.default格式不正确');
    });

    it ('Specifications options validation', async function () {
      await throws(() => ax.put('/dish/2', {
        specifications: [
          {
            "name": "dish1",
            "require": true,
            "default": 0,
            "options": [
              {
                "name": 123,
                "delta": 0
              }
            ]
          }
        ]
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'specifications.options.name格式不正确');

      await throws(() => ax.put('/dish/2', {
        specifications: [
          {
            "name": "dish1",
            "require": true,
            "default": 0,
            "options": [
              {
                "name": '1'.repeat(46),
                "delta": 0
              }
            ]
          }
        ]
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'specifications.options.name格式不正确');

      await throws(() => ax.put('/dish/2', {
        specifications: [
          {
            "name": "dish1",
            "require": true,
            "default": 0,
            "options": [
              {
                "name": '',
                "delta": 0
              }
            ]
          }
        ]
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'specifications.options.name格式不正确');

      await throws(() => ax.put('/dish/2', {
        specifications: [
          {
            "name": "dish1",
            "require": true,
            "default": 0,
            "options": [
              {
                "name": "option",
                "delta": "string"
              }
            ]
          }
        ]
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'specifications.options.delta格式不正确');
    });

    it('Correct usecase validation', async function () {
      ax.put('/dish/2', {
        category_id: 1,
        name: "abcd",
        price: 123,
        selling: true,
        spicy: 0,
        specifications: [
          {
            "name": "dish1",
            "require": true,
            "default": 0,
            "options": [
              {
                "name": "option",
                "delta": 0
              }
            ]
          }
        ],
        image_url: [
          'string'
        ],
        description: 'string',
        tag: [
          'string'
        ]
      });
    });
  });

  describe('Delete dish', async function () {
    it('Dish id validation', async function () {
      await throws(() => ax.delete('/dish/-1'),
        ({ response: r }) => r.status === 400 && r.data.message === 'id格式不正确');

      await throws(() => ax.delete('/dish/abcd'),
        ({ response: r }) => r.status === 400 && r.data.message === 'id格式不正确');
    });
  });

  describe('Delete category', async function () {
    it('Category id validation', async function () {
      await throws(() => ax.delete('/category/-1'),
        ({ response: r }) => r.status === 400 && r.data.message === 'id格式不正确');

      await throws(() => ax.delete('/category/abcd'),
        ({ response: r }) => r.status === 400 && r.data.message === 'id格式不正确');
    });

    it('Category dump validation', async function () {
      await throws(() => ax.delete('/category/1', {
        dump: 1
      }),
        ({ response: r }) => r.status === 400 && r.data.message === 'dump格式不正确');

      await throws(() => ax.delete('/category/1', {
        dump: -100
      }),
        ({ response: r }) => r.status === 400 && r.data.message === 'dump格式不正确');

      await throws(() => ax.delete('/category/1', {
        dump: "string"
      }),
        ({ response: r }) => r.status === 400 && r.data.message === 'dump格式不正确');
    });
  });

  describe('Update category order', async function () {
    it('Category id validation', async function () {
      await throws(() => ax.put('/category', ['3', '1', '2']),
        ({ response: r }) => r.status === 400 && r.data.message === '参数格式不正确');

      await throws(() => ax.put('/category', [-3, 1, 0, -5]),
        ({ response: r }) => r.status === 400 && r.data.message === '参数格式不正确');

      await throws(() => ax.put('/category', [4, 3, 2, 1]),
        ({ response: r }) => r.status === 400 && r.data.message === 'category数量不一致');

      await throws(() => ax.put('/category', [4, 2, 1]),
        ({ response: r }) => r.status === 400 && r.data.message === '只能修改自己的分类');
    });

    it('Correct usecase validation', async function () {
      ax.put('/category', [3, 1, 2]);
    });
  });

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

      await throws(() => ax.put('/category/4', {
          name: 'newCategory'
       }),
        ({ response: r }) => r.status === 400 && r.data.message === '分类不存在');
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

  describe('Get category and dish list', async function () {
    it('Category and dish list validation', async function () {
      const { data } =  await ax.get('/dish');
      assert.deepStrictEqual(data[0].restaurant_id, 1);
      assert.deepStrictEqual(data[0].category_id, 3);
      assert.deepStrictEqual(data[0].name, 'category3');
    });
   });
});
