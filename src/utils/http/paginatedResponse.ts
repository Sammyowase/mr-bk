/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from "express";
export interface MetadataType {
  page: number;
  size: number;
  total: number;
}

const PaginatedResponse = (
  res: Response,
  message: string,
  data: any,
  metadata: MetadataType,
) => {
  res.status(200).json({
    status: "success",
    message,
    error: false,
    data,
    metadata: {
      ...metadata,
      totalPages: Math.ceil(metadata.total / metadata.size),
      hasNextPage: metadata.page < Math.ceil(metadata.total / metadata.size),
    },
  });
};

export default PaginatedResponse;
