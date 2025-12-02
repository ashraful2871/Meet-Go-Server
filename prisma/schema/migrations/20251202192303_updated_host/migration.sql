/*
  Warnings:

  - You are about to drop the column `email` on the `Host` table. All the data in the column will be lost.
  - Made the column `verificationStatus` on table `Host` required. This step will fail if there are existing NULL values in that column.
  - Made the column `preferredCommunication` on table `Host` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Host_email_key";

-- AlterTable
ALTER TABLE "Host" DROP COLUMN "email",
ALTER COLUMN "verificationStatus" SET NOT NULL,
ALTER COLUMN "preferredCommunication" SET NOT NULL;
