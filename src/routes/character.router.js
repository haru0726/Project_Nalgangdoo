import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";
const router = express.Router();
/**
 * @desc 선수 전체 목록 조회 API
 *
 * @author 우종
 *
 * @abstract 게임에 있는 모든 선수의 목록을 보여준다.
 */
router.get("/character", async (req, res, next) => {
  try {
    const character = await prisma.character.findMany({
      select: {
        name: true,
      },
    });
    return res.status(200).json(character);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

/**
 * @desc 선수 상세 조회 API
 *
 * @author 우종
 *
 * @abstract 게임에 있는 모든 선수중 원하는 캐릭터의 이름 스탯 등의 상세 정보를 보여준다.
 */

router.get("/character/:characterId", async (req, res, next) => {
  try {
    const { characterId } = req.params;
    const character = await prisma.character.findFirst({
      where: { characterId: parseInt(characterId, 10) },
      select: {
        name: true,
        speed: true,
        goalDetermination: true,
        shootPower: true,
        defense: true,
        stamina: true,
      },
    });
    if (!character) {
      return res.status(404).json({ message: "선수를 찾을 수 없습니다." });
    }
    return res.status(200).json(character);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

/**
 * @desc 캐릭터 생성 API
 * @author 준호
 * @version 1.0
 *
 * 별도의 인가 과정을 통해 관리자인지 확인하면 좋겠다.
 */
router.post("/character-data", authMiddleware, async (req, res, next) => {
  try {
    // 요청 받은 캐릭터 정보
    const { name, speed, goalDetermination, shootPower, defense, stamina } =
      req.body;

    // 인증 미들웨어에서 받은 유저 아이디
    const { userId } = req.user;

    // 유저 아이디 조회
    const account = await prisma.account.findUnique({
      where: {
        userId: userId,
      },
    });
    if (!account) {
      return res.status(404).json({ message: "존재하지 않는 계정입니다." });
    }

    // 관리자 인가
    if (!account.super) {
      return res.status(403).json({ message: "관리자 권한이 필요합니다." });
    }

    // 필수 필드
    const requiredFields = [
      name,
      speed,
      goalDetermination,
      shootPower,
      defense,
      stamina,
    ];
    // 기존 캐릭터 이름 조회
    const isExistCharacterName = await prisma.character.findUnique({
      where: { name },
    });

    // 유효성 검사
    const missingFields = requiredFields.filter((field) => !field);
    if (missingFields.length > 0) {
      return res.status(400).json({ message: "필드가 누락되었습니다." });
    }
    if (isExistCharacterName) {
      return res.status(409).json({ message: "이미 존재하는 이름입니다." });
    }

    // character 테이블에 요청 받은 캐릭터 추가
    await prisma.character.create({
      data: { name, speed, goalDetermination, shootPower, defense, stamina },
    });

    return res.status(201).json({ message: "캐릭터가 생성되었습니다." });
  } catch (err) {
    console.log(err);
  }
});

export default router;
