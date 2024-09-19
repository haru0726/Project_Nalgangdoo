import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma/index.js";

const env = process.env;
const router = express.Router();

/**
 * @desc 회원가입 API
 * @author 준호
 * @version 1.0
 *
 * ~ 업데이트 내역
 * @since 1.1
 * @author ㅇㄴㅇ
 *
 * ~ 업데이트 내역
 * @since 1.2
 * @authorㅇㄴㅇ
 */
router.post("/sign-up", async (req, res, next) => {
  try {
    // 요청 본문값
    const { userId, password, passwordConfirm, userName } = req.body;

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
      data: { userId, userName, password: hashedPassword },
    });

    return res.status(201).json({ message: "회원가입이 완료되었습니다." });
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
    const token = jwt.sign({ userId: user.userId }, env.JWT_TOKEN_SECRETKEY, {
      expiresIn: "30m",
    });
    res.setHeader("Authorization", `Bearer ${token}`);
    console.log(token);
    return res.status(200).json({ message: "로그인이 성공했습니다." });
  } catch (err) {
    console.log(err);
  }
});

export default router;
