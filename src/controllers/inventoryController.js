import prisma from '../prismaClient.js';

// 인벤토리 조회 API
export const getInventory = async (req, res) => {
  const { id } = req.params;

  try {
    // 해당 캐릭터의 인벤토리 조회
    const inventory = await prisma.inventory.findMany({
      where: { characterId: parseInt(id) },
      include: { item: true },
    });

    // 인벤토리 데이터를 필요한 형식으로 변환하여 응답
    const inventoryResponse = inventory.map((inv) => ({
      item_code: inv.item.item_code,
      item_name: inv.item.item_name,
      count: inv.quantity,
    }));

    res.json(inventoryResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '인벤토리를 불러오는 데 실패했습니다.' });
  }
};
