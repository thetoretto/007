const { NotFoundError } = require('./errorHandler');

const notFound = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};

module.exports = { notFound };