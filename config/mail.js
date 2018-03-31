module.exports = {
  host: 'smtp.mail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'baoleme@mail.com',
    pass: 'baolemeemail'
  },
  from: '饱了么<baoleme@mail.com>',
  cipherKey: 'baolemeEmailConfirm',
  // 确认链接有效时间，10分钟
  confirmLinkMaxage: 10 * 60 * 1000
};
