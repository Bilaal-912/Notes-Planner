// backend/middleware/requireRole.js
module.exports = function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Admin bypass: admins can do anything
    if (req.user.role === "admin") return next();

    if (req.user.role !== role) {
      return res.status(403).json({ message: "Forbidden - insufficient role" });
    }

    next();
  };
};
