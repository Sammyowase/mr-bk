import bcrypt from "bcrypt";
import { logger } from "../logger/logger";

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (err) {
    logger.error("Error hashing password:", err);
    throw new Error("Error hashing password");
  }
};

export const verifyPassword = async (
  password: string,
  savedPassword: string,
) => {
  try {
    const match = await bcrypt.compare(password, savedPassword);
    if (match) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return error;
  }
};
