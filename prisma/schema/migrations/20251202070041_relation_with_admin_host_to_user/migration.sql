-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "HostContactPreference" AS ENUM ('EMAIL', 'PHONE', 'BOTH');

-- CreateTable
CREATE TABLE "Host" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "name" TEXT NOT NULL,
    "contactNumber" TEXT,
    "bio" TEXT,
    "experience" TEXT,
    "specialties" TEXT,
    "rating" DOUBLE PRECISION DEFAULT 0,
    "reviewCount" INTEGER DEFAULT 0,
    "websiteUrl" TEXT,
    "facebookUrl" TEXT,
    "instagramUrl" TEXT,
    "linkedinUrl" TEXT,
    "city" TEXT,
    "country" TEXT,
    "address" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "identityDocument" TEXT,
    "verificationStatus" "VerificationStatus" DEFAULT 'PENDING',
    "preferredCommunication" "HostContactPreference" DEFAULT 'EMAIL',
    "payoutMethod" TEXT,
    "payoutAccount" TEXT,
    "maxEventLimit" INTEGER DEFAULT 10,
    "totalEventsHosted" INTEGER DEFAULT 0,
    "totalParticipants" INTEGER DEFAULT 0,
    "totalEarnings" DOUBLE PRECISION DEFAULT 0,
    "lastActiveAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Host_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "phoneNumber" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "canManageUsers" BOOLEAN NOT NULL DEFAULT true,
    "canManageHosts" BOOLEAN NOT NULL DEFAULT true,
    "canManageEvents" BOOLEAN NOT NULL DEFAULT true,
    "canManagePayments" BOOLEAN NOT NULL DEFAULT true,
    "canVerifyHosts" BOOLEAN NOT NULL DEFAULT true,
    "canSuspendAccounts" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "lastActiveAt" TIMESTAMP(3),
    "loginCount" INTEGER DEFAULT 0,
    "adminNotes" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Host_email_key" ON "Host"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- AddForeignKey
ALTER TABLE "Host" ADD CONSTRAINT "Host_email_fkey" FOREIGN KEY ("email") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_email_fkey" FOREIGN KEY ("email") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
