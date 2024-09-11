import prisma from "../prismaClient.js";

// 장착한 아이템 목록 조회 API
export const getEquippedItems = async (req, res) => {
  const { id } = req.params;

  try {
    const equippedItems = await prisma.characterItem.findMany({
      where: { characterId: parseInt(id) },
      include: { item: true },
    });

    const equippedResponse = equippedItems.map((eq) => ({
      item_code: eq.item.item_code,
      item_name: eq.item.item_name,
    }));

    res.json(equippedResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get equipped items" });
  }
};
