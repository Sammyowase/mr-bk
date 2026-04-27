-- CreateEnum
CREATE TYPE "public"."EventStatus" AS ENUM ('active', 'cancelled', 'completed');

-- CreateEnum
CREATE TYPE "public"."AlertPriority" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "public"."AlertCategory" AS ENUM ('maintenance', 'emergency', 'security', 'community', 'general');

-- CreateEnum
CREATE TYPE "public"."EngagementType" AS ENUM ('discussion', 'poll', 'announcement');

-- CreateEnum
CREATE TYPE "public"."InteractionType" AS ENUM ('comment', 'vote', 'reaction');

-- CreateTable
CREATE TABLE "public"."Alert" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" "public"."AlertCategory" NOT NULL,
    "priority" "public"."AlertPriority" NOT NULL,
    "audienceType" TEXT NOT NULL,
    "audienceIds" TEXT[],
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AlertRead" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertRead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Event" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "location" TEXT,
    "audienceType" TEXT NOT NULL,
    "audienceIds" TEXT[],
    "status" "public"."EventStatus" NOT NULL DEFAULT 'active',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EngagementPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "public"."EngagementType" NOT NULL,
    "options" JSONB,
    "audienceType" TEXT NOT NULL,
    "audienceIds" TEXT[],
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "EngagementPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EngagementInteraction" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "interactionType" "public"."InteractionType" NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EngagementInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AlertRead_alertId_userId_key" ON "public"."AlertRead"("alertId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Event_eventId_key" ON "public"."Event"("eventId");

-- AddForeignKey
ALTER TABLE "public"."AlertRead" ADD CONSTRAINT "AlertRead_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "public"."Alert"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AlertRead" ADD CONSTRAINT "AlertRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EngagementInteraction" ADD CONSTRAINT "EngagementInteraction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."EngagementPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EngagementInteraction" ADD CONSTRAINT "EngagementInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
