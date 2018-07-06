const tableModel = require('../model/table');
const restaurantService = require('./restaurantAccount');
const assert = require('../../lib/assert');
const systemConfig = require('../../config/system');
const fs = require('fs-extra');
const path = require('path');
const getAccessToken = require('../../lib/getAccessToken');
const axios = require('axios');

fs.ensureDirSync(path.join(__dirname, '../../files/qrcode/'));

exports.getAll = async id => {
  assert(await restaurantService.exist(id), '餐厅不存在');
  const tables = await tableModel.getAll(id);
  return tables.map(one => one.name);
};

exports.getAllQrcode = async id => {
  const tables = await exports.getAll(id);
  return tables.map(one => `${systemConfig.apiUrl}/files/qrcode/${id}_${one}.jpg`);
};

exports.createTable = async (id, array) => {
  assert(await restaurantService.exist(id), '餐厅不存在');
  const result = [];
  for (const one of array) {
    const filePath = path.join(__dirname, `../../files/qrcode/${id}_${one}.jpg`);
    if (!fs.existsSync(filePath)) {
      await saveQrcode(id, one, filePath);
    }
    result.push(`${systemConfig.apiUrl}/files/qrcode/${id}_${one}.jpg`);
  }
  await tableModel.createTable(id, array);
  return result;
};

exports.deleteTable = async (id, array) => {
  assert(await restaurantService.exist(id), '餐厅不存在');
  await tableModel.deleteTable(id, array);
  for (const one of array) {
    const filePath = path.join(__dirname, `../../files/qrcode/${id}_${one}.jpg`);
    fs.unlinkSync(filePath);
  }
};

async function saveQrcode (id, table, path) {
  const access_token = await getAccessToken();
  const { data } = await axios.post('https://api.weixin.qq.com/wxa/getwxacode', {
    path: `index?rid=${id}&tid=${table}`
  }, {
    params: {
      access_token
    },
    responseType: 'stream'
  });
  await new Promise(resolve => {
    data.pipe(fs.createWriteStream(path)).on('finish', resolve);
  });
}
