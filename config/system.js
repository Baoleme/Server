const isTest = process.env.NODE_ENV === 'test';
const path = require('path');

module.exports = {
  apiUrl: isTest ? 'http://localhost:8520' : 'https://api.baoleme.andiedie.cn',
  fileDir: path.resolve(__dirname, '../files/')
};
