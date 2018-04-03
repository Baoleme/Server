const restaurantService = require('../../service/restaurant');

exports.create = async ctx => {
  const { email, name, password } = ctx.request.body;
  ctx.verify(
    { data: email, type: 'string', message: 'email格式不正确' },
    { data: name, type: 'string', maxLength: 50, message: 'name格式不正确' },
    { data: password, type: 'string', message: 'password格式不正确' }
  );
  ctx.assert(/^.+@.+\..+$/.test(email), 'email格式不正确');
  ctx.assert(/^[`~!@#$%^&*()_+-={}[\]\\|;:'",<.>/?0-9a-zA-Z]{6,32}$/.test(password), 'password格式不正确');
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
    { data: email, type: 'string', message: 'email格式不正确' },
    { data: password, type: 'string', message: 'password格式不正确' }
  );
  ctx.assert(/^.+@.+\..+$/.test(email), 'email格式不正确');
  ctx.assert(/^[`~!@#$%^&*()_+-={}[\]\\|;:'",<.>/?0-9a-zA-Z]{6,32}$/.test(password), 'password格式不正确');
  ctx.session.restaurant_id = await restaurantService.login(email, password);
  ctx.status = 200;
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
  const { cipher } = ctx.query;
  ctx.verify({ data: cipher, type: 'string', message: 'cipher格式不正确' });
  await restaurantService.emailConfirm(cipher);
  ctx.status = 200;
};
