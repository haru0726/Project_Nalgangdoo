import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

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

    const requiredFields = [
      name,
      speed,
      goalDetermination,
      shootPower,
      defense,
      stamina,
    ];
    const isExistCharacterName = await prisma.account.findUnique({
      where: { name },
    });

    // 유효성 검사
    const missingFields = requiredFields.filter((field) => !field);
    if (missingFields.length) {
      return res.status(400).json({
        message: "다음 필드가 누락되었습니다: " + missingFields.join(", "),
      });
    }
    if (isExistCharacterName) {
      return res.status(409).json({ message: "이미 존재하는 이름입니다." });
    }
  } catch (err) {
    console.log(err);
  }
});
