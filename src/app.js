/**
 * Express application bootstrap.
 *
 * @returns {import('express').Express}
 */
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  const authRoutes = require('./routes/auth-routes');
  const eventRoutes = require('./routes/event-routes');
  app.use(authRoutes);
  app.use(eventRoutes);

  const errorHandler = require('./core/error-handler');
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
