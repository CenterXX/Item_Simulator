import prisma from "../prismaClient.js";

// 아이템 판매 API
export const sellItems = async (req, res) => {
  const { id } = req.params;
  const itemsToSell = req.body;

  try {
    const character = await prisma.character.findUnique({
      where: { id: parseInt(id) },
    });

    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }

    let totalGain = 0;

    for (let sell of itemsToSell) {
      const { item_code, count } = sell;
      const item = await prisma.item.findUnique({ where: { item_code } });

      if (!item) {
        return res
          .status(400)
          .json({ message: `Item with code ${item_code} not found` });
      }

      const inventoryItem = await prisma.inventory.findUnique({
        where: {
          characterId_itemId: { characterId: character.id, itemId: item.id },
        },
      });

      if (!inventoryItem || inventoryItem.quantity < count) {
        return res.status(400).json({ message: `Not enough items to sell` });
      }

      totalGain += Math.floor(item.item_price * 0.6) * count;

      if (inventoryItem.quantity === count) {
        await prisma.inventory.delete({ where: { id: inventoryItem.id } });
      } else {
        await prisma.inventory.update({
          where: { id: inventoryItem.id },
          data: { quantity: inventoryItem.quantity - count },
        });
      }
    }

    const updatedCharacter = await prisma.character.update({
      where: { id: character.id },
      data: { money: character.money + totalGain },
    });

    res.json({ money: updatedCharacter.money });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to sell items" });
  }
};
