import prisma from '../prismaClient.js';

// 아이템 판매 API
export const sellItems = async (req, res) => {
  const { id } = req.params; // 캐릭터 ID
  const itemsToSell = req.body; // 판매할 아이템 목록

  try {
    // 캐릭터 조회
    const character = await prisma.character.findUnique({
      where: { id: parseInt(id) },
    });

    if (!character) {
      return res.status(404).json({ message: '캐릭터를 찾을 수 없습니다.' });
    }

    let totalGain = 0;

    // 판매할 아이템 처리
    for (let sell of itemsToSell) {
      const { item_code, count } = sell;

      // 아이템 조회
      const item = await prisma.item.findUnique({ where: { item_code } });

      if (!item) {
        return res
          .status(400)
          .json({
            message: `아이템 코드 ${item_code}에 해당하는 아이템을 찾을 수 없습니다.`,
          });
      }

      // 인벤토리에서 판매할 아이템 조회
      const inventoryItem = await prisma.inventory.findUnique({
        where: {
          characterId_itemId: { characterId: character.id, itemId: item.id },
        },
      });

      if (!inventoryItem || inventoryItem.quantity < count) {
        return res.status(400).json({ message: '판매할 아이템이 부족합니다.' });
      }

      // 아이템 판매 금액 계산 (60% 정산)
      totalGain += Math.floor(item.item_price * 0.6) * count;

      // 판매 후 아이템 수량 업데이트 또는 삭제
      if (inventoryItem.quantity === count) {
        await prisma.inventory.delete({ where: { id: inventoryItem.id } });
      } else {
        await prisma.inventory.update({
          where: { id: inventoryItem.id },
          data: { quantity: inventoryItem.quantity - count },
        });
      }
    }

    // 캐릭터의 돈 업데이트
    const updatedCharacter = await prisma.character.update({
      where: { id: character.id },
      data: { money: character.money + totalGain },
    });

    res.json({ money: updatedCharacter.money });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '아이템 판매에 실패했습니다.' });
  }
};
