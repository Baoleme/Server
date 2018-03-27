const winston = require('winston');
const { combine, timestamp, printf } = winston.format;
require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs-extra');
const isDev = process.env.NODE_ENV !== 'production';
const logPath = path.resolve(__dirname, '../logs/');

fs.ensureDirSync(logPath);

let transports = [];

transports.push(new winston.transports.DailyRotateFile({
  dirname: logPath,
  filename: '%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'info'
}));

if (isDev) {
  transports.push(new winston.transports.Console());
}

const logger = winston.createLogger({
  level: isDev ? 'debug' : 'info',
  format: combine(
    timestamp(),
    printf(info => {
      return JSON.stringify(info, null, 2);
    })
  ),
  transports
});

module.exports = logger;
