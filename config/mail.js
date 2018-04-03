module.exports = {
  host: 'smtp.exmail.qq.com',
  port: 465,
  secure: true,
  auth: {
    user: 'baoleme@andiedie.cn',
    pass: 'Bao1le2me3'
  },
  from: '饱了么<baoleme@andiedie.cn>',
  cipherKey: 'baolemeEmailConfirm',
  // 确认链接有效时间，10分钟
  confirmLinkMaxage: 10
};
