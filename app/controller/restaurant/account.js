const restaurantService = require('../../service/restaurant');

exports.create = async ctx => {
  const { email, name, password } = ctx.request.body;
  ctx.verify(
    { data: email, type: 'string', message: 'invalid email' },
    { data: name, type: 'string', message: 'invalid name' },
    { data: password, type: 'string', message: 'invalid password' }
  );
  ctx.assert(/.+@.+\..+/.test(email), 'invalid email');
  ctx.assert(name.length < 50, 'name to long');
  ctx.assert(password.length === 32, 'invalid password');
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
  ctx.assert(password.length === 32, 'invalid password');
  ctx.body = await restaurantService.login(email, password);
  ctx.session.restaurant_id = ctx.body.restaurant_id;
};

exports.logout = ctx => {
  ctx.session.restaurant_id = null;
  ctx.status = 200;
};

exports.getSelfInformation = ctx => {

};

exports.emailConfirm = ctx => {

};
