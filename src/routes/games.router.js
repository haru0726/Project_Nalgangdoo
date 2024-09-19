import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @desc 친선 게임 API
 *
 * @author 우종
 *
 * @abstract 매칭을 신청한 유저와 상대방의 팀 구성을 가져와서 스텟을 비교후 승/패를 결정지어주고 결과를 보여준다.
 */

router.post("/games/:userId", authMiddleware, async (req, res, next) => {
  const { userId } = req.params;
  const currentUserId = req.user.userId; //jwt에서 추출한 사용자 ID

  try {
    //현재 사용자의 캐릭터 가져오기
    const currentUserCharacters = await prisma.account.findFirst({
      where: { userId: currentUserId },
      include: { characters: true },
    });

    //상대 사용자의 캐릭터 가져오기
    const enemyUserCharacters = await prisma.account.findFirst({
      where: { userId },
      include: { characters: true },
    });

    //유저 정보 체크
    if (!currentUserId) {
      return res
        .status(400)
        .json({ message: "현재 사용자 ID가 유효하지 않습니다." });
    }

    if (!userId) {
      return res
        .status(400)
        .json({ message: "상대 사용자 ID가 유효하지 않습니다." });
    }
    //팀 구성 인원 체크

    if (currentUserCharacters.length !== 3) {
      return res
        .status(400)
        .json({ message: "현재 사용자의 팀 구성원이 3명이 아닙니다." });
    }

    if (enemyUserCharacters.length !== 3) {
      return res
        .status(400)
        .json({ message: "상대 사용자의 팀 구성원이 3명이 아닙니다." });
    }

    //스텟 가중치
    const statWeight = {
      speed: 0.1,
      goalDetermination: 0.2,
      shootPower: 0.15,
      defense: 0.4,
      stamina: 0.2,
    };

    // 각 팀의 총 점수 계산

    const calculateScore = (characters) => {
      return characters.reduce((totalScore, character) => {
        const stats = character.characterRelation; //캐릭터의 스탯 정보
        const score =
          stats.speed * statWeight.speed +
          stats.goalDetermination * statWeight.goalDetermination +
          stats.shootPower * statWeight.shootPower +
          stats.defense * statWeight.defense +
          stats.stamina * statWeight.stamina;
        return totalScore + score;
      }, 0);
    };

    const scoreA = calculateScore(currentUserCharacters); //현재 사용자의 팀 점수
    const scoreB = calculateScore(enemyUserCharacters); //상대 사용자의 팀 점수
    //승패 결정
    const maxScore = scoreA + scoreB;
    const rendomWinner = Math.random() * maxScore; //팀 스탯 점수에 비례하여 승률확인
    let result;

    if (rendomWinner < scoreA) {
      //현재 유저 승리 처리
      const aScore = Math.floor(Math.random() * 6) + 2;
      const bScore = Math.floor(Math.random() * Math.min(5, aScore)); //A스코어보다 작은값
      result = `A팀 승리: A${aScore} - ${bScore}B`;
    } else {
      //상대 유저 승리 처리
      const bScore = Math.floor(Math.random() * 6) + 2;
      const aScore = Math.floor(Math.random() * Math.min(5, bScore)); //B스코어보다 작은값
      result = `B팀 승리: B${bScore} - ${aScore}A`;
    }
    //게임 결과를 응답으로 반환
    return res.status(200).json({ message: result });
  } catch (err) {
    return res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
});

export default router;
