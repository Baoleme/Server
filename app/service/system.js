const fs = require('fs-extra');
const path = require('path');
const systemConfig = require('../../config/system');

exports.uploadImage = image => {
  const extname = path.extname(image.filename);
  const filename = `${new Date().getTime()}${Math.ceil(Math.random() * 1000)}${extname}`;
  const destPath = path.resolve(systemConfig.fileDir, 'images', filename);
  fs.ensureDirSync(path.dirname(destPath));
  image.pipe(fs.createWriteStream(destPath));
  return `${systemConfig.apiUrl}/files/images/${filename}`;
};
