module.exports = {
  host: 'smtp.exmail.qq.com',
  port: 465,
  secure: true,
  auth: {
    user: 'baoleme@andiedie.cn',
    pass: 'Bao1le2me3'
  },
  from: '饱了么<baoleme@andiedie.cn>',
  cipherKey: '63be8012275ce93f51a3c1ce5d68e842360758d5866e61e1e6c4d0d69114c737',
  // 确认链接有效时间，10分钟
  confirmLinkMaxage: 10
};
