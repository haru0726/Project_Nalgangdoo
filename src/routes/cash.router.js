import { prisma } from "../utils/prisma/index.js";
import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @desc 보유 캐시 확인 API
 *
 * @author 민석
 *
 * @abstract 사용자의 계정에 보유한 캐시를 확인합니다.
 */

// 보유 캐시 확인
router.get("/my-cash", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // 사용자의 계정을 찾기
    const account = await prisma.account.findUnique({
      where: { userId: userId },
      include: { characters: true }, // 필요에 따라 characters를 포함
    });

    if (!account) {
      return res.status(404).json({ message: "계정을 찾을 수 없습니다." });
    }

    // 보유 캐시 포맷
    const cash = account.userCash.toLocaleString();
    return res.status(200).json({ message: `보유 캐시 : ${cash}원 입니다.` });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

export default router;