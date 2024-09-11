/*
  Warnings:

  - A unique constraint covering the columns `[characterId,itemId]` on the table `Inventory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Inventory_characterId_itemId_key` ON `Inventory`(`characterId`, `itemId`);
