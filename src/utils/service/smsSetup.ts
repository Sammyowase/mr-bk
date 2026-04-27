import twilio from "twilio";
import config from "../../configs/app/env";
import { MessageInstance } from "twilio/lib/rest/api/v2010/account/message";
import { logger } from "../logger/logger";

export const sendSms = async (
  message: string,
  to: string,
): Promise<MessageInstance["status"] | null> => {
  // Create a client
  const client = twilio(config.sms_account_sid, config.sms_auth_token);

  return client.messages
    .create({ from: config.sms_phone_number, body: message, to })
    .then((message: MessageInstance) => {
      logger.info(`SMS to ${to} is ${message.status}`);
      return message.status;
    })
    .catch((err) => {
      logger.error("Unable to send sms: ", err);
      return null;
    });
};
