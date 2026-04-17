-- CreateEnum
CREATE TYPE "Role" AS ENUM ('DONOR', 'NGO', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "NGOStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'RESUBMITTED');

-- CreateEnum
CREATE TYPE "NGOCategory" AS ENUM ('FOOD_BANK', 'HEALTHCARE', 'EDUCATION', 'SHELTER', 'COMMUNITY');

-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "DonationType" AS ENUM ('ONE_TIME', 'RECURRING');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE', 'FLUTTERWAVE');

-- CreateEnum
CREATE TYPE "FoodItemCategory" AS ENUM ('CANNED_GOODS', 'GRAINS', 'PASTA', 'CONDIMENTS', 'BEVERAGES', 'OTHER');

-- CreateEnum
CREATE TYPE "FoodNeedStatus" AS ENUM ('OPEN', 'FULFILLED', 'CLOSED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "FoodPledgeStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FULFILLED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "UpdateType" AS ENUM ('IMPACT_STORY', 'CAMPAIGN_UPDATE', 'ANNOUNCEMENT', 'THANK_YOU');

-- CreateEnum
CREATE TYPE "UpdateStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('UNREAD', 'READ', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('DONATION_CONFIRMED', 'DONATION_FAILED', 'DONATION_REFUNDED', 'PLEDGE_RECEIVED', 'PLEDGE_CONFIRMED', 'PLEDGE_FULFILLED', 'PLEDGE_CANCELLED', 'PLEDGE_EXPIRING_SOON', 'NGO_APPROVED', 'REJECTED', 'NGO_SUSPENDED', 'UPDATE_PUBLISHED', 'NEW_FOOD_NEED', 'ADMIN_ALERT');

-- CreateEnum
CREATE TYPE "NotificationReferenceType" AS ENUM ('DONATION', 'FOOD_PLEDGE', 'FOOD_NEED', 'NGO', 'UPDATE');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('PENDING', 'ACTIVE', 'REMOVED');

-- CreateEnum
CREATE TYPE "NGOMemberRole" AS ENUM ('OWNER', 'MANAGER', 'STAFF');

-- CreateEnum
CREATE TYPE "AdminDepartment" AS ENUM ('OPERATIONS', 'VERIFICATION', 'CONTENT', 'FINANCE', 'SUPPORT');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('USER_CREATED', 'USER_SUSPENDED', 'USER_REACTIVATED', 'USER_DELETED', 'USER_ROLE_CHANGED', 'ADMIN_PERMISSION_CHANGED', 'NGO_SUBMITTED', 'NGO_APPROVED', 'NGO_REJECTED', 'NGO_SUSPENDED', 'NGO_RESUBMITTED', 'DONATION_COMPLETED', 'DONATION_REFUNDED', 'DONATION_DISPUTED', 'PLEDGE_CREATED', 'PLEDGE_FULFILLED', 'PLEDGE_CANCELLED', 'UPDATE_PUBLISHED', 'UPDATE_FLAGGED', 'UPDATE_ARCHIVED', 'FOOD_NEED_POSTED', 'FOOD_NEED_CLOSED', 'ADMIN_LOGIN');

-- CreateEnum
CREATE TYPE "AuditEntityType" AS ENUM ('USER', 'NGO', 'NGO_MEMBER', 'ADMIN_MEMBER', 'DONATION', 'FOOD_NEED', 'FOOD_PLEDGE', 'UPDATE', 'NOTIFICATION');

-- CreateEnum
CREATE TYPE "ActorRole" AS ENUM ('DONOR', 'NGO', 'ADMIN', 'SUPER_ADMIN', 'SYSTEM');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'DONOR',
    "avatarUrl" TEXT,
    "firebaseUid" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "canApproveNgos" BOOLEAN NOT NULL DEFAULT false,
    "canManageUsers" BOOLEAN NOT NULL DEFAULT false,
    "canManageContent" BOOLEAN NOT NULL DEFAULT false,
    "canViewAnalytics" BOOLEAN NOT NULL DEFAULT false,
    "canManageAdmins" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ngos" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "description" TEXT NOT NULL,
    "mission" TEXT,
    "category" "NGOCategory" NOT NULL,
    "logoUrl" TEXT,
    "coverUrl" TEXT,
    "website" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Winnipeg',
    "province" TEXT NOT NULL DEFAULT 'Manitoba',
    "country" TEXT NOT NULL DEFAULT 'Canada',
    "postalCode" TEXT NOT NULL,
    "status" "NGOStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "resubmissionCount" INTEGER NOT NULL DEFAULT 0,
    "lastSubmittedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "suspendedAt" TIMESTAMP(3),
    "stripeAccountId" TEXT,
    "managerId" TEXT NOT NULL,
    "verifiedById" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ngos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ngo_members" (
    "id" TEXT NOT NULL,
    "role" "NGOMemberRole" NOT NULL DEFAULT 'STAFF',
    "status" "MemberStatus" NOT NULL DEFAULT 'PENDING',
    "canPostNeeds" BOOLEAN NOT NULL DEFAULT false,
    "canPostUpdates" BOOLEAN NOT NULL DEFAULT false,
    "canManagePledges" BOOLEAN NOT NULL DEFAULT false,
    "canViewDonations" BOOLEAN NOT NULL DEFAULT false,
    "canManageMembers" BOOLEAN NOT NULL DEFAULT false,
    "ngoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joinedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ngo_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_members" (
    "id" TEXT NOT NULL,
    "department" "AdminDepartment" NOT NULL,
    "status" "MemberStatus" NOT NULL DEFAULT 'PENDING',
    "canApproveNgos" BOOLEAN NOT NULL DEFAULT false,
    "canManageUsers" BOOLEAN NOT NULL DEFAULT false,
    "canManageContent" BOOLEAN NOT NULL DEFAULT false,
    "canViewAnalytics" BOOLEAN NOT NULL DEFAULT false,
    "canManageAdmins" BOOLEAN NOT NULL DEFAULT false,
    "canManageDonations" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joinedAt" TIMESTAMP(3),
    "lastActiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donations" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "status" "DonationStatus" NOT NULL DEFAULT 'PENDING',
    "type" "DonationType" NOT NULL DEFAULT 'ONE_TIME',
    "paymentProvider" "PaymentProvider" NOT NULL,
    "providerPaymentId" TEXT NOT NULL,
    "providerTransferId" TEXT,
    "message" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "refundedAt" TIMESTAMP(3),
    "refundReason" TEXT,
    "donorId" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_needs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "itemName" TEXT NOT NULL,
    "itemCategory" "FoodItemCategory" NOT NULL,
    "unit" TEXT NOT NULL,
    "quantityRequired" INTEGER NOT NULL,
    "quantityFulfilled" INTEGER NOT NULL DEFAULT 0,
    "status" "FoodNeedStatus" NOT NULL DEFAULT 'OPEN',
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "dropOffAddress" TEXT,
    "dropOffInstructions" TEXT,
    "imageUrl" TEXT,
    "deadline" TIMESTAMP(3),
    "ngoId" TEXT NOT NULL,
    "postedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_needs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_pledges" (
    "id" TEXT NOT NULL,
    "quantityPledged" INTEGER NOT NULL,
    "status" "FoodPledgeStatus" NOT NULL DEFAULT 'PENDING',
    "dropOffDate" TIMESTAMP(3),
    "droppedOffAt" TIMESTAMP(3),
    "fulfilledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "notes" TEXT,
    "donorId" TEXT NOT NULL,
    "foodNeedId" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "fulfilledById" TEXT,
    "cancelledById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_pledges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "updates" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "summary" TEXT,
    "coverImageUrl" TEXT,
    "type" "UpdateType" NOT NULL,
    "status" "UpdateStatus" NOT NULL DEFAULT 'DRAFT',
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "flaggedReason" TEXT,
    "flaggedAt" TIMESTAMP(3),
    "ngoId" TEXT NOT NULL,
    "postedById" TEXT NOT NULL,
    "flaggedById" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'UNREAD',
    "referenceId" TEXT,
    "referenceType" "NotificationReferenceType",
    "isSent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "actorRole" "ActorRole" NOT NULL,
    "entityType" "AuditEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "previousState" JSONB,
    "newState" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "notes" TEXT,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donor_preferences" (
    "id" TEXT NOT NULL,
    "categories" "NGOCategory"[],
    "maxDonationAmount" DECIMAL(10,2),
    "preferAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "notifyOnNewNeeds" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnImpact" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnCampaigns" BOOLEAN NOT NULL DEFAULT true,
    "aiSuggestionsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "lastSuggestedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donor_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_firebaseUid_key" ON "users"("firebaseUid");

-- CreateIndex
CREATE INDEX "users_firebaseUid_idx" ON "users"("firebaseUid");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "ngos_slug_key" ON "ngos"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ngos_email_key" ON "ngos"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ngos_managerId_key" ON "ngos"("managerId");

-- CreateIndex
CREATE INDEX "ngos_status_idx" ON "ngos"("status");

-- CreateIndex
CREATE INDEX "ngos_category_idx" ON "ngos"("category");

-- CreateIndex
CREATE INDEX "ngos_city_idx" ON "ngos"("city");

-- CreateIndex
CREATE INDEX "ngos_managerId_idx" ON "ngos"("managerId");

-- CreateIndex
CREATE UNIQUE INDEX "ngo_members_ngoId_userId_key" ON "ngo_members"("ngoId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "admin_members_userId_key" ON "admin_members"("userId");

-- CreateIndex
CREATE INDEX "donations_donorId_idx" ON "donations"("donorId");

-- CreateIndex
CREATE INDEX "donations_ngoId_idx" ON "donations"("ngoId");

-- CreateIndex
CREATE INDEX "donations_status_idx" ON "donations"("status");

-- CreateIndex
CREATE INDEX "donations_paymentProvider_idx" ON "donations"("paymentProvider");

-- CreateIndex
CREATE INDEX "food_needs_ngoId_idx" ON "food_needs"("ngoId");

-- CreateIndex
CREATE INDEX "food_needs_status_idx" ON "food_needs"("status");

-- CreateIndex
CREATE INDEX "food_needs_isUrgent_idx" ON "food_needs"("isUrgent");

-- CreateIndex
CREATE INDEX "food_needs_itemCategory_idx" ON "food_needs"("itemCategory");

-- CreateIndex
CREATE INDEX "food_pledges_donorId_idx" ON "food_pledges"("donorId");

-- CreateIndex
CREATE INDEX "food_pledges_ngoId_idx" ON "food_pledges"("ngoId");

-- CreateIndex
CREATE INDEX "food_pledges_foodNeedId_idx" ON "food_pledges"("foodNeedId");

-- CreateIndex
CREATE INDEX "food_pledges_status_idx" ON "food_pledges"("status");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_userId_status_idx" ON "notifications"("userId", "status");

-- CreateIndex
CREATE INDEX "notifications_expiresAt_idx" ON "notifications"("expiresAt");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_idx" ON "audit_logs"("actorId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "donor_preferences_userId_key" ON "donor_preferences"("userId");

-- CreateIndex
CREATE INDEX "donor_preferences_userId_idx" ON "donor_preferences"("userId");

-- AddForeignKey
ALTER TABLE "ngos" ADD CONSTRAINT "ngos_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngos" ADD CONSTRAINT "ngos_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngo_members" ADD CONSTRAINT "ngo_members_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "ngos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngo_members" ADD CONSTRAINT "ngo_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngo_members" ADD CONSTRAINT "ngo_members_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_members" ADD CONSTRAINT "admin_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_members" ADD CONSTRAINT "admin_members_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "ngos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_needs" ADD CONSTRAINT "food_needs_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "ngos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_needs" ADD CONSTRAINT "food_needs_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_pledges" ADD CONSTRAINT "food_pledges_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_pledges" ADD CONSTRAINT "food_pledges_foodNeedId_fkey" FOREIGN KEY ("foodNeedId") REFERENCES "food_needs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_pledges" ADD CONSTRAINT "food_pledges_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "ngos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_pledges" ADD CONSTRAINT "food_pledges_fulfilledById_fkey" FOREIGN KEY ("fulfilledById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_pledges" ADD CONSTRAINT "food_pledges_cancelledById_fkey" FOREIGN KEY ("cancelledById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "updates" ADD CONSTRAINT "updates_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "ngos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "updates" ADD CONSTRAINT "updates_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "updates" ADD CONSTRAINT "updates_flaggedById_fkey" FOREIGN KEY ("flaggedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donor_preferences" ADD CONSTRAINT "donor_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
