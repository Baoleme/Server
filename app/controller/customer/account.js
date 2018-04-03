const customerService = require('../../service/customer');

exports.getSelfInformation = async ctx => {
  ctx.body = await customerService.getInformationById(ctx.session.customer_id);
};

exports.login = async ctx => {
  const { code } = ctx.request.body;
  ctx.verify({ data: code, type: 'string', message: 'code格式不正确' });
  const customer = await customerService.login(code);
  ctx.session.customer_id = customer.customer_id;
  ctx.body = customer;
};

exports.logout = ctx => {
  ctx.session.customer_id = null;
  ctx.status = 200;
};
