import axios, { AxiosInstance, AxiosResponse } from "axios";
import { BPAPIResponse } from "../../../types/api-client";
import {
  BPGetResponse,
  VendReqDto,
  VendResponseData,
} from "../../../types/vending";
import config from "../../../configs/app/env";
import { logger } from "../../logger/logger";

const apiClient: AxiosInstance = axios.create({
  baseURL: config.buypower_url,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.buypower_key}`,
  },
  timeout: 120000, // 2mins
});

export class BuyPowerAPI {
  // API function to get resource
  public async getAPI(endpoint: string): Promise<BPGetResponse> {
    logger.debug("Fetching data from BuyPower API");
    const response: AxiosResponse<BPGetResponse> =
      await apiClient.get(endpoint);
    return response.data;
  }

  // API function to create resource
  public async postAPI(
    endpoint: string,
    data: VendReqDto
  ): Promise<BPAPIResponse<VendResponseData>> {
    logger.debug("Posting data to BuyPower API");
    const response: AxiosResponse<BPAPIResponse<VendResponseData>> =
      await apiClient.post(endpoint, data);
    return response.data;
  }
}
