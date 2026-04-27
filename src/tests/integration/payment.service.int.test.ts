import "reflect-metadata";
import { randomUUID } from "crypto";
import db from "../../models/database";
import {
  House,
  Meter,
  Property,
  Transaction,
  TrxnType,
  User,
} from "../../../prisma/generated/prisma";
import { api } from "../setup";
import crypto from "crypto";
import config from "../../configs/app/env";
import { VendReqDto } from "../../types/vending";
import { billsTestData } from "../unit/data/payment.data";

let user: User;
let property: Property & { Houses: House[] };
let meter: Meter;

describe("Payment Service Integration Tests", () => {
  beforeAll(async () => {
    jest.restoreAllMocks();
    await db.$connect();
    // Create user
    user = await db.user.create({
      data: {
        email: "test@miratonroseafrica.com",
        firstName: "John",
        lastName: "Doe",
        userName: "johndoe",
        phone: "1234567890",
        password: "password123",
        role: "user",
      },
    });
    // Create property, house and meter
    property = await db.property.create({
      data: {
        name: "Property",
        address: "123 Test Street",
        authorId: user.id,
        type: "apartment",
        tarrif: 100,
        Houses: {
          create: {
            name: "Test House",
            address: "123 Test Street",
            authorId: user.id,
          },
        },
      },
      include: {
        Houses: true,
      },
    });

    // Create meter
    meter = await db.meter.create({
      data: {
        number: "47300554780",
        name: "Test Meter",
        propertyId: property.id,
        houseId: property.Houses[0].id,
        ownerId: user.id,
      },
    });
  });

  afterAll(async () => {
    // Delete test data
    const audits = await db.auditLog.findMany();
    for (const audit of audits) {
      await db.auditLog.delete({
        where: {
          ref: audit.ref,
        },
      });
    }
    await db.meter.delete({
      where: {
        id: meter.id,
      },
    });
    await db.house.delete({
      where: {
        id: property.Houses[0].id,
      },
    });
    await db.property.delete({
      where: {
        id: property.id,
      },
    });
    await db.user.delete({
      where: {
        id: user.id,
      },
    });
  });

  describe("Paystack Webhook", () => {
    let transaction: Transaction;
    afterEach(async () => {
      // Delete transaction
      await db.transaction.delete({
        where: {
          id: transaction.id,
        },
      });
    });
    it.skip("should process a valid Paystack webhook and purchase tokens", async () => {
      // Create a transaction in the database with the required data
      transaction = await db.transaction.create({
        data: {
          amount: 200,
          userId: user.id,
          propertyId: property.id,
          houseId: property.Houses[0].id,
          meterNumber: meter.number,
          channel: "paystack",
          category: "electricity",
          type: "electricity",
          trxnRef: randomUUID().split("-")[4],
        },
      });

      // Verify the transaction in the database
      const createdTransaction = await db.transaction.findUnique({
        where: {
          id: transaction.id,
        },
      });
      expect(createdTransaction).toBeDefined();
      // Make a request to the webhook endpoint
      const data = {
        reference: transaction.trxnRef,
        status: "success",
      };

      // Hash the signature
      const hash = crypto
        .createHmac("sha512", config.paystack_secret)
        .update(JSON.stringify({ data }))
        .digest("hex");

      // Make a request to the webhook endpoint
      const response = await api
        .post("/v1/paystack/webhook")
        .send({
          data,
        })
        .set("Content-Type", "application/json")
        .set("x-paystack-signature", hash);
      // Verify the response
      expect(response.status).toBe(200);
      expect(response.body.data.message).toBe("Webhook received");
      // Verify the transaction in the database
      const updatedTransaction = await db.transaction.findUnique({
        where: {
          id: transaction.id,
        },
      });
      expect(updatedTransaction).toBeDefined();
      if (updatedTransaction) {
        expect(updatedTransaction.status).toBe("success");
        expect(updatedTransaction.trxnRef).toBe(transaction.trxnRef);
      }
    }, 120000);

    describe("Bills", () => {
      it.skip.each(billsTestData)(
        "should process a valid Paystack webhook and purchase bill(%s)",
        async (billPayload: VendReqDto, category: TrxnType) => {
          // Create a transaction in the database with the required data
          transaction = await db.transaction.create({
            data: {
              amount: Number(billPayload.amount),
              userId: user.id,
              propertyId: property.id,
              houseId: property.Houses[0].id,
              meterNumber: meter.number,
              channel: "paystack",
              category: "bill",
              tokenPayload: JSON.stringify(billPayload),
              type: category,
              trxnRef: randomUUID().split("-")[4],
            },
          });

          // Verify the transaction in the database
          const createdTransaction = await db.transaction.findUnique({
            where: {
              id: transaction.id,
            },
          });
          expect(createdTransaction).toBeDefined();
          // Make a request to the webhook endpoint
          const data = {
            reference: transaction.trxnRef,
            status: "success",
          };

          // Hash the signature
          const hash = crypto
            .createHmac("sha512", config.paystack_secret)
            .update(JSON.stringify({ data }))
            .digest("hex");

          // Make a request to the webhook endpoint
          const response = await api
            .post("/v1/paystack/webhook")
            .send({
              data,
            })
            .set("Content-Type", "application/json")
            .set("x-paystack-signature", hash);
          // Verify the response
          expect(response.status).toBe(200);
          expect(response.body.data.message).toBe("Webhook received");
          // Verify the transaction in the database
          const updatedTransaction = await db.transaction.findUnique({
            where: {
              id: transaction.id,
            },
          });
          expect(updatedTransaction).toBeDefined();
          if (updatedTransaction) {
            expect(updatedTransaction.status).toBe("success");
            expect(updatedTransaction.trxnRef).toBe(transaction.trxnRef);
          }
        },
        120000,
      );
    });
  });
});
