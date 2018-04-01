const restaurantModel = require('../model/restaurant');
const assert = require('../../lib/assert');
const mail = require('../../lib/mail');
const systemConfig = require('../../config/system');
const mailConfig = require('../../config/mail');
const crypto = require('crypto');

exports.create = restaurant => {
  return restaurantModel.create(restaurant);
};

exports.login = async (email, password) => {
  const restaurant = await restaurantModel.getIdAndiePasswordByEmail(email);
  assert(password === restaurant.password, '用户名或密码错误');
  return restaurantModel.getById(restaurant.restaurant_id);
};

exports.getInformationById = restaurant_id => {
  return restaurantModel.getById(restaurant_id);
};

exports.sendConfirmEmail = async restaurant_id => {
  const restaurant = await exports.getInformationById(restaurant_id);
  assert(!restaurant.confirm_email, '邮箱已经确认');
  const cipher = encipher(`${restaurant_id}|${new Date().getTime()}`);
  await mail(restaurant.email, '饱了么注册邮箱确认', `<a href="${systemConfig.apiUrl}/auth?cipher=${cipher}">认证链接</a>`);
};

exports.emailConfirm = async cipher => {
  let raw;
  try {
    raw = decipher(cipher);
  } catch (err) {
    assert(false, '错误的验证信息');
  }
  let [restaurant_id, time] = raw.split('|');
  assert(new Date().getTime() <= (Number(time) + mailConfig.confirmLinkMaxage), '确认链接已失效');
  await restaurantModel.update(restaurant_id, {
    confirm_email: true
  });
};

function encipher(raw) {
  const cipher = crypto.createCipher('aes192', mailConfig.cipherKey);
  let encrypted = cipher.update(raw);
  return encrypted + cipher.final('hex');
}

function decipher(encrypted) {
  const decipher = crypto.createDecipher('aes192', mailConfig.cipherKey);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
