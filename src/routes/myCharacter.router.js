import express from "express";
import { prisma } from "../utils/prisma/index.js";

const router = express.Router();

// URL 파라미터로 사용자 ID를 받아 캐릭터 조회
router.get("/myCharacter/:userId", async (req, res, next) => {
  const { userId } = req.params;

  try {
    // 사용자 ID로 Account 조회
    // prisma.account.findUnique를 사용하여 데이터베이스에서 특정 userId를 가진 계정을 조회합니다.
    // include: { characters: true }는 해당 계정의 캐릭터 목록도 함께 가져온다.
    const account = await prisma.account.findUnique({
      where: { userId: userId },
      include: {
        characters: true, // CharacterList에서 관련된 캐릭터 정보를 포함
      },
    });

    // 계정이 존재하지 않거나 목록이 비어있으면 메시지 반환
    if (!account || account.characters.length === 0) {
      return res.status(404).json({ message: "캐릭터가 없습니다." });
    }

    // 캐릭터 ID로 캐릭터 이름 조회
    const characterIds = account.characters.map((item) => item.characterId);
    const characters = await prisma.character.findMany({
      where: {
        characterId: { in: characterIds },
      },
      select: {
        characterId: true,
        name: true,
        speed : true,
      },
    });

    // 캐릭터 목록 생성
    const myCharacter = account.characters.map((item) => {
      const character = characters.find(
        (c) => c.characterId === item.characterId
      );
      return {
        name: character ? character.name : "Unknown",
        quantity: item.quantity,
        speed : character.speed,
      };
    });

    return res.status(200).json(myCharacter);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

export default router;
