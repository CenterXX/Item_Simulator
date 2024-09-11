/*
  Warnings:

  - Added the required column `quantity` to the `Inventory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Inventory` ADD COLUMN `quantity` INTEGER NOT NULL;
