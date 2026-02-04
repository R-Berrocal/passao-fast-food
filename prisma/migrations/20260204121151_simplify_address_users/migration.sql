/*
  Warnings:

  - You are about to drop the column `city` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `details` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `label` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `neighborhood` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `street` on the `addresses` table. All the data in the column will be lost.
  - Added the required column `address` to the `addresses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "addresses" DROP COLUMN "city",
DROP COLUMN "details",
DROP COLUMN "label",
DROP COLUMN "neighborhood",
DROP COLUMN "street",
ADD COLUMN     "address" TEXT NOT NULL;
