const isTest = process.env.NODE_ENV === 'test';
module.exports = {
  apiUrl: isTest ? 'http://localhost:8520' : 'https://api.baoleme.andiedie.cn'
};
