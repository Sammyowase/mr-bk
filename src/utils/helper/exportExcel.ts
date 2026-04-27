import { Response } from "express";
import fs from "fs";
import { logger } from "../logger/logger";

export const exportExcel = (
  res: Response,
  filename: string,
  filePath: string
) => {
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);

  // Clean up
  fileStream.on("end", () => fs.unlink(filePath, () => { logger.info(`${filePath} removed`)}));
};
