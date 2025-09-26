function errorHandler(err, req, res, next) {
  console.error("Error:", err);

  if (res.headersSent) {
    return next(err);
  }

  req.session.flash = { 
    type: "error", 
    message: err.message || "Something went wrong" 
  };

  const backURL = req.get("Referrer") || "/";
  res.redirect(backURL);
}

module.exports = { errorHandler };