const restaurantService = require('../../service/restaurant');

exports.create = async ctx => {
  const { email, name, password } = ctx.request.body;
  ctx.verify(
    { data: email, type: 'string', message: 'invalid email' },
    { data: name, type: 'string', maxLength: 50, message: 'invalid name' },
    { data: password, type: 'string', message: 'invalid password' }
  );
  ctx.assert(/.+@.+\..+/.test(email), 'invalid email');
  ctx.assert(/[`~!@#$%^&*()_+-={}[\]\\|;:'",<.>/?0-9a-zA-Z]{6,32}/.test(password), 'invalid password');
  await restaurantService.create({
    email,
    name,
    password
  });
  ctx.status = 200;
};

exports.login = async ctx => {
  const { email, password } = ctx.request.body;
  ctx.verify(
    { data: email, type: 'string', message: 'invalid email' },
    { data: password, type: 'string', message: 'invalid password' }
  );
  ctx.assert(/.+@.+\..+/.test(email), 'invalid email');
  ctx.assert(/[`~!@#$%^&*()_+-={}[\]\\|;:'",<.>/?0-9a-zA-Z]{6,32}/.test(password), 'invalid password');
  ctx.assert(password.length === 32, 'invalid password');
  ctx.body = await restaurantService.login(email, password);
  ctx.session.restaurant_id = ctx.body.restaurant_id;
};

exports.logout = ctx => {
  ctx.session.restaurant_id = null;
  ctx.status = 200;
};

exports.getSelfInformation = async ctx => {
  ctx.body = await restaurantService.getInformationById(ctx.session.restaurant_id);
};

exports.sendConfirmEmail = async ctx => {
  await restaurantService.sendConfirmEmail(ctx.session.restaurant_id);
  ctx.status = 200;
};

exports.emailConfirm = async ctx => {
  const { cipher } = ctx.request.body;
  ctx.verify({ data: cipher, type: 'string', message: 'invalid cipher' });
  await restaurantService.emailConfirm(cipher);
  ctx.status = 200;
};
