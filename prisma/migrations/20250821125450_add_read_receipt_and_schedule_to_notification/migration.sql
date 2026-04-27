/*
  Warnings:

  - You are about to drop the column `accessTokenId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `recipientId` on the `Notification` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_accessTokenId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_recipientId_fkey";

-- AlterTable
ALTER TABLE "public"."Notification" DROP COLUMN "accessTokenId",
DROP COLUMN "recipientId",
ADD COLUMN     "readAt" TIMESTAMP(3),
ADD COLUMN     "recipientIds" TEXT[],
ADD COLUMN     "scheduledAt" TIMESTAMP(3),
ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
