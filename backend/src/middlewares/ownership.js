
const ApiError = require('../utils/ApiError');
const { ROLES } = require('../constants/roles');

/**
 * Enforces resource ownership.
 * Admin, Receptionist, and Doctor bypass ownership check depending on entity context.
 * Patients can only access resources where target ID matches profile_id in JWT.
 */
const checkPatientOwnership = (paramKey = 'id') => (req, res, next) => {
  if (req.user.role === ROLES.ADMIN || req.user.role === ROLES.RECEPTIONIST || req.user.role === ROLES.DOCTOR) {
    return next();
  }

  const resourcePatientId = parseInt(req.params[paramKey], 10);
  if (req.user.role === ROLES.PATIENT && req.user.profile_id !== resourcePatientId) {
    return next(new ApiError(403, 'Forbidden: Access restricted to own patient records'));
  }

  next();
};

module.exports = { checkPatientOwnership };