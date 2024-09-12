import prisma from '../prismaClient.js';

// 아이템 구입 API
export const purchaseItems = async (req, res) => {
  const { id } = req.params; // 캐릭터 ID
  const itemsToPurchase = req.body; // 구입할 아이템 목록

  try {
    // 캐릭터 찾기
    const character = await prisma.character.findUnique({
      where: { id: parseInt(id) },
    });

    if (!character) {
      return res.status(404).json({ message: '캐릭터를 찾을 수 없습니다.' });
    }

    let totalPrice = 0;
    const inventoryUpdates = [];

    for (let purchase of itemsToPurchase) {
      const { item_code, count } = purchase;
      // 아이템 찾기
      const item = await prisma.item.findFirst({ where: { item_code } });

      if (!item) {
        return res
          .status(400)
          .json({
            message: `아이템 코드 ${item_code}에 해당하는 아이템을 찾을 수 없습니다.`,
          });
      }

      // 총 가격 계산
      totalPrice += item.item_price * count;
      inventoryUpdates.push({
        characterId: character.id,
        itemId: item.id,
        quantity: count, // 여기에서 item_count 대신 quantity 사용
      });
    }

    // 돈이 부족한 경우
    if (totalPrice > character.money) {
      return res
        .status(400)
        .json({ message: '구입할 아이템에 필요한 금액이 부족합니다.' });
    }

    // 캐릭터의 돈 업데이트
    const updatedCharacter = await prisma.character.update({
      where: { id: character.id },
      data: { money: character.money - totalPrice },
    });

    // 인벤토리 업데이트
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
    res.status(500).json({ message: '아이템 구입에 실패했습니다.' });
  }
};
