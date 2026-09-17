import jwt from "jsonwebtoken";

// Like authUser, but never blocks: attaches req.user when a valid token is
// sent, and lets guests (no token / bad token) through without one.
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
      req.user = { id: decoded.id };
    } catch {
      // invalid/expired token -> continue as guest
    }
  }

  next();
};

export default optionalAuth;
