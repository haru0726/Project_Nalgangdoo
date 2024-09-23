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
 * @version 1.1
 *
 * 선수 등급 요청 추가, 생략 시 기본 4성
 * @author 준호
 * @since 1.1
 *
 * 별도의 인가 과정을 통해 관리자인지 확인하면 좋겠다.
 */
router.post("/character-data", authMiddleware, async (req, res, next) => {
  try {
    // 요청 받은 캐릭터 정보
    const {
      name,
      speed,
      goalDetermination,
      shootPower,
      defense,
      stamina,
      star = 4,
    } = req.body;

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
    // 유효한 star 값
    const validStars = [4, 5, 100];

    // 유효성 검사
    const missingFields = requiredFields.filter((field) => !field);
    if (missingFields.length > 0) {
      return res.status(400).json({ message: "필드가 누락되었습니다." });
    }
    if (isExistCharacterName) {
      return res.status(409).json({ message: "이미 존재하는 이름입니다." });
    }
    if (!validStars.includes(star)) {
      return res
        .status(400)
        .json({ message: "star 필드는 4, 5, 100만 입력할 수 있습니다." });
    }

    // character 테이블에 요청 받은 캐릭터 추가
    await prisma.character.create({
      data: {
        name,
        speed,
        goalDetermination,
        shootPower,
        defense,
        stamina,
        star,
      },
    });

    return res.status(201).json({ message: "캐릭터가 생성되었습니다." });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

/**
 * @desc 선수 강화 API
 * @author 준호
 * @version 1.0
 *
 * @todo
 * 1. [완료] 레벨 기본값은 0, 강화에 성공하면 +1, 최대 레벨은 5
 * 2. [완료] 강화에 필요한 재화는 동일한 선수. 필요한 선수 개수는 (레벨 * 2), 강화 성공/실패 상관없이 재료는 차감
 *    예) 레벨 4에서 5로 강화 시, 4 * 2 = 8개 선수. 레벨 0에서는 1개만 필요한 것으로 처리
 *    **주의** 강화하는 선수도 개수에 포함되므로 (강화 재료 개수 + 1) 해서 처리해야 됩니다.
 * 3. [완료] 강화 확률은 [1 - (레벨 * 0.1)] => 레벨이 증가함에 따라 확률이 줄어든다.
 *    0.1 보정값은 밸런스에 따라 조정
 * 4. 장기백(천장). 강화에 10번 실패하면 다음 강화는 무조건 성공.
 *    강화 성공 시천장 카운트는 0으로 초기화. 기본값 0
 * 5. [완료] 유효성 검사. 레벨 5일 때, 강화에 필요한 카드가 없을 시 status 400 반환.
 * 6. 기타... 트랜잭션 처리 / 참조 - CharacterList 테이블 / 강화 레벨 - level 컬럼, 천장 수치 - ceilng 컬럼
 */
router.patch("/character-enhance", authMiddleware, async (req, res, next) => {
  try {
    // 요청 받은 강화할 캐릭터 이름
    const { name } = req.body;

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

    // 요청 받은 캐릭터 이름으로 Character 테이블에서 조회
    const character = await prisma.character.findUnique({
      where: { name },
    });
    if (!character) {
      return res.status(404).json({ message: "존재하지 않는 캐릭터입니다." });
    }

    // CharacterList에서 accountId와 characterId로 캐릭터 조회
    const hasCharacter = await prisma.characterList.findFirst({
      where: {
        accountId: account.accountId,
        characterId: character.characterId,
      },
    });
    if (!hasCharacter) {
      return res.status(404).json({ message: "보유한 선수가 없습니다." });
    }

    // hasCharacter 데이터 예시
    // {
    //   characterListId: 5,
    //   accountId: 1,
    //   characterId: 1,
    //   quantity: 82,
    //   isFormation: false,
    //   level: 0,
    //   ceiling: 0
    // }

    const currentLevel = hasCharacter.level; // 요청한 캐릭터의 레벨
    const currentCeiling = hasCharacter.ceiling; // 요청한 캐릭터의 천장 수치
    const characterQuantity = hasCharacter.quantity; // 요청한 캐릭터 보유 개수

    // 유효성 검사
    if (currentLevel >= 10) {
      return res.status(400).json({ message: "최대 레벨입니다." });
    }
    if (characterQuantity < currentLevel * 1 + 1) {
      return res.status(400).json({
        message: "재료가 충분하지 않습니다.",
        need: currentLevel * 1,
        current: characterQuantity - 1,
      });
    }

    // 강화 시작
    const successEnhance = 1 - currentLevel * 0.1; // 강화 성공 확률

    // 재료 차감
    await prisma.characterList.update({
      where: {
        characterListId: hasCharacter.characterListId,
      },
      data: { quantity: characterQuantity - currentLevel },
    });

    // 강화 성공 여부
    const isSuccess = Math.random() <= successEnhance;

    if (isSuccess) {
      // 강화 성공, 레벨 +1, 천장 수치 0으로 초기화
      await prisma.characterList.update({
        where: {
          characterListId: hasCharacter.characterListId,
        },
        data: { level: currentLevel + 1, ceiling: 0 },
      });
    } else {
      // 강화 실패, 천장 수치 +1
      await prisma.characterList.update({
        where: {
          characterListId: hasCharacter.characterListId,
        },
        data: { ceiling: currentCeiling + 1 },
      });
    }
    //천장수치가 10일경우 다음강화 무조건 성공
    if (currentCeiling === 10) {
      await prisma.characterList.update({
        where: { characterListId: hasCharacter.characterListId },
        data: { level: currentLevel + 1, ceiling: 0 },
      });

      return res.status(200).json({ message: "강화 성공!" });
    }

    return res.status(200).json({
      message: isSuccess ? "강화 성공!" : "강화 실패...",
      level: isSuccess ? currentLevel + 1 : currentLevel,
      ceiling: isSuccess ? 0 : currentCeiling + 1,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

export default router;
