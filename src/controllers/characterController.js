import prisma from "../prismaClient.js";

export const createCharacter = async (req, res) => {
  const { name } = req.body;
  const character = await prisma.character.create({
    data: {
      name,
      health: 500,
      power: 100,
      money: 10000,
      userId: req.user.userId, // JWT에서 userId를 가져옵니다.
    },
  });
  res.status(201).json(character);
};

export const deleteCharacter = async (req, res) => {
  const characterId = parseInt(req.params.id);
  const userId = req.user.userId; // JWT에서 userId를 가져옴

  try {
    // 캐릭터가 사용자의 소유인지 확인
    const character = await prisma.character.findUnique({
      where: { id: characterId },
    });

    if (!character || character.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this character" });
    }

    // 캐릭터 삭제
    await prisma.character.delete({
      where: { id: characterId },
    });

    res.json({ message: "Character deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Character deletion failed" });
  }
};

export const getCharacter = async (req, res) => {
  const characterId = parseInt(req.params.id);
  const character = await prisma.character.findUnique({
    where: { id: characterId },
  });
  res.json(character);
};
