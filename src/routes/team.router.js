import { prisma } from "../utils/prisma/index.js";
import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @desc 팀 구성 api
 *
 * @author 민석
 *
 * @abstract 팀편성 및 팀원 변경
 * 1. 계정내 보유한 캐릭터로 3명의 팀원을 구성하여 하나의 팀을 만든다
 * 2. 구성된 3명의 팀원이 마음에 안든다면 보유한 캐릭터중에서 변경이 가능하게 만든다.
 * 3. 자신이 로그인한 아이디에 보유한 캐릭터인지 유효성 검사
 * 4. 미들웨어에서 받아온 아이디가 실제로 데이터 베이스에 있는지 확인.
 * 5. 새롭게 팀원 변경된 캐릭터는 false 에서 ture 값으로 변경
 * 6. 팀 해제된 캐릭터는 다시 변경시에는 true 값에서 false
 */

// 팀편성 및 팀원 변경
router.post("/team", authMiddleware, async (req, res, next) => {
  try {
    const { TeamMembers } = req.body;

    // 요청 유효성 검사
    if (!Array.isArray(TeamMembers) || TeamMembers.length !== 3) {
      return res.status(400).json({ message: "팀원은 3명이어야 합니다." });
    }

    const userId = req.user.userId;
    const account = await prisma.account.findUnique({
      where: { userId: userId },
      include: { characters: true },
    });

    const names = TeamMembers.map((member) => member.name);
    const reqcharacters = await prisma.character.findMany({
      where: {
        name: {
          in: names,
        },
      },
    });

    // 요청한 캐릭터 이름을 배열로 추출
    const reqCharacterNames = reqcharacters.map((character) => character.name);

    // 유저가 보유한 캐릭터만 필터링
    const ownedCharacterIds = account.characters.map(
      (character) => character.characterId
    ); // 보유한 캐릭터 ID 배열
    const validCharacters = reqcharacters.filter((character) =>
      ownedCharacterIds.includes(character.characterId)
    ); // 유효한 캐릭터 필터링

    if (validCharacters.length !== 3) {
      return res
        .status(404)
        .json({ message: "보유한 캐릭터 중 3명을 선택해야 합니다." });
    }

    // 모든 캐릭터의 isFormation 값을 false로 설정
    await prisma.characterList.updateMany({
      where: {
        accountId: account.accountId,
        isFormation: true,
      },
      data: {
        isFormation: false,
      },
    });

    // 선택된 캐릭터의 isFormation 값을 true로 설정
    await prisma.characterList.updateMany({
      where: {
        accountId: account.accountId,
        characterId: {
          in: validCharacters.map((character) => character.characterId),
        },
      },
      data: {
        isFormation: true,
      },
    });

    return res.status(200).json({
      message: "팀원 편성을 완료했습니다.",
      member1: reqCharacterNames[1],
      member2: reqCharacterNames[2],
      member3: reqCharacterNames[0],
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

export default router;
