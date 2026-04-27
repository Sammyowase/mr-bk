import { Router } from "express";
import Authorize from "../middleware/authorization";
import RolesGuard from "../middleware/rolesGuard";
import {
  getBPHistoryValidator,
  getMeterStatusValidator,
  getProductListValidator,
  makeBillPaymentValidator,
  requeryBPValidator,
} from "../utils/validator/vending";
import { Role } from "../../prisma/generated/prisma";
import expressAsyncHandler from "express-async-handler";
import Validate from "../middleware/validate";
import { makeBillPayment } from "../controllers/vendingControllers/initBillPayment";
import { getBPBalance } from "../controllers/billsControllers/balance";
import { requeryBPTransaction } from "../controllers/billsControllers/requery";
import { getProductPriceList } from "../controllers/billsControllers/productPrices";
import { getBPTxnHistory } from "../controllers/billsControllers/history";
import { checkTopUpMeter } from "../controllers/billsControllers/checkTopUpMeter";
import { checkDiscos } from "../controllers/billsControllers/checkDiscos";

const billsRoutes = Router();
billsRoutes.use(Authorize);

billsRoutes.post(
  "/pay",
  RolesGuard([
    Role.super_admin,
    Role.admin,
    Role.manager,
    Role.user,
    Role.houseowner,
  ]),
  makeBillPaymentValidator,
  Validate,
  expressAsyncHandler(makeBillPayment),
);

billsRoutes.get(
  "/balance",
  RolesGuard([Role.super_admin, Role.admin]),
  expressAsyncHandler(getBPBalance),
);

billsRoutes.get(
  "/meter/status",
  getMeterStatusValidator,
  Validate,
  expressAsyncHandler(checkTopUpMeter),
);

billsRoutes.get("/discos", expressAsyncHandler(checkDiscos));

billsRoutes.get(
  "/requery/:orderId",
  requeryBPValidator,
  Validate,
  RolesGuard([Role.super_admin, Role.admin]),
  expressAsyncHandler(requeryBPTransaction),
);

billsRoutes.get(
  "/products",
  getProductListValidator,
  Validate,
  RolesGuard([Role.super_admin, Role.admin]),
  expressAsyncHandler(getProductPriceList),
);

billsRoutes.get(
  "/history",
  getBPHistoryValidator,
  Validate,
  RolesGuard([Role.super_admin, Role.admin]),
  expressAsyncHandler(getBPTxnHistory),
);

export default billsRoutes;
