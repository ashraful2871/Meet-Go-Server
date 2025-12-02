/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Host` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Host` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Host" DROP CONSTRAINT "Host_email_fkey";

-- AlterTable
ALTER TABLE "Host" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Host_userId_key" ON "Host"("userId");

-- AddForeignKey
ALTER TABLE "Host" ADD CONSTRAINT "Host_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
