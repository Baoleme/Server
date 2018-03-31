const isDev = process.env.NODE_ENV !== 'production';

if (isDev) {
  module.exports = {
    connectionLimit: 10,
    host: '119.29.252.110',
    port: 3306,
    user: 'root',
    password: '11929252110baolememysql',
    database: 'baoleme-dev',
    charset: 'utf8mb4_general_ci'
  };
} else {
  module.exports = {
    connectionLimit: 10,
    host: '119.29.252.110',
    port: 3306,
    user: 'root',
    password: '11929252110baolememysql',
    database: 'baoleme',
    charset: 'utf8mb4_general_ci'
  };
}
