
const ApiError = require('../utils/ApiError');

const notFound = (req, res, next) => {
  next(new ApiError(404, `Resource not found - ${req.originalUrl}`));
};

module.exports = notFound;