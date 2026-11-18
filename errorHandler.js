/**
 * 404 Not Found Middleware
 * Triggered when a requested endpoint URL does not match any registered routes.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Central Error Handler Middleware
 * Formats errors into a clean, consistent JSON response structure.
 */
const errorHandler = (err, req, res, next) => {
  // If status code was not set to an error status code, default to 500
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';
  let details = null;

  // 1. Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID format: '${err.value}' is not a valid MongoDB ObjectId`;
  }

  // 2. Mongoose Validation Error (e.g. required field missing or regex failed)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(err.errors).map((item) => item.message);
  }

  // 3. Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0];
    message = `Duplicate value entered for field: ${field}`;
  }

  // 4. Malformed JSON Body Error
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Malformed JSON in request body. Please check your syntax.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details && { errors: details }),
    // Include stack trace only during non-production development if desired
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  notFound,
  errorHandler
};
