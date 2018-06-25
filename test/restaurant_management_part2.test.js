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
    });

    it ('Category id validation', async function () {
      await throws(() => ax.put('/dish/1', {
        category_id: -1
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'category_id格式不正确');

      await throws(() => ax.put('/dish/1', {
        category_id: "string"
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'category_id格式不正确');
    });

    it ('Name validation', async function () {
      await throws(() => ax.put('/dish/1', {
        name: 123
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'name格式不正确');

      await throws(() => ax.put('/dish/1', {
        name: ''
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'name格式不正确');

      await throws(() => ax.put('/dish/1', {
        name: '1'.repeat(46)
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'name格式不正确');
    });

    it ('Price validation', async function () {
      await throws(() => ax.put('/dish/1', {
        price: "string"
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'price格式不正确');
    });

    it ('Selling validation', async function () {
      await throws(() => ax.put('/dish/1', {
        selling: 123
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'selling格式不正确');

      await throws(() => ax.put('/dish/1', {
        selling: "string"
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'selling格式不正确');
    });

    it ('Spicy validation', async function () {
      await throws(() => ax.put('/dish/1', {
        spicy: -10
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'spicy格式不正确');

      await throws(() => ax.put('/dish/1', {
        spicy: "abcd"
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'spicy格式不正确');
    });

    it ('Image url validation', async function () {
      await throws(() => ax.put('/dish/1', {
        image_url: "string"
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'image_url格式不正确');

      await throws(() => ax.put('/dish/1', {
        image_url: [
          123, 456, 789
        ]
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'image_url格式不正确');
    });

    it ('Description validation', async function () {
      await throws(() => ax.put('/dish/1', {
        description: 123456
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'description格式不正确');
    });

    it ('Tag validation', async function () {
      await throws(() => ax.put('/dish/1', {
        tag: "string"
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'tag格式不正确');

      await throws(() => ax.put('/dish/1', {
        tag: [
          123, 456, 789
        ]
      }),
      ({ response: r }) => r.status === 400 && r.data.message === 'tag格式不正确');
    });

    it ('Specifications name validation', async function () {
      await throws(() => ax.put('/dish/1', {
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

      await throws(() => ax.put('/dish/1', {
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

      await throws(() => ax.put('/dish/1', {
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
      await throws(() => ax.put('/dish/1', {
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

      await throws(() => ax.put('/dish/1', {
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
      await throws(() => ax.put('/dish/1', {
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

      await throws(() => ax.put('/dish/1', {
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
      await throws(() => ax.put('/dish/1', {
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

      await throws(() => ax.put('/dish/1', {
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

      await throws(() => ax.put('/dish/1', {
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

      await throws(() => ax.put('/dish/1', {
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

    it('Correct usecase validation', async function () {
      ax.delete('/dish/1');
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

    it('Correct usecase validation', async function () {
      ax.delete('/category/1', {
        dump: 2
      });
    });
  });
  // after(() => {
  //   server.end();
  // });
});
