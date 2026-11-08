
class ApiResponse {
  static success(res, statusCode, message, data = {}) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static paginated(res, statusCode, data, pagination) {
    return res.status(statusCode).json({
      success: true,
      data,
      pagination,
    });
  }
}

module.exports = ApiResponse;