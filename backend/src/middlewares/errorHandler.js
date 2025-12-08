export function notFound(req, res, next) {
  console.warn(`⚠️ 404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    success: false,
    message: "Endpoint tidak ditemukan" 
  });
}

export function errorHandler(err, req, res, next) {
  console.error("❌ Error:", {
    message: err.message,
    status: err.status || 500,
    path: req.originalUrl,
    method: req.method
  });
  
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Terjadi kesalahan pada server",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
}
