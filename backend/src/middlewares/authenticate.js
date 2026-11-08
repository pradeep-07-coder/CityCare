
const { verifyAccessToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication token missing or malformed'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      user_id: decoded.sub,
      role: decoded.role,
      profile_id: decoded.profile_id,
    };
    next();
  } catch (error) {
    return next(new ApiError(401, 'Access token expired or invalid'));
  }
};

module.exports = authenticate;