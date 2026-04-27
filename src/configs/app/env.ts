import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  domain: string;
  appSecret: string;
  accessTokenEx: number;
  refreshTokenEx: number;
  redisOptions: {
    host: string;
    port: number;
    username?: string;
    password?: string;
  };
  buypower_url: string;
  buypower_key: string;
  paystack_secret: string;
  client_url: string;
  sms_account_sid: string;
  sms_auth_token: string;
  sms_phone_number: string;
  mail_host: string;
  mail_port: number;
  secure: boolean;
  mail_username: string;
  mail_password: string;
  mail_from_name: string;
  discord_webhook: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  domain: process.env.DOMAIN || "http://localhost:3000",
  appSecret: process.env.APP_SECRET || "default",
  accessTokenEx: Number(process.env.ACCESS_TOKEN_EX) || 60 * 15,
  refreshTokenEx: Number(process.env.REFRESH_TOKEN_EX) || 60 * 60 * 24 * 7,
  redisOptions: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    username: process.env.REDIS_USERNAME || "", // Optional, if your Redis server requires authentication
    password: process.env.REDIS_PASSWORD || "", // Optional, if your Redis server requires authentication
  },
  buypower_url: process.env.BUYPOWER_URL || "",
  buypower_key: process.env.BUYPOWER_KEY || "",
  paystack_secret: process.env.PAYSTACK_SECRET || "secret",
  client_url: process.env.CLIENT_URL || "http://localhost:5173",
  sms_account_sid: process.env.TWILIO_ACCOUNT_SID || "",
  sms_auth_token: process.env.TWILIO_AUTH_TOKEN || "",
  sms_phone_number: process.env.TWILIO_PHONE_NUMBER || "",
  mail_host: process.env.MAIL_HOST || "",
  mail_port: Number(process.env.MAIL_PORT) || 587,
  mail_username: process.env.MAIL_USERNAME || "",
  mail_password: process.env.MAIL_PASSWORD || "",
  secure: Boolean(process.env.MAIL_SECURE) ?? false,
  mail_from_name: process.env.MAIL_FROM_NAME || "Miraton Rose Africa",
  discord_webhook: process.env.DISCORD_WEBHOOK_URL || "",
};

export default config;
