import express from "express";
import { prisma } from "../utils/prisma/index.js";

const router = express.Router();

router.get("/rankPage", async (req, res, next) => {
  try {
    // 순위를 정렬 시키는 구문
    const ranking = await prisma.account.findMany({
      orderBy: {
        rankPoint: "desc", // 랭킹 내림차순 정렬
      },
      select: {
        userName: true,
        tier: true,
        winCount: true,
        drowCount: true,
        loseCount: true,
        rankPoint: true,
      },
    });

    // 순위 매기는 구문
    const rankList = ranking.map((account, index) => ({
      rank: index + 1, // 1부터 시작
      userName: account.userName,
      tier: account.tier,
      winCount: account.winCount,
      drowCount: account.drowCount,
      loseCount: account.loseCount,
      rankPoint: account.rankPoint,
    }));

    return res.status(200).json({ rankList });
  } catch (err) {
    next(err);
  }
});

export default router;
