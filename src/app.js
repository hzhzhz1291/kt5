const express = require('express');
const swagger = require('swagger-ui-express');
const openapi = require('./config/swagger');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { env } = require('./config');
const { authenticate } = require('./middleware/auth');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { createAuthRouter } = require('./routes/auth');
const posts = require('./routes/posts');
const users = require('./routes/users');

function createApp({ loginStore } = {}) {
  const app = express();
  app.disable('x-powered-by');
  if (env.TRUST_PROXY_HOPS) app.set('trust proxy', env.TRUST_PROXY_HOPS);
  app.use(helmet(env.NODE_ENV === 'development'
    ? { contentSecurityPolicy: { directives: { 'upgrade-insecure-requests': null } } }
    : {}));
  app.use(express.json({ limit: '10kb' }));
  app.use(cookieParser());

  app.get('/api/docs.json', (req, res) => res.json(openapi));
  app.use('/api/docs', swagger.serve, swagger.setup(openapi, {
    customSiteTitle: openapi.info.title,
    swaggerOptions: { validatorUrl: null },
  }));

  app.use('/auth', createAuthRouter({ loginStore }));
  app.use('/api/users', authenticate, users.router);
  app.use('/admin/users', authenticate, users.adminRouter);
  app.use('/api/posts', authenticate, posts);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
