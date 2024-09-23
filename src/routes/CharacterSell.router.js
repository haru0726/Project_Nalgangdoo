import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// 캐릭터 판매 API
router.post("/sell", authMiddleware, async (req, res) => {
  const { characterName, quantity } = req.body;
  const userId = req.user.userId; // JWT에서 추출한 userId

  if (!userId) {
    return res
      .status(401)
      .json({ message: "사용자 인증 실패. 로그인 해주세요." });
  }

  // 입력 검증
  if (!characterName || quantity <= 0) {
    return res.status(400).json({ message: "잘못된 입력입니다." });
  }

  try {
    // Account 조회
    const account = await prisma.account.findUnique({
      where: { userId: userId },
    });

    if (!account) {
      return res.status(404).json({ message: "계정을 찾을 수 없습니다." });
    }

    // Character 테이블에서 이름으로 캐릭터 조회
    const character = await prisma.character.findUnique({
      where: { name: characterName },
    });

    if (!character) {
      return res.status(404).json({ message: "캐릭터를 찾을 수 없습니다." });
    }

    // CharacterList에서 캐릭터 조회
    const characterListEntry = await prisma.characterList.findFirst({
      where: {
        accountId: account.accountId,
        characterId: character.characterId,
      },
    });

    if (!characterListEntry || characterListEntry.quantity < quantity) {
      return res
        .status(400)
        .json({ message: "보유한 캐릭터 수량이 부족합니다." });
    }

    // 캐릭터 판매 로직
    const sellingPrice = 1000; // 예시 판매가
    const newQuantity = characterListEntry.quantity - quantity;

    // Account의 cash 업데이트
    await prisma.account.update({
      where: { userId: userId },
      data: {
        userCash: {
          increment: sellingPrice * quantity,
        },
      },
    });

    // CharacterList 업데이트
    if (newQuantity > 0) {
      await prisma.characterList.update({
        where: { characterListId: characterListEntry.characterListId },
        data: { quantity: newQuantity },
      });
    } else {
      // 수량이 0이면 CharacterList에서 삭제
      await prisma.characterList.delete({
        where: { characterListId: characterListEntry.characterListId },
      });
    }

    return res
      .status(200)
      .json({
        message: "캐릭터 판매 완료.",
        data: { characterName, quantity },
      });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

export default router;
