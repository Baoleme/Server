const { throws } = require('./asyncAssert');
const FormData = require('form-data');
const ax = require('./ax')();
const db = require('../lib/db');
const testEmail = 'zchangan@163.com';
const server = require('../index');

describe('System', async function () {
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
  });

  describe('Upload Image', async function () {
    const uploadImage = async info => {
      const form = new FormData();
      if (info.image && info.filename) form.append('image', info.image, info.filename);
      return ax.post('/image', form, {
        headers: form.getHeaders()
      });
    };
    it('Missing field', async function () {
      await throws(() => uploadImage({
      }), ({ response: r }) => r.status === 400 && r.data.message === '缺少image字段');
    });

    it('PNG format', async function () {
      await uploadImage({
        image: '123',
        filename: 'a.png'
      });
    });

    it('JPEG format', async function () {
      await uploadImage({
        image: '123',
        filename: 'b.jpeg'
      });
    });

    it('JPG format', async function () {
      await uploadImage({
        image: '123',
        filename: 'c.jpg'
      });
    });

    it('Other format', async function () {
      await throws(() => uploadImage({
        image: '123',
        filename: 'e.doc'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'image只允许jpeg、jpg和png格式');

      await throws(() => uploadImage({
        image: '234',
        filename: 'ee.bmp'
      }), ({ response: r }) => r.status === 400 && r.data.message === 'image只允许jpeg、jpg和png格式');
    });
  });
  after(() => {
    server.end();
  });
});
