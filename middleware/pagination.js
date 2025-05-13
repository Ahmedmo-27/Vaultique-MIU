const paginationMiddleware = (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    if (page < 1) {
      return res.status(400).json({
        success: false,
        message: "Page number must be greater than 0"
      });
    }
    
    if (limit < 1 || limit > 50) {
      return res.status(400).json({
        success: false,
        message: "Limit must be between 1 and 50"
      });
    }

    req.pagination = {
      page,
      limit,
      skip: (page - 1) * limit
    };

    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid pagination parameters"
    });
  }
};

module.exports = {
  paginationMiddleware
}; 