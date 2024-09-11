import prisma from "../prismaClient.js";

// 아이템 장착 API
export const equipItem = async (req, res) => {
  const { id } = req.params; // 캐릭터 ID
  const { item_code } = req.body; // 장착할 아이템 코드

  try {
    // 캐릭터 찾기
    const character = await prisma.character.findUnique({
      where: { id: parseInt(id) },
    });

    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }

    // 아이템 찾기
    const item = await prisma.item.findFirst({ where: { item_code } });
    if (!item) {
      return res.status(400).json({ message: "Item not found" });
    }

    // 인벤토리에서 해당 아이템 찾기
    const inventoryItem = await prisma.inventory.findFirst({
      where: {
        characterId: character.id,
        itemId: item.id,
      },
    });

    if (!inventoryItem || inventoryItem.quantity < 1) {
      return res
        .status(400)
        .json({ message: "Item not available in inventory" });
    }

    // 이미 장착된 아이템이 있는지 확인 (아이템 중복 장착 방지)
    const equippedItem = await prisma.characterItem.findFirst({
      where: {
        characterId: character.id,
        itemId: item.id,
      },
    });

    if (equippedItem) {
      return res.status(400).json({ message: "Item is already equipped" });
    }

    // 캐릭터 스탯 업데이트 (아이템 능력치 적용)
    await prisma.character.update({
      where: { id: character.id },
      data: {
        health: character.health + (item.item_stat.health || 0),
        power: character.power + (item.item_stat.power || 0),
      },
    });

    // 장착된 아이템을 캐릭터-아이템 테이블에 추가
    await prisma.characterItem.create({
      data: { characterId: character.id, itemId: item.id },
    });

    // 인벤토리 업데이트 (아이템 수량 감소 또는 삭제)
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

// 아이템 장착 해제 API
export const unequipItem = async (req, res) => {
  const { id } = req.params; // 캐릭터 ID
  const { item_code } = req.body; // 장착 해제할 아이템 코드

  try {
    // 캐릭터 찾기
    const character = await prisma.character.findUnique({
      where: { id: parseInt(id) },
    });

    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }

    // 아이템 찾기
    const item = await prisma.item.findFirst({ where: { item_code } });
    if (!item) {
      return res.status(400).json({ message: "Item not found" });
    }

    // 캐릭터가 해당 아이템을 장착하고 있는지 확인
    const equippedItem = await prisma.characterItem.findFirst({
      where: {
        characterId: character.id,
        itemId: item.id,
      },
    });

    if (!equippedItem) {
      return res.status(400).json({ message: "Item not equipped" });
    }

    // 캐릭터 스탯 업데이트 (아이템 능력치 제거)
    await prisma.character.update({
      where: { id: character.id },
      data: {
        health: character.health - (item.item_stat.health || 0),
        power: character.power - (item.item_stat.power || 0),
      },
    });

    // 장착 해제된 아이템을 인벤토리에 다시 추가
    const inventoryItem = await prisma.inventory.findFirst({
      where: {
        characterId: character.id,
        itemId: item.id,
      },
    });

    if (inventoryItem) {
      await prisma.inventory.update({
        where: { id: inventoryItem.id },
        data: { quantity: inventoryItem.quantity + 1 },
      });
    } else {
      await prisma.inventory.create({
        data: {
          characterId: character.id,
          itemId: item.id,
          quantity: 1,
        },
      });
    }

    // 캐릭터-아이템 테이블에서 해당 아이템 삭제 (장착 해제)
    await prisma.characterItem.delete({
      where: { id: equippedItem.id },
    });

    res.json({ message: "Item unequipped successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to unequip item" });
  }
};
