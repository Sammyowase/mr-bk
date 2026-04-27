-- CreateEnum
CREATE TYPE "public"."AccessType" AS ENUM ('qr', 'numeric');

-- CreateEnum
CREATE TYPE "public"."AccessStatus" AS ENUM ('active', 'used', 'revoked', 'expired');

-- CreateEnum
CREATE TYPE "public"."AccessDecision" AS ENUM ('granted', 'denied', 'pending');

-- CreateEnum
CREATE TYPE "public"."AccessPointType" AS ENUM ('main_gate', 'pedestrian_gate', 'service_gate', 'parking_entry', 'parking_exit', 'reception_door', 'apartment_door', 'elevator', 'clubhouse', 'gym_entrance', 'pool_area', 'playground', 'utility_room', 'security_room', 'back_exit', 'rooftop_access', 'basement_entry', 'visitor_kiosk', 'bike_locker', 'ev_charging_station');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('sms', 'email', 'whatsapp', 'push', 'inapp');

-- CreateEnum
CREATE TYPE "public"."NotificationStatus" AS ENUM ('pending', 'sent', 'failed');

-- CreateEnum
CREATE TYPE "public"."HouseType" AS ENUM ('mansion', 'duplex', 'bungalow', 'flat', 'penthouse', 'terrace', 'semi_detached', 'detached', 'traditional');

-- CreateEnum
CREATE TYPE "public"."MeterType" AS ENUM ('single_single', 'singledual', 'three_single', 'three_dual', 'max200', 'max500');

-- CreateEnum
CREATE TYPE "public"."MeterStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "public"."PaymentAccountType" AS ENUM ('default', 'power', 'service_charge');

-- CreateEnum
CREATE TYPE "public"."ChargeBearer" AS ENUM ('facility', 'customer');

-- CreateEnum
CREATE TYPE "public"."PaymentAccountProvider" AS ENUM ('paystack', 'providus');

-- CreateEnum
CREATE TYPE "public"."PropertyType" AS ENUM ('estate', 'building', 'apartment');

-- CreateEnum
CREATE TYPE "public"."TrxnChannel" AS ENUM ('paystack', 'shanono');

