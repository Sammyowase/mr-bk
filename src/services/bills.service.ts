import { BPAPIResponse } from "../types/api-client";
import {
  BPBalanceData,
  BPCheckDisco,
  BPCheckMeter,
  BPPrice,
  BPPriceList,
  BPTxnHistory,
  RequeryTxnResponse,
  RequeryTxnResponseData,
  VendCategory,
  VendReqDto,
  VendResponseData,
} from "../types/vending";
import { BadRequestException } from "../utils/exceptions/customException";
import { logger } from "../utils/logger/logger";
import { BuyPowerAPI } from "../utils/service/api/buypowerapi";

export class BillsService {
  private readonly client: BuyPowerAPI;
  constructor(client: BuyPowerAPI) {
    this.client = client;
  }

  /**
   * Makes a bill purchase.
   *
   * @param dto - The data transfer object containing details of the bill to be purchased.
   *
   * @returns A promise that resolves with the response from the bill payment provider.
   *
   * @throws BadRequestException if the purchase fails.
   */
  public async vendBill(
    dto: VendReqDto,
  ): Promise<BPAPIResponse<VendResponseData>> {
    const endpoint =
      dto.vertical === VendCategory.VTU ? "/vend?strict=1" : "/vend?strict=0";
    const result = await this.client.postAPI(endpoint, dto);

    // Add log for debugging
    logger.debug(result);

    if (result.status) {
      return result;
    } else {
      throw new BadRequestException(result.message);
    }
  }

  /**
   * Retrieves the status of a transaction.
   *
   * @param {string} order_id - The order_id of the transaction.
   *
   * @returns {Promise<RequeryTxnResponseData>} A promise that resolves with the transaction status.
   *
   * @throws {BadRequestException} If unable to retrieve the transaction status.
   */
  public async requery(order_id: string): Promise<RequeryTxnResponseData> {
    const endpoint = `/transaction/${order_id}`;
    const result = (await this.client.getAPI(endpoint)) as RequeryTxnResponse;

    // Add log for debugging
    logger.debug(result.result.status);

    if (result.result.status) {
      return result.result.data;
    } else {
      throw new BadRequestException("Transaction requery failed");
    }
  }

  /**
   * Retrieves the wallet balance.
   *
   * @returns {Promise<BPBalanceData>} A promise that resolves with the wallet balance.
   *
   * @throws {BadRequestException} If unable to retrieve the wallet balance.
   */

  public async balance(): Promise<BPBalanceData> {
    const endpoint = "/wallet/balance";
    const result = (await this.client.getAPI(endpoint)) as BPBalanceData;

    if (result.balance) {
      return result;
    } else {
      throw new BadRequestException("Unable to retrieve wallet balance");
    }
  }

  /**
   * Retrieves the transaction history within a specified date range.
   *
   * @param {number} limit - The maximum number of transactions to retrieve.
   * @param {string} start - The start date for the transaction history in ISO format.
   * @param {string} end - The end date for the transaction history in ISO format.
   *
   * @returns {Promise<BPTxnHistory>} A promise that resolves with the transaction history.
   *
   * @throws {BadRequestException} If unable to retrieve transaction history.
   */

  public async history(
    limit: string,
    start: string,
    end: string,
  ): Promise<Partial<BPTxnHistory>> {
    const limitInt = parseInt(limit) || 10;

    const endpoint = `/transactions?limit=${limitInt}&start=${start}&end=${end}`;

    const result = (await this.client.getAPI(endpoint)) as BPTxnHistory;

    if (result.status === "ok") {
      return {
        data: result.data,
        meta: result.meta,
      };
    } else {
      throw new BadRequestException("Unable to retrieve transaction history");
    }
  }

  /**
   * Retrieves the list of prices for a given vertical and provider.
   *
   * @param {string} vertical - The vertical for which the prices are being retrieved.
   * @param {string} provider - The provider for which the prices are being retrieved.
   *
   * @returns {Promise<BPPriceList>} A promise that resolves with the list of prices.
   *
   * @throws {BadRequestException} If the prices cannot be retrieved.
   */
  public async productPrices(
    vertical: string,
    provider: string,
  ): Promise<BPPrice[]> {
    const endpoint = `/tariff/?vertical=${vertical}&provider=${provider}`;
    const result = (await this.client.getAPI(endpoint)) as BPPriceList;

    // Add log for debugging
    logger.debug(result);

    if (result.status === "ok") {
      return result.data;
    } else {
      throw new BadRequestException("Unable to retrieve product prices");
    }
  }

  /**
   * Retrieves the status of a specific meter number.
   *
   * @param {string} meterNumber - The number of the meter whose status is to be retrieved.
   * @param {string} disco - The disco code of the meter.
   * @param {string} vendType - The type of vending operation.
   * @param {string} vertical - The vertical for which the meter status is being retrieved.
   *
   * @returns {Promise<BPCheckMeter>} A promise that resolves with the meter status.
   *
   * @throws {BadRequestException} If the meter status cannot be retrieved.
   */
  public async checkTopUpMeter(
    meterNumber: string,
    disco: string,
    vendType: string,
    vertical: string,
  ): Promise<BPCheckMeter> {
    const endpoint = `/check/meter?meter=${meterNumber}&disco=${disco}&vendType=${vendType}&vertical=${vertical}&orderId=false`;

    const result = (await this.client.getAPI(endpoint)) as BPCheckMeter;

    // Add log for debugging
    logger.debug(result);

    if (!result.error) {
      return result;
    } else {
      throw new BadRequestException("Unable to check meter status");
    }
  }

  /**
   * Retrieves the status of discos.
   *
   * @returns {Promise<BPCheckDisco>} A promise that resolves with the status of discos.
   */
  public async checkDisco(): Promise<BPCheckDisco> {
    const endpoint = `/discos/status`;

    const result = (await this.client.getAPI(endpoint)) as BPCheckDisco;

    return result;
  }
}

// Create an instance of the BillsService
export const billService = new BillsService(new BuyPowerAPI());
