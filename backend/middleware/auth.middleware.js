import { verifyToken } from "../services/user.service.js";

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const payload = verifyToken(token);
  if (!payload?.id) return res.status(401).json({ message: "Invalid token" });

  req.user = payload;
  next();
}
