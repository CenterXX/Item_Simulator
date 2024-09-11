import prisma from "../prismaClient.js";

// 인벤토리 조회 API
export const getInventory = async (req, res) => {
  const { id } = req.params;

  try {
    const inventory = await prisma.inventory.findMany({
      where: { characterId: parseInt(id) },
      include: { item: true },
    });

    const inventoryResponse = inventory.map((inv) => ({
      item_code: inv.item.item_code,
      item_name: inv.item.item_name,
      count: inv.quantity,
    }));

    res.json(inventoryResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get inventory" });
  }
};
