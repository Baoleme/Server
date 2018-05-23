const restaurantModel = require('../model/restaurant');
const assert = require('../../lib/assert');
const mail = require('../../lib/mail');
const systemConfig = require('../../config/system');
const mailConfig = require('../../config/mail');
const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');

const isTest = process.env.NODE_ENV === 'test';
let lastLink = null;

exports.create = async restaurant => {
  const exist = await restaurantModel.getIdAndPasswordByEmail(restaurant.email);
  assert(!exist, '邮箱已经被使用');
  const extname = path.extname(restaurant.file.filename);
  const destPath = path.resolve(systemConfig.fileDir, 'license', restaurant.email + extname);
  fs.ensureDirSync(path.dirname(destPath));
  restaurant.file.pipe(fs.createWriteStream(destPath));
  restaurant.license_url = `${systemConfig.apiUrl}/files/license/${restaurant.email}${extname}`;
  return restaurantModel.create(restaurant);
};

exports.login = async (email, password) => {
  const restaurant = await restaurantModel.getIdAndPasswordByEmail(email);
  assert(restaurant && password === restaurant.password, '用户名或密码错误');
  return restaurant.restaurant_id;
};

exports.getInformationById = restaurant_id => {
  return restaurantModel.getById(restaurant_id);
};

exports.sendConfirmEmail = async restaurant_id => {
  const restaurant = await exports.getInformationById(restaurant_id);
  assert(!restaurant.confirm_email, '邮箱已经激活，请勿重复操作');
  const cipher = encipher(`${restaurant_id}|${new Date().getTime()}`);
  const link = `${systemConfig.apiUrl}/restaurant/emailConfirm?cipher=${cipher}`;
  lastLink = link;
  const html = fs.readFileSync(path.resolve(__dirname, '../../lib/emailTemplate.html'), 'utf-8')
    .replace('{{NAME}}', restaurant.name)
    .replace('{{LINK}}', link)
    .replace('{{MAXAGE}}', mailConfig.confirmLinkMaxage);
  if (!isTest) await mail(restaurant.email, '饱了么注册邮箱激活', html);
};

exports.emailConfirm = async cipher => {
  let raw;
  try {
    raw = decipher(cipher);
  } catch (err) {
    assert(false, '错误的验证信息');
  }
  let [restaurant_id, time] = raw.split('|');
  assert(new Date().getTime() <= (Number(time) + mailConfig.confirmLinkMaxage * 60 * 1000), '激活链接已失效');
  const restaurant = await exports.getInformationById(restaurant_id);
  assert(!restaurant.confirm_email, '邮箱已经激活，请勿重复操作');
  await restaurantModel.update(restaurant_id, {
    confirm_email: true
  });
};

exports.updateInformation = async (id, info) => {
  await restaurantModel.update(id, info);
};

exports.getLastLink = () => {
  return isTest ? lastLink : null;
};

exports.exist = async id => {
  return Boolean(await restaurantModel.getById(id));
};

exports.getOne = async id => {
  return restaurantModel.getById(id);
};

function encipher (raw) {
  const iv = Buffer.from(crypto.randomBytes(16));
  const key = Buffer.from(mailConfig.cipherKey, 'hex');
  const cipher = crypto.createCipheriv('aes-256-cfb', key, iv);
  cipher.setEncoding('hex');
  cipher.write(raw);
  cipher.end();
  const ciphered = cipher.read();
  return `${ciphered}$${iv.toString('hex')}`;
}

function decipher (encrypted) {
  let [ciphered, iv] = encrypted.split('$');
  iv = Buffer.from(iv, 'hex');
  const key = Buffer.from(mailConfig.cipherKey, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cfb', key, iv);
  let decrypted = decipher.update(ciphered, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
