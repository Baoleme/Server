const busboy = require('async-busboy');
const rAccountService = require('../service/restaurantAccount');
const _ = require('lodash');

const allowMimeType = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/pdf'
];

exports.create = async ctx => {
  const { files, fields } = await busboy(ctx.req);
  const { email, name, password } = fields;
  ctx.verify(
    { data: email, type: 'string', message: 'email格式不正确' },
    { data: name, type: 'string', maxLength: 45, message: 'name格式不正确' },
    { data: password, type: 'string', message: 'password格式不正确' }
  );
  ctx.assert(/^.+@.+\..+$/.test(email), 'email格式不正确');
  ctx.assert(/^[`~!@#$%^&*()_+-={}[\]\\|;:'",<.>/?0-9a-zA-Z]{6,32}$/.test(password), 'password格式不正确');
  const file = files.find(value => value.fieldname === 'license');
  ctx.assert(file, '缺少license');
  ctx.assert(allowMimeType.includes(file.mimeType), 'license只允许docx、doc和pdf格式');

  await rAccountService.create({
    email,
    name,
    password,
    file
  });
  ctx.status = 200;
};

exports.login = async ctx => {
  const { email, password } = ctx.request.body;
  ctx.verify(
    { data: email, type: 'string', message: 'email格式不正确' },
    { data: password, type: 'string', message: 'password格式不正确' }
  );
  ctx.assert(/^.+@.+\..+$/.test(email), 'email格式不正确');
  ctx.assert(/^[`~!@#$%^&*()_+-={}[\]\\|;:'",<.>/?0-9a-zA-Z]{6,32}$/.test(password), 'password格式不正确');
  ctx.session.restaurant_id = await rAccountService.login(email, password);
  ctx.status = 200;
};

exports.logout = ctx => {
  ctx.session.restaurant_id = null;
  ctx.status = 200;
};

exports.getSelfInformation = async ctx => {
  ctx.body = await rAccountService.getInformationById(ctx.session.restaurant_id);
};

exports.sendConfirmEmail = async ctx => {
  await rAccountService.sendConfirmEmail(ctx.session.restaurant_id);
  ctx.status = 200;
};

exports.emailConfirm = async ctx => {
  const { cipher, onSuccess } = ctx.query;
  ctx.verify({ data: cipher, type: 'string', message: 'cipher格式不正确' });
  await rAccountService.emailConfirm(cipher);
  if (onSuccess) ctx.redirect(onSuccess);
  else ctx.body = '邮箱已确认';
};

exports.updateInformation = async ctx => {
  const info = _.pick(ctx.request.body, ['password', 'name', 'logo_url', 'description', 'phone']);
  ctx.verify(
    { data: info.password, type: 'string', require: false, message: 'password格式不正确' },
    { data: info.name, type: 'string', require: false, maxLength: 45, message: 'name格式不正确' },
    { data: info.logo_url, type: 'string', require: false, maxLength: 255, message: 'logo_url格式不正确' },
    { data: info.description, type: 'string', require: false, message: 'description格式不正确' },
    { data: info.phone, type: 'string', require: false, maxLength: 11, message: 'phone格式不正确' }
  );
  if (info.password) {
    ctx.assert(
      /^[`~!@#$%^&*()_+-={}[\]\\|;:'",<.>/?0-9a-zA-Z]{6,32}$/.test(info.password),
      'password格式不正确'
    );
  }
  if (info.phone) {
    ctx.assert(/^1\d{10}$/.test(info.phone), 'phone格式不正确');
  }
  if (_.keys(info).length) await rAccountService.updateInformation(ctx.session.restaurant_id, info);
  ctx.status = 200;
};
