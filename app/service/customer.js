const customerModel = require('../model/customer');
const axios = require('axios');
const wechatConfig = require('../../config/wechat');
const assert = require('../../lib/assert');

exports.login = async code => {
  let openid = await getOpenidByCode(code);
  let customer = await customerModel.getByOpenid(openid);
  if (!customer) {
    // regist
    let { insertId } = await customerModel.create({
      openid
    });
    customer = await customerModel.getById(insertId);
  }
  return customer;
};

exports.getInformationById = async customer_id => {
  return customerModel.getById(customer_id);
};

async function getOpenidByCode (code) {
  let openid;
  try {
    const { data } = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        ...wechatConfig,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });
    openid = data.openid;
  } catch (err) {
    throw new Error(err.data.errmsg || err.message || 'No Error Message');
  }
  assert(openid, '获取Openid失败');
  return openid;
}
