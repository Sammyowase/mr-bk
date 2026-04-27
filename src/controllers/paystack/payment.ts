import { Request, Response } from "express";
import sendResponse from "../../utils/http/sendResponse";
import PaymentService from "../../services/payment.service";
import { container } from "../../utils/handler/container";

export const webhook = async (req: Request, res: Response) => {
  const service = container.resolve(PaymentService);

  await service.paystackWebhook(req);

  // Send a 200 OK response to acknowledge receipt of the webhook
  return sendResponse(res, 200, "success", {
    status: "success",
    message: "Webhook received",
  });
};
