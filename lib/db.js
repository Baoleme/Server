const mysql = require('mysql');
const util = require('util');
const config = require('../config/mysql');
const pool = mysql.createPool(config);

exports.query = (...args) => {
  return new Promise((resolve, reject) => {
    pool.query(...args, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

/**
 * 事务
 * @param  {callback}  cb 要在事务中执行的函数，参数为query函数
 * @return {Promise}
 */
exports.transaction = async (cb) => {
  const getConnection = util.promisify(pool.getConnection).bind(pool);
  const connection = await getConnection();
  const beginTransaction = util.promisify(connection.beginTransaction).bind(connection);
  const query = util.promisify(connection.query).bind(connection);
  const commit = util.promisify(connection.commit).bind(connection);
  const rollback = util.promisify(connection.rollback).bind(connection);
  await beginTransaction();
  try {
    await cb(query);
    await commit();
  } catch (err) {
    await rollback();
    throw err;
  } finally {
    connection.release();
  }
};
