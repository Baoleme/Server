const isTest = process.env.NODE_ENV === 'test';
module.exports = isTest ? {
  connectionLimit: 10,
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'localhostmysql',
  database: 'baoleme',
  charset: 'utf8mb4_general_ci'
} : {
  connectionLimit: 10,
  host: '119.29.252.110',
  port: 3306,
  user: 'root',
  password: '11929252110baolememysql',
  database: 'baoleme',
  charset: 'utf8mb4_general_ci'
};
