import { Request, Response } from "express";
import sendResponse from "../utils/http/sendResponse";

export const index = async (request: Request, response: Response) => {
  sendResponse(response, 200, "Welcome to Miratonrose API", null);
};
