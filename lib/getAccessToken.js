const { query } = require('./db');
const wechatConfig = require('../config/wechat');
const axios = require('axios');

async function getNew () {
  const { data } = await axios.get('https://api.weixin.qq.com/cgi-bin/token', {
    params: {
      grant_type: 'client_credential',
      appid: wechatConfig.appid,
      secret: wechatConfig.secret
    }
  });
  return {
    value: data.access_token,
    expire: new Date().getTime() + data.expires_in * 1000
  };
}

async function getFromDb () {
  const sql = `
    SELECT
    value
    FROM Meta
    WHERE \`key\` = 'access_token'
  `;
  const { value } = (await query(sql))[0];
  return value ? JSON.parse(value) : {
    value: null,
    expire: 0
  };
}

async function saveToDb (value, expire) {
  const sql = `
    REPLACE INTO Meta
    (\`key\`, value)
    VALUES
    (?, ?)
  `;
  await query(sql, ['access_token', JSON.stringify({
    value,
    expire
  })]);
}

module.exports = async () => {
  let { value, expire } = await getFromDb();
  if (expire + 60 * 1000 <= new Date().getTime()) {
    ({ value, expire } = await getNew());
    saveToDb(value, expire);
  }
  return value;
};
