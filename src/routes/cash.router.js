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

    // 현재 로그인한 유저정보 값 가져오기 
    const account = await prisma.account.findUnique({
      where: { userId },
    });

    // 보유 캐시 확인
    const cash = account.userCash.toLocaleString();
    return res.status(200).json({ message: `보유 캐시 : ${cash}원 입니다.` });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

export default router;