import { verifyToken } from "../utils/jwt.js";
import { User } from "../models/User.js";

export function requireAuth(jwtSecret) {
  return async (req, res, next) => {
    try {
      const header = req.headers.authorization || "";
      const [, token] = header.split(" ");

      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const payload = verifyToken(token, jwtSecret);
      const user = await User.findById(payload.sub).select("_id name email");

      if (!user) {
        return res.status(401).json({ message: "Invalid token user" });
      }

      req.user = user;
      return next();
    } catch {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
}

export function requireRole(roles = []) {
  return (req, res, next) => {
    const userRole = req.documentRole;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return next();
  };
}
