const customerService = require('../../service/customer');

exports.getSelfInformation = async ctx => {
  ctx.body = await customerService.getInformationById(ctx.session.customer_id);
};

exports.login = async ctx => {
  const { code } = ctx.request.body;
  ctx.verify({ data: code, type: 'string', message: 'invalid code' });
  let customer_id;
  try {
    customer_id = await customerService.login(code);
  } catch (err) {
    ctx.log.warn(err.message, {
      trace: err.trace,
      context: ctx,
      session: ctx.session
    });
    ctx.throw(400, '获取Openid失败');
  }
  ctx.session.customer_id = customer_id;
  ctx.body = await customerService.getInformationById(customer_id);
};

exports.logout = ctx => {
  ctx.session.customer_id = null;
  ctx.status = 200;
};
