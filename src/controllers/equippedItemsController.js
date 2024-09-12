import prisma from '../prismaClient.js';

// 장착한 아이템 목록 조회 API
export const getEquippedItems = async (req, res) => {
  const { id } = req.params;

  try {
    // 해당 캐릭터가 장착한 아이템 목록을 조회
    const equippedItems = await prisma.characterItem.findMany({
      where: { characterId: parseInt(id) },
      include: { item: true },
    });

    // 장착된 아이템 목록을 필요한 형식으로 변환하여 응답
    const equippedResponse = equippedItems.map((eq) => ({
      item_code: eq.item.item_code,
      item_name: eq.item.item_name,
    }));

    res.json(equippedResponse);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: '장착한 아이템 목록을 불러오는 데 실패했습니다.' });
  }
};
