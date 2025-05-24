const errorHandler = (err, req, res, next) => {
  console.error('Server Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    error:
      process.env.NODE_ENV === 'development'
        ? {
            message: err.message,
            stack: err.stack,
            name: err.name,
          }
        : undefined,
    requestId: req.id || Math.random().toString(36).substring(7),
  });
};

module.exports = {
  errorHandler,
};
