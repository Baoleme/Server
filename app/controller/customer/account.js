const verify = require('../../../lib/verify');
const customerService = require('../../service/customer');
const log = require('../../../lib/log');

exports.getSelfInformation = ctx => {
  return customerService.getInformationById(ctx.session.customer_id);
};

exports.login = async ctx => {
  const { code } = ctx.request.body;
  verify({ data: code, type: 'string', message: 'invalid code' });
  let customer_id;
  try {
    customer_id = await customerService.login(code);
  } catch (err) {
    log.warn(err.message, {
      trace: err.trace,
      context: ctx,
      session: ctx.session
    });
    ctx.throw(400, '获取Openid失败');
  }
  ctx.session.customer_id = customer_id;
  return customerService.getInformationById(customer_id);
};

exports.logout = ctx => {
  ctx.session.customer_id = null;
  ctx.status = 200;
};
