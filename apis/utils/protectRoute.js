import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";

export const protectRoute = (req, res, next) => {
  try {
    const token = req.cookies.access_token;

    if (!token) return next(errorHandler(403,"Access Denied"));

    jwt.verify(token, process.env.JWT_SECRET,
      (err, user) => {
        if (err) return next(errorHandler(403,"Unauthorized- Invalid token"));

        req.user = user;
        next();
      });
  } catch(error){
    res.status(500).json({error: "Internal server error"})
  }
};