-- CreateEnum
CREATE TYPE "public"."TrxnStatus" AS ENUM ('success', 'failed', 'pending', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('security', 'admin', 'manager', 'user', 'houseowner', 'super_admin');

-- CreateEnum
CREATE TYPE "public"."TrxnCategory" AS ENUM ('electricity', 'bill', 'wallet', 'service_charge');

-- CreateEnum
CREATE TYPE "public"."TrxnType" AS ENUM ('airtime', 'internet', 'tv', 'electricity', 'deposit', 'withdrawal');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role" "public"."Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."House" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "meterId" TEXT,
    "type" "public"."HouseType" NOT NULL DEFAULT 'flat',
    "address" VARCHAR(255) NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "House_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Meter" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT,
    "houseId" TEXT,
    "ownerId" TEXT,
    "type" "public"."MeterType" NOT NULL DEFAULT 'three_dual',
    "name" TEXT,
    "number" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "vat" DOUBLE PRECISION,
    "status" "public"."MeterStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Otp" (
    "id" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "data" VARCHAR(1000),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Property" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."PropertyType" NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "tarrif" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION,
    "managerId" TEXT,
    "minVend" DOUBLE PRECISION,
    "maxVend" DOUBLE PRECISION,
    "authorId" TEXT NOT NULL,
    "auditRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT,
    "houseId" TEXT,
    "meterNumber" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "token" TEXT,
    "units" TEXT,
    "trxnRef" TEXT,
    "trxnPayload" VARCHAR(1000),
    "tokenPayload" VARCHAR(1000),
    "status" "public"."TrxnStatus" NOT NULL DEFAULT 'pending',
    "channel" "public"."TrxnChannel" NOT NULL,
    "type" "public"."TrxnType" NOT NULL DEFAULT 'electricity',
    "category" "public"."TrxnCategory" NOT NULL DEFAULT 'electricity',
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "meterId" TEXT,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WithdrawalBank" (
    "id" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "bank_code" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WithdrawalBank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PaymentSplit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "split_code" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "PaymentSplit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "ref" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "description" TEXT,
    "propertyId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("ref")
);

-- CreateTable
CREATE TABLE "public"."Restriction" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "Restriction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserRestriction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "restrictionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRestriction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Fee" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Fee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AccessPoint" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."AccessPointType" NOT NULL,
    "propertyId" TEXT NOT NULL,
    "houseId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AccessToken" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "public"."AccessType" NOT NULL,
    "status" "public"."AccessStatus" NOT NULL DEFAULT 'active',
    "issuedById" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "guestPhotoUrl" TEXT,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "accesspointId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GuestEntry" (
    "id" TEXT NOT NULL,
    "accessTokenId" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "guestItems" TEXT,
    "securityId" TEXT NOT NULL,
    "accessPointId" TEXT NOT NULL,
    "photoCapturedUrl" TEXT,
    "entryTime" TIMESTAMP(3) NOT NULL,
    "exitTime" TIMESTAMP(3),
    "accessStatus" "public"."AccessDecision" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "public"."NotificationType"[],
    "recipientId" TEXT NOT NULL,
    "status" "public"."NotificationStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accessTokenId" TEXT,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" BOOLEAN NOT NULL DEFAULT true,
    "sms" BOOLEAN NOT NULL DEFAULT true,
    "push" BOOLEAN NOT NULL DEFAULT true,
    "inApp" BOOLEAN NOT NULL DEFAULT true,
    "newsletter" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SecurityAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "SecurityAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Meter_houseId_key" ON "public"."Meter"("houseId");

-- CreateIndex
CREATE UNIQUE INDEX "Meter_number_key" ON "public"."Meter"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Property_name_key" ON "public"."Property"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Property_managerId_key" ON "public"."Property"("managerId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentSplit_propertyId_key" ON "public"."PaymentSplit"("propertyId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_role_action_propertyId_idx" ON "public"."AuditLog"("userId", "role", "action", "propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "Restriction_type_key" ON "public"."Restriction"("type");

-- CreateIndex
CREATE UNIQUE INDEX "UserRestriction_userId_restrictionId_key" ON "public"."UserRestriction"("userId", "restrictionId");

-- CreateIndex
CREATE UNIQUE INDEX "Fee_type_key" ON "public"."Fee"("type");

-- CreateIndex
CREATE UNIQUE INDEX "AccessToken_code_key" ON "public"."AccessToken"("code");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "public"."NotificationPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SecurityAssignment_userId_propertyId_key" ON "public"."SecurityAssignment"("userId", "propertyId");

-- AddForeignKey
ALTER TABLE "public"."House" ADD CONSTRAINT "House_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."House" ADD CONSTRAINT "House_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Meter" ADD CONSTRAINT "Meter_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Meter" ADD CONSTRAINT "Meter_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "public"."House"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Meter" ADD CONSTRAINT "Meter_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Property" ADD CONSTRAINT "Property_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Property" ADD CONSTRAINT "Property_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "public"."House"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_meterId_fkey" FOREIGN KEY ("meterId") REFERENCES "public"."Meter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WithdrawalBank" ADD CONSTRAINT "WithdrawalBank_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentSplit" ADD CONSTRAINT "PaymentSplit_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserRestriction" ADD CONSTRAINT "UserRestriction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserRestriction" ADD CONSTRAINT "UserRestriction_restrictionId_fkey" FOREIGN KEY ("restrictionId") REFERENCES "public"."Restriction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AccessPoint" ADD CONSTRAINT "AccessPoint_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AccessPoint" ADD CONSTRAINT "AccessPoint_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "public"."House"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AccessToken" ADD CONSTRAINT "AccessToken_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AccessToken" ADD CONSTRAINT "AccessToken_accesspointId_fkey" FOREIGN KEY ("accesspointId") REFERENCES "public"."AccessPoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GuestEntry" ADD CONSTRAINT "GuestEntry_accessTokenId_fkey" FOREIGN KEY ("accessTokenId") REFERENCES "public"."AccessToken"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GuestEntry" ADD CONSTRAINT "GuestEntry_securityId_fkey" FOREIGN KEY ("securityId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GuestEntry" ADD CONSTRAINT "GuestEntry_accessPointId_fkey" FOREIGN KEY ("accessPointId") REFERENCES "public"."AccessPoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_accessTokenId_fkey" FOREIGN KEY ("accessTokenId") REFERENCES "public"."AccessToken"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SecurityAssignment" ADD CONSTRAINT "SecurityAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SecurityAssignment" ADD CONSTRAINT "SecurityAssignment_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
