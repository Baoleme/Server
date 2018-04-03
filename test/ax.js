const axios = require('axios');
const tough = require('tough-cookie');
const url = require('url');
const Cookie = tough.Cookie;
const cookiejar = new tough.CookieJar();
const baseURL = 'http://localhost:8520';
let instance;

const ax = () => instance;

ax.refresh = () => {
  instance = axios.create({
    validateStatus: function (status) {
      return status === 200;
    },
    baseURL
  });
  instance.interceptors.request.use(function (config) {
    cookiejar.getCookies(url.resolve(baseURL, config.url), function (err, cookies) {
      if (err) throw err;
      config.headers.cookie = cookies.join('; ');
    });
    return config;
  });

  instance.interceptors.response.use(function (response) {
    if (response.headers['set-cookie'] instanceof Array) {
      response.headers['set-cookie'].forEach(function (c) {
        cookiejar.setCookie(Cookie.parse(c), url.resolve(baseURL, response.config.url), function (err, cookie) {
          if (err) throw err;
        });
      });
    }
    return response;
  });
};

ax.refresh();

module.exports = ax;
