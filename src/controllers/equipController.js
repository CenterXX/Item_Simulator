import prisma from "../prismaClient.js";

// 아이템 장착 API
export const equipItem = async (req, res) => {
  const { id } = req.params;
  const { item_code } = req.body;

  try {
    const character = await prisma.character.findUnique({
      where: { id: parseInt(id) },
    });

    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }

    const item = await prisma.item.findUnique({ where: { item_code } });
    if (!item) {
      return res.status(400).json({ message: "Item not found" });
    }

    const inventoryItem = await prisma.inventory.findUnique({
      where: {
        characterId_itemId: { characterId: character.id, itemId: item.id },
      },
    });

    if (!inventoryItem || inventoryItem.quantity < 1) {
      return res
        .status(400)
        .json({ message: "Item not available in inventory" });
    }

    await prisma.character.update({
      where: { id: character.id },
      data: {
        health: character.health + item.item_stat.health,
        power: character.power + item.item_stat.power,
      },
    });

    await prisma.characterItem.create({
      data: { characterId: character.id, itemId: item.id },
    });

    if (inventoryItem.quantity === 1) {
      await prisma.inventory.delete({ where: { id: inventoryItem.id } });
    } else {
      await prisma.inventory.update({
        where: { id: inventoryItem.id },
        data: { quantity: inventoryItem.quantity - 1 },
      });
    }

    res.json({ message: "Item equipped successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to equip item" });
  }
};
