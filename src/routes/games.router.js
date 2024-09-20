import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import matchMiddleware from "../middlewares/match.middleware.js";

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
    //유저 정보 체크
    if (!currentUserId) {
      return res
        .status(400)
        .json({ message: "현재 사용자 ID가 유효하지 않습니다." });
    }

    if (!userId || userId === null) {
      return res
        .status(400)
        .json({ message: "상대 사용자 ID가 유효하지 않습니다." });
    }
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
    //팀 구성 인원 체크
    currentUserCharacters.characters = currentUserCharacters.characters.filter(
      (character) => character.isFormation === true
    );

    enemyUserCharacters.characters = enemyUserCharacters.characters.filter(
      (character) => character.isFormation === true
    );

    if (currentUserCharacters.characters.length !== 3) {
      return res
        .status(400)
        .json({ message: "현재 사용자의 팀 구성원이 3명이 아닙니다." });
    }
    console.log(currentUserCharacters);

    if (enemyUserCharacters.characters.length !== 3) {
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

    // // 각 팀의 총 점수 계산
    // 현재 사용자의 캐릭터 ID 배열
    const currentUserCharacterIds = currentUserCharacters.characters.map(
      (char) => char.characterId
    );

    // 상대 사용자의 캐릭터 ID 배열
    const enemyUserCharacterIds = enemyUserCharacters.characters.map(
      (char) => char.characterId
    );

    // 각 팀의 캐릭터 정보 가져오기
    const [currentUserCharactersDetails, enemyUserCharactersDetails] =
      await Promise.all([
        prisma.character.findMany({
          where: { characterId: { in: currentUserCharacterIds } },
        }),
        prisma.character.findMany({
          where: { characterId: { in: enemyUserCharacterIds } },
        }),
      ]);

    // 점수 계산 함수
    function calculateScore(characters) {
      let totalScore = 0;
      for (let i = 0; i < characters.length; i++) {
        const score =
          characters[i].speed * statWeight.speed +
          characters[i].goalDetermination * statWeight.goalDetermination +
          characters[i].shootPower * statWeight.shootPower +
          characters[i].defense * statWeight.defense +
          characters[i].stamina * statWeight.stamina;
        totalScore += score;
      }
      return totalScore;
    }

    const scoreA = calculateScore(currentUserCharactersDetails); //현재 사용자의 팀 점수
    const scoreB = calculateScore(enemyUserCharactersDetails); //상대 사용자의 팀 점수
    //승패 결정
    const maxScore = scoreA + scoreB;
    const rendomWinner = Math.random() * maxScore; //팀 스탯 점수에 비례하여 승률확인
    let result;

    //무승부일 경우
    if (scoreA === scoreB) {
      //현재 사용자
      await prisma.account.update({
        where: { userId: currentUserId },
        data: { drowCount: { increment: 1 } },
      });
      //상대 사용자
      await prisma.account.update({
        where: { userId },
        data: { drowCount: { increment: 1 } },
      });
      return res.status(200).json({ message: "무승부 입니다!" });
    }

    if (rendomWinner < scoreA) {
      //현재 유저 승리 처리
      const aScore = Math.floor(Math.random() * 4) + 2;
      const bScore = Math.floor(Math.random() * Math.min(5, aScore)); //A스코어보다 작은값
      result = `${currentUserId}팀 승리: ${currentUserId} :${aScore} - ${bScore} : ${userId}`;

      //승리팀
      await prisma.account.update({
        where: { userId: currentUserId },
        data: {
          winCount: { increment: 1 },
        },
      });

      //패배팀
      await prisma.account.update({
        where: { userId },
        data: {
          loseCount: { increment: 1 },
        },
      });
    } else {
      //상대 유저 승리 처리
      const bScore = Math.floor(Math.random() * 4) + 2;
      const aScore = Math.floor(Math.random() * Math.min(5, bScore)); //B스코어보다 작은값
      result = `${userId}팀 승리: ${userId} :${bScore} - ${aScore} : ${currentUserId}`;

      //승리팀
      await prisma.account.update({
        where: { userId },
        data: {
          winCount: { increment: 1 },
        },
      });

      //패배팀
      await prisma.account.update({
        where: { userId: currentUserId },
        data: {
          loseCount: { increment: 1 },
        },
      });
    }
    //게임 결과를 응답으로 반환
    return res.status(200).json({ message: result });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

/**
 * @desc 랭크 게임 API
 *
 * @author 우종
 *
 * @abstract 매칭을 신청한 유저와 랜덤으로 매칭된 유저의 캐릭터 스텟을 비교하고 승/무/패 를 가려준다.
 */

router.post(
  "/games",
  authMiddleware,
  matchMiddleware,
  async (req, res, next) => {
    const currentUserId = req.user.userId;
    const enemyUserId = req.matchedUser;

    try {
      //현재 사용자의 캐릭터 정보
      const currentUserCharacters = await prisma.account.findFirst({
        where: { userId: currentUserId },
        include: { characters: true },
      });

      //현재 사용자 캐릭터 필터링
      const currentUserCharactersFilter =
        currentUserCharacters.characters.filter(
          (char) => char.isFormation === true
        );

      //현재 사용자 캐릭터 보유현황 체크
      if (currentUserCharacters.characters.length === 0) {
        return res.status(400).json({
          message: "상대 사용자가 캐릭터를 보유하고 있지 않습니다.",
        });
      }

      //현재 사용자 팀 구성 인원 체크
      if (currentUserCharactersFilter.length !== 3) {
        return res
          .status(400)
          .json({ message: "현재 사용자의 팀 구성원이 3명이 아닙니다." });
      }

      //상대 사용자의 캐릭터 정보

      const enemyUserCharacters = await prisma.account.findFirst({
        where: { userId: enemyUserId.userId },
        include: { characters: true },
      });

      //상대 사용자 캐릭터 필터
      const enemyUserCharactersFilter = enemyUserCharacters.characters.filter(
        (char) => char.isFormation === true
      );

      //상대 사용자 캐릭터 보유현황 체크

      if (enemyUserCharacters.characters.length === 0) {
        return res
          .status(400)
          .json({ message: "상대 사용자가 캐릭터를 보유하고 있지 않습니다." });
      }
      //상대 사용자 팀 구성 인원 체크
      if (enemyUserCharactersFilter.length !== 3) {
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
      // 현재 사용자의 캐릭터 ID 배열
      const currentUserCharacterIds = currentUserCharacters.characters.map(
        (char) => char.characterId
      );

      // 상대 사용자의 캐릭터 ID 배열
      const enemyUserCharacterIds = enemyUserCharacters.characters.map(
        (char) => char.characterId
      );

      // 각 팀의 캐릭터 정보 가져오기
      const [currentUserCharactersDetails, enemyUserCharactersDetails] =
        await Promise.all([
          prisma.character.findMany({
            where: { characterId: { in: currentUserCharacterIds } },
          }),
          prisma.character.findMany({
            where: { characterId: { in: enemyUserCharacterIds } },
          }),
        ]);

      // 점수 계산 함수
      function calculateScore(characters) {
        let totalScore = 0;
        for (let i = 0; i < characters.length; i++) {
          const score =
            characters[i].speed * statWeight.speed +
            characters[i].goalDetermination * statWeight.goalDetermination +
            characters[i].shootPower * statWeight.shootPower +
            characters[i].defense * statWeight.defense +
            characters[i].stamina * statWeight.stamina;
          totalScore += score;
        }
        return totalScore;
      }

      const scoreA = calculateScore(currentUserCharactersDetails); //현재 사용자의 팀 점수
      const scoreB = calculateScore(enemyUserCharactersDetails); //상대 사용자의 팀 점수
      //승패 결정
      const maxScore = scoreA + scoreB;
      const rendomWinner = Math.random() * maxScore; //팀 스탯 점수에 비례하여 승률확인
      let result;

      //무승부일 경우
      if (scoreA === scoreB) {
        //현재 사용자
        await prisma.account.update({
          where: { userId: currentUserId },
          data: { drowCount: { increment: 1 } },
        });
        //상대 사용자
        await prisma.account.update({
          where: { userId: enemyUserId.userId },
          data: { drowCount: { increment: 1 } },
        });
        return res.status(200).json({ message: "무승부 입니다!" });
      }

      if (rendomWinner < scoreA) {
        //현재 유저 승리 처리
        const aScore = Math.floor(Math.random() * 4) + 2;
        const bScore = Math.floor(Math.random() * Math.min(5, aScore)); //A스코어보다 작은값
        result = `${currentUserId}팀 승리: ${currentUserId} :${aScore} - ${bScore} : ${enemyUserId.userId}`;

        //사용자 게임 승률 OR 랭크 포인트 조정
        //승리팀
        await prisma.account.update({
          where: { userId: currentUserId },
          data: {
            winCount: { increment: 1 },

            rankPoint: { increment: 10 },
          },
        });

        //패배팀
        await prisma.account.update({
          where: { userId: enemyUserId.userId },
          data: {
            loseCount: { increment: 1 },
            rankPoint: { decrement: 10 },
          },
        });
      } else {
        //상대 유저 승리 처리
        const bScore = Math.floor(Math.random() * 4) + 2;
        const aScore = Math.floor(Math.random() * Math.min(5, bScore)); //B스코어보다 작은값
        result = `${enemyUserId.userId}팀 승리: ${enemyUserId.userId}:${bScore} - ${aScore} : ${currentUserId}`;

        //사용자 게임 승률 OR 랭크 포인트 조정
        //승리팀
        await prisma.account.update({
          where: { userId: enemyUserId.userId },
          data: {
            winCount: { increment: 1 },

            rankPoint: { increment: 10 },
          },
        });

        //패배팀
        await prisma.account.update({
          where: { userId: currentUserId },
          data: {
            loseCount: { increment: 1 },
            rankPoint: { decrement: 10 },
          },
        });
      }
      return res.status(200).json({ message: result });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
);
export default router;
