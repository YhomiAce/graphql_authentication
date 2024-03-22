/*
  Warnings:

  - A unique constraint covering the columns `[biometricKey]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_biometricKey_key" ON "User"("biometricKey");
