const errorHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    console.error("Error:", error);
    const statusCode = error.status || 500;
    res.status(statusCode).json({ message: error.message });
  });
};

module.exports = errorHandler;
