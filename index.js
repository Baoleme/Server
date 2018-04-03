const Koa = require('koa');
const app = new Koa();
const log = require('./lib/log');
const sessionConfig = require('./config/session');
const redisConfig = require('./config/redis');
const isDev = process.env.NODE_ENV === 'development';
const redisStore = require('koa-redis')(redisConfig);

// 将所有错误转为JSON的统一格式
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    if (err.expose) {
      ctx.body = {
        message: err.message
      };
    }
    ctx.app.emit('error', err, ctx);
  }
});

if (isDev) app.use(require('koa-morgan')('dev'));

app.context.log = log;
app.context.assert = require('./lib/assert');
app.context.verify = require('./lib/verify');

app.use(require('koa-helmet')());

app.use(require('@koa/cors')({
  credentials: true
}));

app.keys = sessionConfig.cookieKey;
app.use(require('koa-session')({
  ...sessionConfig,
  store: redisStore
}, app));

app.use(require('koa-bodyparser')());

app.use(require('./app/router'));

app.on('error', (err, ctx) => {
  if (!err.expose) {
    log.error(err.message, {
      trace: err.stack,
      context: ctx,
      session: ctx.session
    });
  }
});

process.on('unhandledRejection', (reason) => log.error(reason));
const server = app.listen(process.env.PORT || 8520);
exports.end = () => {
  server.close();
  redisStore.end();
  require('./lib/db').pool.end();
};
