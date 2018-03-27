const isDev = process.env.NODE_ENV !== 'production';

if (isDev) {
  module.exports = {
    host: '119.29.252.110',
    port: 6379,
    password: 'baolemeredis6379',
    db: 1
  };
} else {
  module.exports = {
    host: '119.29.252.110',
    port: 6379,
    password: 'baolemeredis6379',
    db: 0
  };
}
