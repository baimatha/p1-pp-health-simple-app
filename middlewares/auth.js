function isLoggedIn(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

function isPatient(req, res, next) {
  if (req.session.user && req.session.user.role === "patient") {
    return next();
  }
  return res.redirect("/login");
}

function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === "admin") {
    return next();
  }
  return res.redirect("/login");
}

function isDoctor(req, res, next) {
  if (req.session.user && req.session.user.role === "doctor") {
    return next();
  }
  return res.redirect("/login");
}

module.exports = { isLoggedIn, isPatient, isAdmin, isDoctor };