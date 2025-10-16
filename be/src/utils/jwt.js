import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret_dev";

export const signPayLoad = (payload, expiresIn) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};