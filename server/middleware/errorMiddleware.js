export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (error, req, res, _next) => {
  if (error?.code === 11000) {
    return res.status(409).json({ message: "A record with this value already exists" });
  }
  const statusCode = res.statusCode === 200 ? error.statusCode || 500 : res.statusCode;
  res.status(statusCode).json({
    message: error.message || "Server error",
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
  });
};
