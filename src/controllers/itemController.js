import prisma from "../prismaClient.js";

// 아이템 생성 API
export const createItem = async (req, res) => {
  const { item_code, item_name, item_stat, item_price } = req.body;
  const item = await prisma.item.create({
    data: { item_code, item_name, item_stat, item_price },
  });
  res.status(201).json(item);
};

// 아이템 수정 API (아이템 가격은 수정할 수 없도록 제한)
export const updateItem = async (req, res) => {
  const { id } = req.params;
  const { item_name, item_stat } = req.body;

  try {
    // 기존 아이템 정보를 먼저 조회하여 가격을 유지
    const existingItem = await prisma.item.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    // 가격은 수정하지 않고, 이름과 능력치만 업데이트
    const updatedItem = await prisma.item.update({
      where: { id: parseInt(id) },
      data: { item_name, item_stat },
    });

    res.json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update item" });
  }
};

// 아이템 조회 API
export const getItem = async (req, res) => {
  const { id } = req.params;
  const item = await prisma.item.findUnique({ where: { id: parseInt(id) } });
  res.json(item);
};

// 전체 아이템 목록 조회 API
export const getItems = async (req, res) => {
  const items = await prisma.item.findMany();
  res.json(items);
};
