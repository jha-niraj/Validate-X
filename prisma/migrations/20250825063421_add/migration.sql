/*
  Warnings:

  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('MEDIA_VALIDATION', 'DOCUMENT_VALIDATION', 'POLL_VALIDATION', 'LINK_VALIDATION', 'CUSTOM_VALIDATION');

-- CreateEnum
CREATE TYPE "MediaValidationSubtype" AS ENUM ('THUMBNAIL_SELECTION', 'DESIGN_FEEDBACK', 'VIDEO_REVIEW');

-- CreateEnum
CREATE TYPE "DocumentValidationSubtype" AS ENUM ('PROJECT_REVIEW', 'CONTENT_FEEDBACK', 'POLICY_VALIDATION');

-- CreateEnum
CREATE TYPE "PollValidationSubtype" AS ENUM ('BINARY_POLL', 'MULTIPLE_CHOICE', 'RANKING_POLL');

-- CreateEnum
CREATE TYPE "LinkValidationSubtype" AS ENUM ('WEBSITE_USABILITY', 'APP_PROTOTYPE', 'SOCIAL_MEDIA_POST');

-- CreateEnum
CREATE TYPE "CustomValidationSubtype" AS ENUM ('GENERIC_UPLOAD', 'HYBRID_FORMAT', 'OPEN_QUERY');

-- CreateEnum
CREATE TYPE "ValidationType" AS ENUM ('NORMAL', 'DETAILED');

-- CreateEnum
CREATE TYPE "ValidationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('UPI', 'BLOCKCHAIN', 'RAZORPAY', 'PHONEPE', 'POLYGON');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('VALIDATION_EARNING', 'POST_PAYMENT', 'CASHOUT', 'BONUS', 'REFUND');

-- CreateEnum
CREATE TYPE "CashoutStatus" AS ENUM ('PENDING', 'APPROVED', 'COMPLETED', 'REJECTED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SUBMITTER';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "availableBalance" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "interests" TEXT,
ADD COLUMN     "lastCashoutAt" TIMESTAMP(3),
ADD COLUMN     "location" TEXT,
ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "optedOutBalance" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "paytmNumber" TEXT,
ADD COLUMN     "preferredPaymentMethod" "PaymentMethod",
ADD COLUMN     "reputationScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "skills" TEXT,
ADD COLUMN     "totalBalance" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "totalIdeasSubmitted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalValidations" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "upiId" TEXT,
ADD COLUMN     "walletAddress" TEXT,
ADD COLUMN     "website" TEXT,
ALTER COLUMN "image" DROP NOT NULL,
ALTER COLUMN "image" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategorySelection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CategorySelection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "postType" "PostType" NOT NULL,
    "postSubtype" TEXT,
    "mediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "documentUrl" TEXT,
    "linkUrl" TEXT,
    "pollOptions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "pollSettings" TEXT,
    "customInstructions" TEXT,
    "customRequirements" TEXT,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileType" TEXT,
    "normalValidatorCount" INTEGER NOT NULL DEFAULT 500,
    "detailedValidatorCount" INTEGER NOT NULL DEFAULT 100,
    "currentNormalCount" INTEGER NOT NULL DEFAULT 0,
    "currentDetailedCount" INTEGER NOT NULL DEFAULT 0,
    "totalBudget" DECIMAL(10,2) NOT NULL,
    "normalReward" DECIMAL(10,2) NOT NULL,
    "detailedReward" DECIMAL(10,2) NOT NULL,
    "platformFee" DECIMAL(10,2) NOT NULL,
    "allowAIFeedback" BOOLEAN NOT NULL DEFAULT true,
    "detailedApprovalRequired" BOOLEAN NOT NULL DEFAULT true,
    "enableDetailedFeedback" BOOLEAN NOT NULL DEFAULT false,
    "detailedFeedbackStructure" TEXT,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Validation" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "validatorId" TEXT NOT NULL,
    "type" "ValidationType" NOT NULL,
    "vote" TEXT,
    "shortComment" TEXT,
    "mediaResponse" TEXT,
    "pollResponse" TEXT,
    "documentResponse" TEXT,
    "linkResponse" TEXT,
    "customResponse" TEXT,
    "detailedFeedback" TEXT,
    "detailedResponses" TEXT,
    "rating" INTEGER,
    "feedbackFileUrl" TEXT,
    "feedbackFileName" TEXT,
    "isOriginal" BOOLEAN NOT NULL DEFAULT false,
    "originalityScore" DECIMAL(3,2),
    "status" "ValidationStatus" NOT NULL DEFAULT 'PENDING',
    "approvalReason" TEXT,
    "rewardAmount" DECIMAL(10,2) NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Validation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashoutRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "upiId" TEXT,
    "paytmNumber" TEXT,
    "walletAddress" TEXT,
    "status" "CashoutStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "transactionId" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashoutRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" "TransactionType" NOT NULL,
    "method" "PaymentMethod",
    "postId" TEXT,
    "validationId" TEXT,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waiting_list" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waiting_list_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE INDEX "Category_name_idx" ON "Category"("name");

-- CreateIndex
CREATE INDEX "CategorySelection_userId_idx" ON "CategorySelection"("userId");

-- CreateIndex
CREATE INDEX "CategorySelection_categoryId_idx" ON "CategorySelection"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "CategorySelection_userId_categoryId_key" ON "CategorySelection"("userId", "categoryId");

-- CreateIndex
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");

-- CreateIndex
CREATE INDEX "Post_categoryId_idx" ON "Post"("categoryId");

-- CreateIndex
CREATE INDEX "Post_status_idx" ON "Post"("status");

-- CreateIndex
CREATE INDEX "Post_expiryDate_idx" ON "Post"("expiryDate");

-- CreateIndex
CREATE INDEX "Validation_postId_idx" ON "Validation"("postId");

-- CreateIndex
CREATE INDEX "Validation_validatorId_idx" ON "Validation"("validatorId");

-- CreateIndex
CREATE INDEX "Validation_status_idx" ON "Validation"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Validation_postId_validatorId_key" ON "Validation"("postId", "validatorId");

-- CreateIndex
CREATE INDEX "CashoutRequest_userId_idx" ON "CashoutRequest"("userId");

-- CreateIndex
CREATE INDEX "CashoutRequest_status_idx" ON "CashoutRequest"("status");

-- CreateIndex
CREATE INDEX "CashoutRequest_createdAt_idx" ON "CashoutRequest"("createdAt");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");

-- CreateIndex
CREATE INDEX "Transaction_createdAt_idx" ON "Transaction"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "waiting_list_email_key" ON "waiting_list"("email");

-- CreateIndex
CREATE INDEX "waiting_list_email_idx" ON "waiting_list"("email");

-- AddForeignKey
ALTER TABLE "CategorySelection" ADD CONSTRAINT "CategorySelection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategorySelection" ADD CONSTRAINT "CategorySelection_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Validation" ADD CONSTRAINT "Validation_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Validation" ADD CONSTRAINT "Validation_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashoutRequest" ADD CONSTRAINT "CashoutRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
