const nodemailer = require('nodemailer');
const mailConfig = require('../config/mail');
const transporter = nodemailer.createTransport(mailConfig);

module.exports = (to, subject, html) => {
  const option = {
    to,
    subject,
    html,
    from: mailConfig.from
  };
  return new Promise((resolve, reject) => {
    transporter.sendMail(option, (error, info) => {
      if (error) reject(error);
      else resolve(info);
    });
  });
};
