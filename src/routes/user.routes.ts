import express from "express";
import { registerUser } from "../controllers/userControllers/userRegister";
import { userLogin } from "../controllers/userControllers/userLogin";
import { verifyOTP } from "../controllers/userControllers/verifyOTP";
import { addUserMeter } from "../controllers/userControllers/addUserMeter";
import getTransactions from "../controllers/userControllers/getTrxns";
import expressAsyncHandler from "express-async-handler";
import {
  AddUserMeterValidator,
  CompleteRegistrationValidator,
  DeleteUserValidator,
  GetResidentDetailsValidator,
  GetResidentDetailsByQueryValidator,
  GetUserDetailsValidator,
  InviteUserValidator,
  RegisterValidator,
  RestoreUserValidator,
  UpdateUserValidator,
  VerifyEmailValidator,
} from "../utils/validator/user";
import Validate from "../middleware/validate";
import { LoginValidator } from "../utils/validator/admin";
import RolesGuard from "../middleware/rolesGuard";
import Authorize from "../middleware/authorization";
import { Role } from "../../prisma/generated/prisma";
import { updateUser } from "../controllers/userControllers/updateUser";
import { getAllUsers } from "../controllers/userControllers/getAllUsers";
import { assignSecurityRole } from "../controllers/userControllers/assignSecurityRole";
import { assignSecurityRoleValidator } from "../utils/validator/access-control";
import { inviteUser } from "../controllers/userControllers/inviteUser";
import { completeRegistration } from "../controllers/userControllers/completeRegistration";
import { getUserDetails } from "../controllers/userControllers/getUserDetails";
import { getResidentDetails } from "../controllers/userControllers/getResidentDetails";
import { getResidentDetailsByQuery } from "../controllers/userControllers/getResidentDetailsByQuery";
import { updateProfile } from "../controllers/userControllers/updateProfile";
import { restoreUserAccount } from "../controllers/userControllers/restoreUserAccount";
import { deleteUserAccount } from "../controllers/userControllers/deleteUserAccount";

const userRoutes = express.Router();

userRoutes.patch(
  "/profile/me",
  Authorize,
  UpdateUserValidator,
  Validate,
  expressAsyncHandler(updateProfile),
);

userRoutes.patch(
  "/restore/:id",
  Authorize,
  RolesGuard([Role.super_admin, Role.admin]),
  RestoreUserValidator,
  Validate,
  expressAsyncHandler(restoreUserAccount),
);

userRoutes.patch(
  "/:id",
  Authorize,
  RolesGuard([
    Role.super_admin,
    Role.admin,
    Role.manager,
    Role.houseowner,
    Role.user,
  ]),
  UpdateUserValidator,
  Validate,
  expressAsyncHandler(updateUser),
);

userRoutes.delete(
  "/:id",
  Authorize,
  RolesGuard([Role.super_admin, Role.admin, Role.user]),
  DeleteUserValidator,
  Validate,
  expressAsyncHandler(deleteUserAccount),
);

userRoutes.post(
  "/invite",
  Authorize,
  RolesGuard([Role.super_admin, Role.admin, Role.manager]),
  InviteUserValidator,
  Validate,
  expressAsyncHandler(inviteUser),
);

userRoutes.post(
  "/complete-registration",
  CompleteRegistrationValidator,
  Validate,
  expressAsyncHandler(completeRegistration),
);
userRoutes.post(
  "/register",
  RegisterValidator,
  Validate,
  expressAsyncHandler(registerUser),
);

userRoutes.post(
  "/verify-otp",
  VerifyEmailValidator,
  Validate,
  expressAsyncHandler(verifyOTP),
);

userRoutes.post(
  "/add-meter",
  AddUserMeterValidator,
  Validate,
  expressAsyncHandler(addUserMeter),
);

userRoutes.post(
  "/login",
  LoginValidator,
  Validate,
  expressAsyncHandler(userLogin),
);

userRoutes.get(
  "/transactions",
  Authorize,
  RolesGuard([
    Role.super_admin,
    Role.admin,
    Role.manager,
    Role.user,
    Role.houseowner,
  ]),
  expressAsyncHandler(getTransactions),
);

userRoutes.get(
  "/resident/:userId",
  Authorize,
  RolesGuard([Role.super_admin, Role.admin, Role.manager]),
  GetResidentDetailsValidator,
  Validate,
  expressAsyncHandler(getResidentDetails),
);

userRoutes.get(
  "/resident",
  Authorize,
  RolesGuard([Role.super_admin, Role.admin, Role.manager]),
  GetResidentDetailsByQueryValidator,
  Validate,
  expressAsyncHandler(getResidentDetailsByQuery),
);

userRoutes.get(
  "/:id",
  Authorize,
  RolesGuard([Role.super_admin, Role.admin, Role.manager]),
  GetUserDetailsValidator,
  Validate,
  expressAsyncHandler(getUserDetails),
);

userRoutes.get(
  "/",
  Authorize,
  RolesGuard([
    Role.super_admin,
    Role.admin,
    Role.manager,
    Role.user,
    Role.houseowner,
  ]),
  expressAsyncHandler(getAllUsers),
);

userRoutes.patch(
  "/role",
  Authorize,
  RolesGuard([Role.super_admin, Role.admin]),
  assignSecurityRoleValidator,
  Validate,
  expressAsyncHandler(assignSecurityRole),
);

export default userRoutes;
