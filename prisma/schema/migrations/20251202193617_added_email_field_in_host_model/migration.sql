/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Host` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Host` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Host" ADD COLUMN     "email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Host_email_key" ON "Host"("email");
