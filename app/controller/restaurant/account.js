const verify = require('../../../lib/verify');
const assert = require('../../../lib/assert');

exports.create = async ctx => {
  const { email, name, password } = ctx.request.body;
  verify(
    { data: email, type: 'string', message: 'invalid email' },
    { data: name, type: 'string', message: 'invalid name' },
    { data: password, type: 'string', message: 'invalid password' }
  );
  assert(/.+@.+\..+/.test(email), 'invalid email');
  assert(name.length < 50, 'name to long');
  assert(password.length === 32, 'invalid password');
};
