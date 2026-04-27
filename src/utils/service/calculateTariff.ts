import { container } from "tsyringe";
import PaymentRepository from "../../repository/payment.repository";
import { BadRequestException } from "../exceptions/customException";

export const calculateTariff = async (amount: number): Promise<number> => {
  const repo = container.resolve(PaymentRepository);

  const fee = await repo.findFeeByType("Vending");
  if (!fee) {
    throw new BadRequestException("No vending fee set");
  }

  const chargesRate = fee.rate * 0.01; // Calculate charges rate
  const paystackRate = 1.2 * 0.01; // Calculate paystack rate
  const chargeAmount = amount * chargesRate; // Calculate charge amount
  const paystackCharges = amount * paystackRate; // Calculate paystack charge amount
  const totalCharges = chargeAmount + paystackCharges; // Calculate total charges i.e include paystack charges
  const vendAmount = amount - totalCharges;
  return vendAmount;
};
