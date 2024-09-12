import prisma from '../prismaClient.js';

// 캐릭터 생성 API
export const createCharacter = async (req, res) => {
  const { name } = req.body;

  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '케릭터 생성에 실패했습니다.' });
  }
};

// 캐릭터 삭제 API
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
        .json({ message: '해당 케릭터를 삭제할 권환이 없습니다.' });
    }

    // 캐릭터 삭제
    await prisma.character.delete({
      where: { id: characterId },
    });

    res.json({ message: '케릭터가 삭제되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '케릭터 삭제에 실패해였습니다.' });
  }
};

// 게임 머니를 버는 API
export const earnMoney = async (req, res) => {
  const { id } = req.params; // 캐릭터 ID

  try {
    // 캐릭터 조회
    const character = await prisma.character.findUnique({
      where: { id: parseInt(id) },
    });

    if (!character) {
      return res.status(404).json({ message: '케릭터를 찾을 수 없습니다.' });
    }

    // 캐릭터의 게임 머니를 100원 증가
    const updatedCharacter = await prisma.character.update({
      where: { id: character.id },
      data: { money: character.money + 100 },
    });

    // 업데이트된 게임 머니를 반환
    res.json({ money: updatedCharacter.money });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '게임 머니 획득에 실패했습니다.' });
  }
};

// 캐릭터 상세 조회 API
export const getCharacterDetails = async (req, res) => {
  const { id } = req.params; // 조회할 캐릭터 ID
  const loggedInUserId = req.user ? req.user.userId : null; // JWT 인증된 사용자의 ID (로그인 안되었을 시 null)

  try {
    // 조회할 캐릭터 찾기
    const character = await prisma.character.findUnique({
      where: { id: parseInt(id) },
      include: { user: true }, // 캐릭터 소유자를 확인하기 위해 user 정보도 가져옵니다.
    });

    if (!character) {
      return res.status(404).json({ message: '케릭터를 찾을 수 없습니다.' });
    }

    // 소유자 확인 (로그인된 사용자와 캐릭터 소유자가 같은지 여부 판단)
    const isOwner = loggedInUserId && character.userId === loggedInUserId;

    // 다른 유저가 조회하거나 비로그인 시 (게임 머니 제외)
    if (!isOwner) {
      return res.json({
        name: character.name,
        health: character.health,
        power: character.power,
      });
    }

    // 소유자가 조회하는 경우 (게임 머니 포함)
    res.json({
      name: character.name,
      health: character.health,
      power: character.power,
      money: character.money, // 소유자만 게임 머니를 볼 수 있음
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '케릭터 정보를 조회하는데 실패했습니다.' });
  }
};
