import axios from "axios";
import discordLogger from "../../logger/discordLogger";
import { logger } from "../../logger/logger";

export const previewMeter = async (meterNumber: string) => {
  const meterBaseUrl = "https://ami.calinhost.com/api";
  const callingUrl = `${meterBaseUrl}/POS_Preview`;
  const payload = {
    company_name: "Rose",
    user_name: "POS1",
    password: "123456",
    password_vend: "123456",
    meter_number: meterNumber,
    customer_number: "",
    customer_name: "",
  };
  try {
    const meter = await axios.post(callingUrl, payload);
    if (meter.data.result_code) {
      return null;
    }
    return meter.data.result;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const msg = `Axios error fetching meter - ${error.response?.data?.message | error.response?.data}`;
      await discordLogger.logError(msg);
      logger.error(error);
    } else {
      logger.error("Error fetching meter: ", error);
    }
    return null;
  }
};
