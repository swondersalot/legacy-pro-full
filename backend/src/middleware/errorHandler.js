function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.isJoi || err.name === "ZodError") {
    return res.status(400).json({ error: err.message });
  }
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }
  return res.status(500).json({ error: "Internal Server Error" });
}

module.exports = errorHandler;
