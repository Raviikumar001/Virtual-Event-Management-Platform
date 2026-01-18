/**
 * Global error handler middleware.
 *
 * @type {import('express').ErrorRequestHandler}
 */
function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ error: message });
}

module.exports = errorHandler;
