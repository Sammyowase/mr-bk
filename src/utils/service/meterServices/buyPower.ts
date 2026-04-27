import axios from "axios";
import discordLogger from "../../logger/discordLogger";
import { logger } from "../../logger/logger";

export const buyPower = async (meterNumber: string, amount: number) => {
  const meterBaseUrl = "https://ami.calinhost.com/api";
  const callingUrl = `${meterBaseUrl}/POS_Purchase`;
  try {
    const vendingBody = {
      company_name: "Rose",
      user_name: "POS1",
      password: "123456",
      password_vend: "123456",
      meter_number: meterNumber,
      customer_number: "",
      customer_name: "",
      is_vend_by_unit: false,
      amount: amount,
    };
    const buyPower = await axios.post(callingUrl, vendingBody);
    return buyPower.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      await discordLogger.logError(
        `Axios error buying power - ${error.response?.data?.message}`
      );
    } else {
      logger.error("Error buying power: ", error);
    }
    return null;
  }
};
