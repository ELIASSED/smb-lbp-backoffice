/*
  Warnings:

  - You are about to drop the column `userId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `casStage` on the `SessionUsers` table. All the data in the column will be lost.
  - You are about to drop the column `dateDelivrancePermis` on the `SessionUsers` table. All the data in the column will be lost.
  - You are about to drop the column `etatPermis` on the `SessionUsers` table. All the data in the column will be lost.
  - You are about to drop the column `numeroPermis` on the `SessionUsers` table. All the data in the column will be lost.
  - You are about to drop the column `prefecture` on the `SessionUsers` table. All the data in the column will be lost.
  - Added the required column `sessionUserId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `casStage` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateDelivrancePermis` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `etatPermis` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numeroPermis` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prefecture` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_userId_fkey";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "userId",
ADD COLUMN     "sessionUserId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "SessionUsers" DROP COLUMN "casStage",
DROP COLUMN "dateDelivrancePermis",
DROP COLUMN "etatPermis",
DROP COLUMN "numeroPermis",
DROP COLUMN "prefecture",
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "casStage" TEXT NOT NULL,
ADD COLUMN     "dateDelivrancePermis" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "etatPermis" TEXT NOT NULL,
ADD COLUMN     "numeroPermis" TEXT NOT NULL,
ADD COLUMN     "prefecture" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_sessionUserId_fkey" FOREIGN KEY ("sessionUserId") REFERENCES "SessionUsers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
