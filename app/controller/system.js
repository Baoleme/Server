const systemService = require('../service/system');
const busboy = require('async-busboy');

const allowMimeType = [
  'image/jpeg',
  'image/png'
];

exports.uploadImage = async ctx => {
  const { files } = await busboy(ctx.req);
  const image = files.find(value => value.fieldname === 'image');
  ctx.assert(image, '缺少image字段');
  ctx.assert(allowMimeType.includes(image.mimeType), 'image只允许jpeg、jpg和png格式');
  ctx.body = {
    url: await systemService.uploadImage(image)
  };
};
