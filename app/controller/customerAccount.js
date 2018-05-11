const cAccountService = require('../service/customerAccount');

exports.getSelfInformation = async ctx => {
  ctx.body = await cAccountService.getInformationById(ctx.session.customer_id);
};

exports.login = async ctx => {
  const { code } = ctx.request.body;
  ctx.verify({ data: code, type: 'string', message: 'code格式不正确' });
  const customer = await cAccountService.login(code);
  ctx.session.customer_id = customer.customer_id;
  ctx.body = customer;
};

exports.logout = ctx => {
  ctx.session.customer_id = null;
  ctx.status = 200;
};
