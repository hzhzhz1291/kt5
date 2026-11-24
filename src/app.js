const express = require('express');
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
  app.use(helmet());
  app.use(express.json({ limit: '10kb' }));
  app.use(cookieParser());

  app.use('/auth', createAuthRouter({ loginStore }));
  app.use('/api/users', authenticate, users.router);
  app.use('/admin/users', authenticate, users.adminRouter);
  app.use('/api/posts', authenticate, posts);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
