import jwt from "jsonwebtoken";
import config from "../../configs/app/env";

export const generateToken = (data: object) => {
  return jwt.sign(data, config.appSecret, { expiresIn: "15m" });
};

export const generateRefreshToken = (data: object) => {
  return jwt.sign(data, config.appSecret, { expiresIn: "1h" });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, config.appSecret);
};
