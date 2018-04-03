const axios = require('axios');
require('node-axios-cookiejar')(axios);
const tough = require('tough-cookie');

module.exports = () => axios.create({
  jar: new tough.CookieJar(),
  withCredentials: true,
  validateStatus: function (status) {
    return status === 200;
  }
});
