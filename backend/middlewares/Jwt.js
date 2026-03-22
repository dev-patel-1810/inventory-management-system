import jwt from "jsonwebtoken";
import { ApiError } from "../src/utils/ApiError.js";
export const JWTmiddleware = (req, res, next) => {
  const token = req.cookies?.access_token;
  if (!token) return next(new ApiError(401, "Access token is missing"));

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (err) {
    return next(new ApiError(403, "Invalid or expired token"));
  }
};
