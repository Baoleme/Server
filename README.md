[![Build Status](https://travis-ci.org/Baoleme/Server.svg?branch=master)](https://travis-ci.org/Baoleme/Server) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)

# 启动
服务器监听8520端口
```bash
# 开发
npm run dev
# 生产
npm start
```

# 日志
```js
const log = require('lib/log');
log.debug(message, meta);
log.verbose(message, meta);
log.info(message, meta);
log.warn(message, meta);
log.error(message, meta);

// Example
log.verbose('I am working');
log.info('I want to show something', {
  foo: 'bar'
});
```

```js
// 在拥有Koa上下文的环境中也可以直接使用
ctx.log.xxx(message, meta);

// true
ctx.log === require('lib/log');
```

1. `INFO`等级以上的log会是输出到`logs`文件夹。
2. 开发环境下，任何等级的log都会输出到标准输出。
3. 在任何中间件中如果出现的`Error`，本次请求的上下文和错误信息会自动被`log.error`记录。
4. 主动抛出的`Error`可以设置`error.expose=true`，这样日志系统就会忽略这次错误。注意，当你给任何错误标注了`expose`，`Koa`会认为这个错误的相关信息是可以暴露给用户的，请谨慎使用。
5. `unhandledRejection`会被`log.error`无条件写入日志。

# Assert
自定义的Assert可以方便地抛出用户可感知的错误（4xx）, 这个自定义工具的用法与node自带的assert拥有一致的API。

```js
const assert = require('lib/assert');

assert(false, 'You are wrong');

// 其实等于下面的语句
if (false) {
  const error = new Error('You are wrong');
  error.status = 400;
  error.expose = true;
  throw error;
}
```

```js
// 在拥有Koa上下文的环境中也可以直接使用
ctx.assert(condition, message);

// true
ctx.assert === require('lib/assert');
```