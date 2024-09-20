import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import matchMiddleware from "../middlewares/match.middleware.js";

const env = process.env;
const router = express.Router();

/**
 * @desc 회원가입 API
 * @author 준호
 * @version 1.1
 *
 * 관리자 코드 추가, 관리자 코드는 선택적으로 요청
 * @author 준호
 * @since 1.1
 */
router.post("/sign-up", async (req, res, next) => {
  try {
    // 요청 본문값
    const {
      userId,
      password,
      passwordConfirm,
      userName,
      adminCode = null,
    } = req.body;

    // 관리자 코드 검증
    if (adminCode && adminCode !== env.ADMIN_CODE) {
      return res.status(400).json({ message: "코드가 올바르지 않습니다." });
    }

    // 관리자 코드가 일치하면 true 할당
    let isSuper = adminCode === env.ADMIN_CODE ? true : false;

    // 동일한 아이디, 닉네임 조회
    const isExistUserId = await prisma.account.findUnique({
      where: { userId },
    });
    const isExistUserName = await prisma.account.findUnique({
      where: { userName },
    });

    // 유효성 검사
    if (isExistUserId) {
      return res.status(409).json({ message: "이미 존재하는 아이디입니다." });
    }
    if (isExistUserName) {
      return res.status(409).json({ message: "이미 존재하는 닉네임입니다." });
    }
    if (password !== passwordConfirm) {
      return res.status(400).json({ message: "비밀번호를 확인해주세요." });
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 1);

    // account 테이블에 데이터 추가
    await prisma.account.create({
      data: { userId, userName, password: hashedPassword, super: isSuper },
    });

    return res.status(201).json({
      message: "회원가입이 완료되었습니다.",
      grade: isSuper ? "관리자 계정" : "일반 계정",
    });
  } catch (err) {
    console.log("회원가입 에러:", err);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

/**
 * @desc 로그인 API
 * @author 준호
 * @version 1.0
 */
router.post("/sign-in", async (req, res, next) => {
  try {
    // 요청 본문값
    const { userId, password } = req.body;

    // 유저 아이디 조회
    const user = await prisma.account.findUnique({
      where: { userId },
    });

    // 유효성 검사
    if (!user) {
      return res.status(401).json({ message: "존재하지 않는 아이디입니다." });
    }
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    // 토큰 발급
    const token = jwt.sign({ userId: user.userId }, env.JWT_KEY, {
      expiresIn: "30m",
    });
    res.setHeader("Authorization", `${env.JWT_KEY} ${token}`);

    return res.status(200).json({
      message: "로그인이 성공했습니다.",
    });
  } catch (err) {
    console.log(err);
  }
});

/**
 * @desc 캐시 구매 API
 * @author 준호
 * @version 1.0 트랙잭션 업데이트 필요
 */
router.patch("/cash", authMiddleware, async (req, res, next) => {
  try {
    // 요청 본문으로 받은 캐쉬값
    const { userCash } = req.body;

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

    // 트랜잭션 시작
    // 요청된 캐쉬 값 더하기
    const updatedCash = account.userCash + userCash;

    // 업데이트된 내용을 account 테이블에 저장
    const updatedAccount = await prisma.account.update({
      where: {
        userId: userId,
      },
      data: {
        userCash: updatedCash,
      },
    });
    // 트랜잭션 종료

    return res.status(200).json({
      message: "캐쉬 구매 완료~!",
      "현재 캐쉬": updatedAccount.userCash,
    });
  } catch (err) {
    console.error(err);
  }
});

/**
 * @desc 선수 뽑기 API
 * @author 준호
 * @version 1.0 트랜잭션 업데이트 필요
 *
 * 1. 미들웨어 거치고
 * 2. 가차 횟수를 요청받는다 --> N
 * 3. 돈 검사 N * 500
 * 3-1. character 테이블에서 랜덤한 캐릭터 N개를 뽑는다 트랜잭션 시작
 * 4. account의 userId / characterList에 업데이트 quantity ++
 * 4-1. 돈 차감 트랙잭션 끝
 * 5. 배열 형태로 response
 */
router.post("/character-draw", authMiddleware, async (req, res, next) => {
  try {
    const { drawCount } = req.body;

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

    // request 캐쉬 유효성 검사
    if (drawCount <= 0) {
      return res.status(400).json({ message: "올바른 값을 입력하세요." });
    }

    // 유저 캐쉬 확인
    if (account.userCash < drawCount * 500) {
      return res.status(402).json({ message: "캐시가 부족합니다." });
    }

    // 캐쉬 차감
    await prisma.account.update({
      where: { userId },
      data: { userCash: account.userCash - 500 * drawCount },
    });

    // 게임 모든 캐릭터 가져오기
    const allCharacters = await prisma.character.findMany();
    if (allCharacters.length === 0) {
      return res
        .status(404)
        .json({ message: "현재 캐릭터가 존재하지 않습니다." });
    }

    // 랜덤한 캐릭터 drawCount만큼 뽑기
    const drawnCharacters = [];
    for (let i = 0; i < drawCount; i++) {
      const randomIdx = Math.floor(Math.random() * allCharacters.length);
      drawnCharacters.push(allCharacters[randomIdx]);
    }

    // 뽑은 캐릭터 순회하며 기존 CharacterList에 있는지 검사
    for (const character of drawnCharacters) {
      const existingCharacter = await prisma.characterList.findFirst({
        where: {
          accountId: account.accountId,
          characterId: character.characterId,
        },
      });

      if (existingCharacter) {
        // 캐릭터가 이미 있으면 수량 증가
        await prisma.characterList.update({
          where: {
            characterListId: existingCharacter.characterListId,
          },
          data: {
            quantity: existingCharacter.quantity + 1,
          },
        });
      } else {
        // 캐릭터가 없으면 새로 추가
        await prisma.characterList.create({
          data: {
            accountId: account.accountId,
            characterId: character.characterId,
            quantity: 1,
          },
        });
      }
    }

    return res.status(200).json({
      message: "새로운 선수들이 감독님을 섬깁니다.",
      "뽑은 선수": drawnCharacters,
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/test", authMiddleware, matchMiddleware, async (req, res, next) => {
  return res.json({ message: "good" });
});

export default router;
