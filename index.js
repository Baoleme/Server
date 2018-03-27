const Koa = require('koa');
const app = new Koa();
const log = require('./lib/log');
const sessionConfig = require('./config/session');
const redisConfig = require('./config/redis');
const isDev = process.env.NODE_ENV !== 'production';

if (isDev) app.use(require('koa-morgan')('dev'));

app.use(require('koa-helmet')());

app.use(require('@koa/cors')({
  credentials: true
}));

app.keys = sessionConfig.cookieKey;
app.use(require('koa-session')({
  ...sessionConfig,
  store: require('koa-redis')(redisConfig)
}, app));

app.use(require('koa-bodyparser')());

app.use(require('./app/router'));

app.use((ctx, next) => {
  throw new Error('something');
});

const errorHandler = (err, ctx) => {
  if (!err.expose) {
    log.error(err.message, {
      trace: err.trace,
      context: ctx,
      session: ctx.session
    });
  }
};

app.on('error', errorHandler);

app.listen(process.env.PORT || 8520);
process.on('unhandledRejection', (reason) => log.error(reason));
