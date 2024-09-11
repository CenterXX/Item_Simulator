import prisma from "../prismaClient.js";

// 아이템 구입 API
export const purchaseItems = async (req, res) => {
  const { id } = req.params;
  const itemsToPurchase = req.body;

  try {
    const character = await prisma.character.findUnique({
      where: { id: parseInt(id) },
    });

    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }

    let totalPrice = 0;
    const inventoryUpdates = [];

    for (let purchase of itemsToPurchase) {
      const { item_code, count } = purchase;
      const item = await prisma.item.findFirst({ where: { item_code } });

      if (!item) {
        return res
          .status(400)
          .json({ message: `Item with code ${item_code} not found` });
      }

      totalPrice += item.item_price * count;
      inventoryUpdates.push({
        characterId: character.id,
        itemId: item.id,
        quantity: count, // 여기에서 item_count 대신 quantity 사용
      });
    }

    if (totalPrice > character.money) {
      return res
        .status(400)
        .json({ message: "Insufficient funds to purchase items" });
    }

    const updatedCharacter = await prisma.character.update({
      where: { id: character.id },
      data: { money: character.money - totalPrice },
    });

    for (let update of inventoryUpdates) {
      const existingInventoryItem = await prisma.inventory.findFirst({
        where: {
          characterId: update.characterId,
          itemId: update.itemId,
        },
      });

      if (existingInventoryItem) {
        await prisma.inventory.update({
          where: { id: existingInventoryItem.id },
          data: { quantity: existingInventoryItem.quantity + update.quantity },
        });
      } else {
        await prisma.inventory.create({ data: update });
      }
    }

    res.json({ money: updatedCharacter.money });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to purchase items" });
  }
};
